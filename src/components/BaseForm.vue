<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { supabase } from '@/lib/supabase'

import { Input } from '@/components/ui/input'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Card, CardContent } from '@/components/ui/card'
import { PlusCircle, Image as ImageIcon, CheckCircle2, AlertTriangle, Loader2 } from 'lucide-vue-next'

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
    return baseLink.value.trim() && 
           baseType.value && 
           baseLevel.value && 
           baseImage.value &&
           !hasSpacesInLink.value &&
           isValidLink.value
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
function validateLink(): string | null {
    if (!baseLink.value.trim()) {
        return 'El enlace es requerido.'
    }
    
    if (hasSpacesInLink.value) {
        return 'El enlace no puede contener espacios.'
    }
    
    if (!isValidLink.value) {
        return 'El enlace debe ser un link válido de Clash of Clans.'
    }
    
    return null
}

function validateType(): string | null {
    if (!baseType.value) {
        return 'El tipo de base es requerido.'
    }
    return null
}

function validateLevel(): string | null {
    if (!baseLevel.value) {
        return 'El nivel TH es requerido.'
    }
    const level = Number(baseLevel.value)
    if (level < 1 || level > 18) {
        return 'El nivel TH debe estar entre 1 y 18.'
    }
    return null
}

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

// Verificar si la imagen ya existe (por nombre y características)
async function checkDuplicateImage(): Promise<string | null> {
    if (!baseImage.value) return null
    
    try {
        // Verificar si ya existe una imagen con las mismas características
        const { data: existingImages, error: imageError } = await supabase
            .from('bases')
            .select('id, url_foto')
            .like('url_foto', `%${baseImage.value.name.split('.')[0]}%`)
            .limit(1)

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

// Generar nombre único para archivo (patrón timestamp simple)
function generateUniqueFileName(file: File): string {
    const timestamp = Date.now()
    const fileExt = file.name.split('.').pop()
    return `${timestamp}.${fileExt}`
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

// Forzar estilos globales para selects
onMounted(() => {
    const style = document.createElement('style')
    style.textContent = `
        [data-radix-select-content] {
            z-index: 99999 !important;
            position: fixed !important;
        }
        [data-radix-popper-content-wrapper] {
            z-index: 99999 !important;
        }
        .radix-select-content {
            z-index: 99999 !important;
        }
    `
    document.head.appendChild(style)
})

// Submit principal con todas las validaciones
async function handleSubmit() {
    // Limpiar mensajes previos
    errorMessage.value = ''
    successMessage.value = ''
    
    // Validación 1: Campos vacíos
    const linkError = validateLink()
    if (linkError) {
        errorMessage.value = linkError
        return
    }
    
    const typeError = validateType()
    if (typeError) {
        errorMessage.value = typeError
        return
    }
    
    const levelError = validateLevel()
    if (levelError) {
        errorMessage.value = levelError
        return
    }
    
    const imageError = validateImage()
    if (imageError) {
        errorMessage.value = imageError
        return
    }
    
    loading.value = true
    
    try {
        // Validación 2: Link duplicado
        const duplicateLinkError = await checkExistingLink()
        if (duplicateLinkError) {
            errorMessage.value = duplicateLinkError
            return
        }
        
        // Validación 3: Imagen duplicada
        const duplicateImageError = await checkDuplicateImage()
        if (duplicateImageError) {
            errorMessage.value = duplicateImageError
            return
        }
        
        // Extraer ID del enlace
        const url = new URL(baseLink.value)
        const baseId = url.searchParams.get('id')
        if (!baseId) {
            errorMessage.value = 'No se pudo extraer el ID del enlace.'
            return
        }
        
        // Subir imagen con nombre único directamente en la raíz del bucket
        const fileName = generateUniqueFileName(baseImage.value!)
        
        const { error: uploadError } = await supabase.storage
            .from('bases-fotos')
            .upload(fileName, baseImage.value, {
                cacheControl: '3600', // 1 hora de caché
                upsert: false // No sobreescribir
            })

        if (uploadError) {
            console.error('Error subiendo imagen:', uploadError)
            errorMessage.value = 'Error al subir la imagen. Intenta con otra.'
            return
        }

        // Obtener URL pública
        const { data: urlData } = supabase.storage
            .from('bases-fotos')
            .getPublicUrl(fileName)

        // Guardar en base de datos
        const { error: insertError } = await supabase.from('bases').insert({
            link: baseLink.value.trim(),
            type: baseType.value,
            level_th: Number(baseLevel.value),
            url_foto: urlData.publicUrl,
            created_at: new Date().toISOString()
        })

        if (insertError) {
            console.error('Error guardando en BD:', insertError)
            errorMessage.value = 'Error al guardar la base. Intenta nuevamente.'
            
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
    } finally {
        loading.value = false
    }
}
</script>

<template>
    <Card class="w-full bg-zinc-950 border border-zinc-800 rounded-[2.5rem] shadow-2xl">
        <CardContent class="space-y-8 p-8">
            <!-- Link Input -->
            <div class="space-y-2">
                <label for="link" class="text-[11px] font-black uppercase tracking-[0.2em] text-zinc-500">Link *</label>
                <div class="relative">
                    <Input 
                        id="link"
                        placeholder="https://link.clashofclans.com/..." 
                        v-model="baseLink"
                        :class="[
                            'h-12 rounded-2xl bg-zinc-900 border-zinc-800 text-white placeholder:text-zinc-500 focus-visible:ring-yellow-500/40',
                            hasSpacesInLink ? 'border-red-500 focus-visible:ring-red-500/30' : ''
                        ]"
                    />
                    <div class="absolute right-2 top-1/2 -translate-y-1/2">
                        <AlertTriangle v-if="hasSpacesInLink" class="w-4 h-4 text-red-500" />
                        <CheckCircle2 v-else-if="isValidLink && baseLink.trim()" class="w-4 h-4 text-yellow-500" />
                    </div>
                </div>
                <p class="text-xs font-bold uppercase tracking-widest text-zinc-500">
                    Ingresa el enlace compartido de Clash of Clans (sin espacios)
                </p>
            </div>

            <!-- Selects -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <!-- Select de Tipo -->
                <div class="space-y-2">
                    <label for="type" class="text-[11px] font-black uppercase tracking-[0.2em] text-zinc-500">Categoría *</label>
                    <Select v-model="baseType">
                        <SelectTrigger class="h-12 rounded-2xl bg-zinc-900 border border-zinc-800 text-white">
                            <SelectValue placeholder="Tipo de Unidad" />
                        </SelectTrigger>
                        <SelectContent class="z-[9999] bg-zinc-950 border border-zinc-800 text-white" data-select-content>
                            <SelectItem value="Guerra">Guerra</SelectItem>
                            <SelectItem value="Liga">Liga</SelectItem>
                            <SelectItem value="Mejora">Mejora</SelectItem>
                            <SelectItem value="Recursos">Recursos</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <!-- Select de Nivel -->
                <div class="space-y-2">
                    <label for="level" class="text-[11px] font-black uppercase tracking-[0.2em] text-zinc-500">Nivel *</label>
                    <Select v-model="baseLevel">
                        <SelectTrigger class="h-12 rounded-2xl bg-zinc-900 border border-zinc-800 text-white">
                            <SelectValue placeholder="Nivel TH" />
                        </SelectTrigger>
                        <SelectContent class="z-[9999] bg-zinc-950 border border-zinc-800 text-white" data-select-content>
                            <SelectItem v-for="n in 18" :key="n" :value="String(n)">
                                TH {{ n }}
                            </SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <!-- Upload Imagen -->
            <div class="space-y-2">
                <label class="text-[11px] font-black uppercase tracking-[0.2em] text-zinc-500">Fotografía *</label>
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
                        class="flex flex-col items-center justify-center border-2 border-dashed border-zinc-800 rounded-[2rem] p-8 text-center cursor-pointer bg-zinc-900/40 hover:bg-zinc-900/60 hover:border-yellow-500/40 transition-all"
                        :class="loading ? 'opacity-50 cursor-not-allowed' : ''"
                    >
                        <ImageIcon class="w-8 h-8 text-zinc-500 mb-3" />
                        <p class="text-sm font-black italic tracking-tighter text-white uppercase">Subir Captura</p>
                        <p class="text-xs font-bold uppercase tracking-widest text-zinc-500 mt-2">
                            JPG, PNG, WebP • Max 5MB
                        </p>
                    </label>
                    
                    <!-- Estado con imagen preview -->
                    <div v-else class="relative">
                        <div class="relative w-full overflow-hidden rounded-[2rem] border border-zinc-800 bg-zinc-900">
                            <img 
                                :src="previewUrl" 
                                class="w-full h-56 object-cover" 
                                alt="Preview de la captura"
                            />
                            <!-- Overlay para cambiar imagen -->
                            <label 
                                for="fileInModal"
                                class="absolute inset-0 bg-zinc-950/70 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
                                :class="loading ? 'pointer-events-none' : ''"
                            >
                                <div class="text-center text-white">
                                    <p class="text-sm font-black uppercase tracking-widest">Cambiar Fotografía</p>
                                </div>
                            </label>
                        </div>
                        
                        <!-- Botón eliminar -->
                        <button 
                            v-if="!loading"
                            @click.stop="removeImage"
                            class="absolute -top-2 -right-2 h-8 w-8 rounded-full bg-zinc-950 text-zinc-400 flex items-center justify-center hover:bg-red-600 hover:text-white transition-all border border-zinc-800"
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
                class="w-full h-[52px] rounded-full bg-yellow-500 text-zinc-950 font-black uppercase tracking-[0.15em] text-[11px] hover:bg-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
                :disabled="loading || !isFormValid" 
                @click="handleSubmit"
            >
                <div v-if="!loading" class="flex items-center justify-center gap-2">
                    <span>Guardar</span>
                    <PlusCircle class="w-4 h-4" />
                </div>
                <div v-else class="flex items-center justify-center gap-2">
                    <Loader2 class="w-4 h-4 animate-spin" />
                    <span>Procesando...</span>
                </div>
            </button>

            <!-- Feedback States -->
            <div class="space-y-2">
                <!-- Estado de éxito -->
                <div v-if="successMessage"
                    class="flex items-center gap-3 p-4 rounded-2xl bg-zinc-900 border border-yellow-500/20 text-white">
                    <CheckCircle2 class="w-5 h-5 shrink-0 text-yellow-500" />
                    <p class="text-sm font-bold uppercase tracking-widest">
                        {{ successMessage }}
                    </p>
                </div>

                <!-- Estado de error -->
                <div v-if="errorMessage"
                    class="flex items-center gap-3 p-4 rounded-2xl bg-zinc-900 border border-red-500/30 text-white">
                    <AlertTriangle class="w-5 h-5 shrink-0 text-red-500" />
                    <p class="text-sm font-bold uppercase tracking-widest">
                        {{ errorMessage }}
                    </p>
                </div>
            </div>
        </CardContent>
    </Card>
</template>

<style scoped>
/* Asegurar que los selects se muestren sobre el modal */
:deep([data-radix-select-content]) {
    z-index: 9999 !important;
    position: fixed !important;
}

:deep([data-radix-select-viewport]) {
    z-index: 9999 !important;
}

/* Target directo con data attribute */
:deep([data-select-content]) {
    z-index: 9999 !important;
    position: fixed !important;
}

/* Forzar el portal content */
:deep([data-radix-popper-content-wrapper]) {
    z-index: 9999 !important;
}

/* Solución global - targeting todos los select contents */
:deep(div[data-radix-select-content]) {
    z-index: 9999 !important;
}
</style>
