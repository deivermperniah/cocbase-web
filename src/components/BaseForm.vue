<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { supabase } from '@/lib/supabase'

import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { PlusCircle, Image as ImageIcon, CheckCircle2, AlertTriangle, Loader2, Plus } from 'lucide-vue-next'

const emit = defineEmits(['success'])

// Estado del formulario
const baseLink = ref('')
const baseType = ref('')
const baseLevel = ref('')
const baseImage = ref<File | null>(null)
const previewUrl = ref<string | null>(null)

// Estados de UI
const loading = ref(false)
const successMessage = ref('')
const errorMessage = ref('')

// Validaciones reactivas
const isFormValid = computed(() => {
    const isLevel3 = baseLevel.value === '3'
    const linkValid = isLevel3 ? true : (baseLink.value.trim() && !hasSpacesInLink.value && isValidLink.value)
    
    return linkValid && 
           baseType.value && 
           baseLevel.value && 
           baseImage.value
})

const hasSpacesInLink = computed(() => /\s/.test(baseLink.value))

const isValidLink = computed(() => {
    try {
        const url = new URL(baseLink.value)
        return url.hostname.includes('link.clashofclans.com') && 
               url.searchParams.has('id')
    } catch {
        return false
    }
})

// Validadores específicos
function validateImage(): string | null {
    if (!baseImage.value) {
        return 'La imagen es requerida.'
    }
    
    // Validar tipo de archivo
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(baseImage.value.type)) {
        return 'Solo se permiten imágenes JPG, PNG o WebP.'
    }
    
    // Validar tamaño (5MB máximo)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (baseImage.value.size > maxSize) {
        return 'La imagen no puede superar los 5MB.'
    }
    
    return null
}

// Verificar si el link ya existe
async function checkExistingLink(): Promise<string | null> {
    if (baseLevel.value === '3' && !baseLink.value.trim()) return null
    
    try {
        const url = new URL(baseLink.value)
        const baseId = url.searchParams.get('id')
        
        if (!baseId) {
            return 'No se pudo extraer el ID del enlace.'
        }
        
        const normalizedLink = baseLink.value.trim()
        const idToken = baseId.split(':').pop() || baseId

        const { data: existingBases, error: selectError } = await supabase
            .from('bases')
            .select('id, link')
            .or(`link.eq.${normalizedLink},link.ilike.%${idToken}%`)
            .limit(50)

        if (selectError) {
            console.error('Error verificando link existente:', selectError)
            return 'Error al verificar el enlace.'
        }
        
        if (existingBases && existingBases.length > 0) {
            const hasDuplicate = existingBases.some((b) => {
                if (!b?.link) return false
                if (b.link === normalizedLink) return true

                try {
                    const existingUrl = new URL(b.link)
                    const existingId = existingUrl.searchParams.get('id')
                    return existingId === baseId
                } catch {
                    return false
                }
            })

            if (hasDuplicate) {
                return 'Esta base ya fue guardada anteriormente.'
            }
        }
        
        return null
    } catch (error) {
        console.error('Error en checkExistingLink:', error)
        return 'Error al validar el enlace.'
    }
}

// Verificar si ya existe el mismo archivo en Storage.
async function checkDuplicateImage(fileName: string): Promise<string | null> {
    try {
        const { data: existingImages, error: imageError } = await supabase.storage
            .from('bases-fotos')
            .list('', { search: fileName, limit: 1 })

        if (imageError) {
            console.error('Error verificando imagen duplicada:', imageError)
            return null // No bloquear por error en verificación
        }
        
        if (existingImages && existingImages.length > 0) {
            return 'Esta imagen ya fue subida anteriormente.'
        }
        
        return null
    } catch (error) {
        console.error('Error en checkDuplicateImage:', error)
        return null // No bloquear por error en verificación
    }
}

async function optimizeImage(file: File): Promise<File> {
    try {
        const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' })

        const maxDimension = 1920
        const scale = Math.min(1, maxDimension / Math.max(bitmap.width, bitmap.height))
        const width = Math.round(bitmap.width * scale)
        const height = Math.round(bitmap.height * scale)

        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height

        const context = canvas.getContext('2d')
        if (!context) {
            bitmap.close()
            return file
        }

        context.imageSmoothingEnabled = true
        context.imageSmoothingQuality = 'high'
        context.drawImage(bitmap, 0, 0, width, height)
        bitmap.close()

        const blob = await new Promise<Blob | null>((resolve) => {
            canvas.toBlob(resolve, 'image/webp', 0.85)
        })

        if (!blob || blob.size >= file.size) return file

        const baseName = file.name.replace(/\.[^.]+$/, '')
        return new File([blob], `${baseName}.webp`, { type: 'image/webp' })
    } catch (error) {
        console.error('Error optimizando imagen:', error)
        return file
    }
}

async function generateFileName(file: File): Promise<string> {
    const fileBuffer = await file.arrayBuffer()
    const digest = await crypto.subtle.digest('SHA-256', fileBuffer)
    const hash = Array.from(new Uint8Array(digest))
        .map((byte) => byte.toString(16).padStart(2, '0'))
        .join('')
    const fileExt = file.name.split('.').pop()
    return `${hash.slice(0, 8)}.${fileExt}`
}

// Manejo de archivos
function handleFileChange(event: Event) {
    const target = event.target as HTMLInputElement
    const file = target.files?.[0]
    
    if (file) {
        // Primero asignar el archivo
        baseImage.value = file
        
        // Luego validar
        const imageError = validateImage()
        if (imageError) {
            errorMessage.value = imageError
            baseImage.value = null // Limpiar si hay error
            return
        }
        
        // Si es válido, crear preview
        previewUrl.value = URL.createObjectURL(file)
        errorMessage.value = '' // Limpiar error de imagen si era válido
    }
}

function removeImage() {
    // Limpiar el object URL para evitar memory leaks
    if (previewUrl.value) {
        URL.revokeObjectURL(previewUrl.value)
    }
    
    baseImage.value = null
    previewUrl.value = null
    errorMessage.value = '' // Limpiar errores relacionados con imagen
}

// Reset del formulario
function resetForm() {
    // Limpiar el object URL si existe
    if (previewUrl.value) {
        URL.revokeObjectURL(previewUrl.value)
    }
    
    baseLink.value = ''
    baseType.value = ''
    baseLevel.value = ''
    baseImage.value = null
    previewUrl.value = null
    errorMessage.value = ''
    successMessage.value = ''
}


// Limpiar link si se selecciona nivel 3
watch(() => baseLevel.value, (newLevel) => {
    if (newLevel === '3') {
        baseLink.value = ''
    }
})

// Submit principal con todas las validaciones
async function handleSubmit() {
    // Limpiar mensajes previos
    errorMessage.value = ''
    successMessage.value = ''
    
    loading.value = true
    
    try {
        // Validación 2: Link duplicado (Verificación en servidor)
        const duplicateLinkError = await checkExistingLink()
        if (duplicateLinkError) {
            errorMessage.value = duplicateLinkError
            loading.value = false
            setTimeout(() => { if (errorMessage.value === duplicateLinkError) errorMessage.value = '' }, 2000)
            return
        }

        const optimizedFile = await optimizeImage(baseImage.value!)
        const fileName = await generateFileName(optimizedFile)
        
        // Validación 3: Imagen duplicada
        const duplicateImageError = await checkDuplicateImage(fileName)
        if (duplicateImageError) {
            errorMessage.value = duplicateImageError
            loading.value = false
            setTimeout(() => { if (errorMessage.value === duplicateImageError) errorMessage.value = '' }, 2000)
            return
        }
        
        // Subir imagen con nombre único directamente en la raíz del bucket
        const { error: uploadError } = await supabase.storage
            .from('bases-fotos')
            .upload(fileName, optimizedFile, {
                cacheControl: '3600', // 1 hora de caché
                upsert: false // No sobreescribir
            })

        if (uploadError) {
            console.error('Error subiendo imagen:', uploadError)
            errorMessage.value = 'Error al subir la imagen. Intenta con otra.'
            loading.value = false
            setTimeout(() => { if (errorMessage.value === 'Error al subir la imagen. Intenta con otra.') errorMessage.value = '' }, 2000)
            return
        }

        // Obtener URL pública
        const { data: urlData } = supabase.storage
            .from('bases-fotos')
            .getPublicUrl(fileName)

        // Guardar en base de datos
        const { error: insertError } = await supabase.from('bases').insert({
            link: baseLink.value.trim() || null,
            type: baseType.value,
            level_th: Number(baseLevel.value),
            url_foto: urlData.publicUrl,
            created_at: new Date().toISOString()
        })

        if (insertError) {
            console.error('Error guardando en BD:', insertError)
            errorMessage.value = 'Error al guardar la base. Intenta nuevamente.'
            loading.value = false
            setTimeout(() => { if (errorMessage.value === 'Error al guardar la base. Intenta nuevamente.') errorMessage.value = '' }, 2000)
            
            // Intentar eliminar la imagen subida si falló la BD
            try {
                await supabase.storage.from('bases-fotos').remove([fileName])
            } catch (cleanupError) {
                console.error('Error limpiando imagen:', cleanupError)
            }
            return
        }

        // Éxito
        successMessage.value = '¡Base registrada exitosamente!'
        
        // Reset después de éxito
        setTimeout(() => {
            emit('success')
            resetForm()
        }, 2000)

    } catch (error: any) {
        console.error('Error general en handleSubmit:', error)
        errorMessage.value = error.message || 'Error inesperado. Intenta nuevamente.'
        setTimeout(() => { errorMessage.value = '' }, 2000)
    } finally {
        loading.value = false
    }
}
</script>

<template>
    <div class="space-y-4">
        <!-- Selects -->
        <div class="grid grid-cols-2 gap-4">
            <!-- Select de Nivel -->
            <div class="flex flex-col">
                <label for="level" class="text-[11px] font-black uppercase tracking-[0.2em] text-zinc-500 mb-2">Nivel *</label>
                <Select v-model="baseLevel">
                    <SelectTrigger class="h-[44px] rounded-xl bg-zinc-900 border border-zinc-800 text-white">
                        <SelectValue placeholder="Selecciona" />
                    </SelectTrigger>
                    <SelectContent side="bottom" :side-offset="4" :avoid-collisions="false" class="z-[9999] bg-zinc-950 border border-zinc-800 text-white mt-1" data-select-content>
                        <SelectItem v-for="n in 16" :key="n + 2" :value="String(n + 2)">
                            Nivel {{ n + 2 }}
                        </SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <!-- Select de Tipo -->
            <div class="flex flex-col">
                <label for="type" class="text-[11px] font-black uppercase tracking-[0.2em] text-zinc-500 mb-2">Categoría *</label>
                <Select v-model="baseType">
                    <SelectTrigger class="h-[44px] rounded-xl bg-zinc-900 border border-zinc-800 text-white">
                        <SelectValue placeholder="Selecciona" />
                    </SelectTrigger>
                    <SelectContent side="bottom" :side-offset="4" :avoid-collisions="false" class="z-[9999] bg-zinc-950 border border-zinc-800 text-white mt-1" data-select-content>
                        <SelectItem value="Guerra">Guerra</SelectItem>
                        <SelectItem value="Liga">Liga</SelectItem>
                        <SelectItem value="Mejora">Mejora</SelectItem>
                        <SelectItem value="Recursos">Recursos</SelectItem>
                    </SelectContent>
                </Select>
            </div>
        </div>

        <!-- Link Input -->
        <div v-if="baseLevel !== '3'" class="flex flex-col">
            <label for="link" class="text-[11px] font-black uppercase tracking-[0.2em] text-zinc-500 mb-2">
                Link *
            </label>
            <div class="relative">
                <Input 
                    id="link"
                    placeholder="https://link.clashofclans.com/..." 
                    v-model="baseLink"
                    :class="[
                        'h-[44px] rounded-xl bg-zinc-900 border-zinc-800 text-white placeholder:text-zinc-500 focus-visible:ring-yellow-500/40 pr-10',
                        hasSpacesInLink ? 'border-red-500 focus-visible:ring-red-500/30' : ''
                    ]"
                />
                <div class="absolute right-2 top-1/2 -translate-y-1/2 flex items-center pr-1">
                    <button 
                        v-if="baseLink" 
                        @click="baseLink = ''"
                        type="button"
                        class="cursor-pointer p-1 rounded-lg text-zinc-500 hover:text-white transition-colors"
                    >
                        <Plus class="w-4 h-4 rotate-45" />
                    </button>
                </div>
            </div>
        </div>

        <!-- Upload Imagen -->
        <div class="flex flex-col">
            <label class="text-[11px] font-black uppercase tracking-[0.2em] text-zinc-500 mb-2">Fotografía *</label>
            <div class="relative">
                <input 
                    type="file" 
                    accept="image/*" 
                    class="hidden" 
                    id="fileInModal" 
                    @change="handleFileChange"
                    :disabled="loading"
                />
                
                <!-- Estado sin imagen -->
                <label 
                    v-if="!previewUrl" 
                    for="fileInModal"
                    class="flex flex-col items-center justify-center border-2 border-dashed border-zinc-800 rounded-2xl p-4 text-center cursor-pointer bg-zinc-900/40 hover:bg-zinc-900/60 hover:border-yellow-500/40 transition-all"
                    :class="loading ? 'opacity-50 cursor-not-allowed' : ''"
                >
                    <ImageIcon class="w-6 h-6 text-zinc-500 mb-2" />
                    <p class="text-xs font-black italic tracking-tighter text-white uppercase">Subir Captura</p>
                    <p class="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mt-1">
                        JPG, PNG, WebP • Max 5MB
                    </p>
                </label>
                
                <!-- Estado con imagen preview -->
                <div v-else class="relative">
                    <div class="relative w-full overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900">
                        <img 
                            :src="previewUrl" 
                            class="w-full h-40 object-cover" 
                            alt="Preview de la captura"
                        />
                        <!-- Overlay para cambiar imagen -->
                        <label 
                            for="fileInModal"
                            class="absolute inset-0 bg-zinc-950/70 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
                            :class="loading ? 'pointer-events-none' : ''"
                        >
                            <div class="text-center text-white">
                                <p class="text-xs font-black uppercase tracking-widest">Cambiar Fotografía</p>
                            </div>
                        </label>
                    </div>
                    
                    <!-- Botón eliminar -->
                    <button 
                        v-if="!loading"
                        @click.stop="removeImage"
                        class="absolute -top-2 -right-2 h-8 w-8 cursor-pointer rounded-full bg-zinc-950 text-zinc-400 flex items-center justify-center hover:bg-red-600 hover:text-white transition-all border border-zinc-800"
                    >
                        <PlusCircle class="w-3 h-3 rotate-45" />
                    </button>
                    
                    <!-- Información del archivo -->
                    <div class="mt-3 text-xs font-bold uppercase tracking-widest text-zinc-500">
                        {{ baseImage?.name }}
                    </div>
                </div>
            </div>
        </div>

        <!-- Botón de Envío -->
        <button
            class="w-full h-[44px] cursor-pointer rounded-full bg-yellow-500 text-zinc-950 font-black uppercase tracking-[0.15em] text-[10px] hover:bg-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 shadow-xl shadow-yellow-500/10"
            :disabled="loading || !isFormValid" 
            @click="handleSubmit"
        >
            <div v-if="!loading" class="flex items-center justify-center gap-2">
                <PlusCircle class="w-4 h-4" />
                <span>Guardar</span>
            </div>
            <div v-else class="flex items-center justify-center gap-2">
                <Loader2 class="w-4 h-4 animate-spin" />
                <span>Procesando...</span>
            </div>
        </button>

        <!-- Feedback States -->
        <div v-if="successMessage || errorMessage" class="space-y-2">
            <!-- Estado de éxito -->
            <div v-if="successMessage"
                class="flex items-center gap-3 p-3 rounded-xl bg-zinc-900 border border-yellow-500/20 text-white">
                <CheckCircle2 class="w-4 h-4 shrink-0 text-yellow-500" />
                <p class="text-xs font-bold uppercase tracking-widest">
                    {{ successMessage }}
                </p>
            </div>

            <!-- Estado de error -->
            <div v-if="errorMessage"
                class="flex items-center gap-3 p-3 rounded-xl bg-zinc-900 border border-red-500/30 text-white">
                <AlertTriangle class="w-4 h-4 shrink-0 text-red-500" />
                <p class="text-xs font-bold uppercase tracking-widest">
                    {{ errorMessage }}
                </p>
            </div>
        </div>
    </div>
</template>

