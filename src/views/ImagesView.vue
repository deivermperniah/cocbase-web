<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { supabase } from '@/lib/supabase'
import { Trash2, ExternalLink, AlertTriangle, Image as ImageIcon, HardDrive } from 'lucide-vue-next'
import LoadingSpinner from '@/components/LoadingSpinner.vue'

interface Img {
  name: string
  path: string
  url: string
  size?: number
}

const images = ref<Img[]>([])
const loading = ref(true)
const totalSize = ref(0)
const deleteModal = ref<{
  isOpen: boolean
  imagePath: string | null
  imageName: string | null
}>({
  isOpen: false,
  imagePath: null,
  imageName: null
})

// 👇 RAÍZ DEL BUCKET
const FOLDER = ''

async function loadImages() {
  loading.value = true
  images.value = []
  totalSize.value = 0

  const { data, error } = await supabase.storage
    .from('bases-fotos')
    .list(FOLDER, {
      limit: 100,
      sortBy: { column: 'created_at', order: 'desc' }
    })

  if (error) {
    console.error('❌ ERROR LISTANDO STORAGE:', error)
    loading.value = false
    return
  }

  for (const file of data) {
    if (!file.name.match(/\.(jpg|jpeg|png|webp)$/i)) continue

    const fullPath = file.name // 👈 SIN public/

    const { data: publicUrl } = supabase.storage
      .from('bases-fotos')
      .getPublicUrl(fullPath)

    images.value.push({
      name: file.name,
      path: fullPath,
      url: publicUrl.publicUrl,
      size: file.metadata?.size
    })

    // Acumular tamaño total
    if (file.metadata?.size) {
      totalSize.value += file.metadata.size
    }
  }

  loading.value = false
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 MB'
  const mb = bytes / (1024 * 1024)
  return mb.toFixed(2)
}

function openDeleteModal(imagePath: string, imageName: string) {
  deleteModal.value = {
    isOpen: true,
    imagePath,
    imageName
  }
}

function closeDeleteModal() {
  deleteModal.value = {
    isOpen: false,
    imagePath: null,
    imageName: null
  }
}

async function confirmDelete() {
  if (!deleteModal.value.imagePath) return

  const { error } = await supabase.storage
    .from('bases-fotos')
    .remove([deleteModal.value.imagePath])

  if (error) {
    console.error('❌ ERROR ELIMINANDO:', error)
    return
  }

  // Restar tamaño del archivo eliminado
  const deletedImage = images.value.find(img => img.path === deleteModal.value.imagePath)
  if (deletedImage?.size) {
    totalSize.value -= deletedImage.size
  }

  images.value = images.value.filter(img => img.path !== deleteModal.value.imagePath)
  closeDeleteModal()
}

onMounted(loadImages)
</script>

<template>
  <!-- Loading State Centralizado -->
  <div v-if="loading" class="fixed inset-0 z-[100] flex items-center justify-center bg-zinc-950/80 backdrop-blur-sm md:pl-20">
    <LoadingSpinner size="lg" />
  </div>

  <div v-else class="space-y-4">
    <!-- Premium Header -->
    <div class="flex flex-row items-center justify-between gap-6">
      <div class="space-y-1">
        <h2 class="text-xl font-black italic tracking-tighter uppercase text-zinc-950 dark:text-white">
          Imágenes
        </h2>
      </div>
      
      <!-- Estadísticas -->
      <div class="flex gap-4 sm:gap-6">
        <div class="flex items-center gap-2">
          <ImageIcon class="w-4 h-4 text-zinc-500" />
          <span class="text-yellow-500 text-sm font-black italic tracking-tighter">{{ images.length }}</span>
        </div>
        <div class="flex items-center gap-2">
          <HardDrive class="w-4 h-4 text-zinc-500" />
          <span class="text-yellow-500 text-sm font-black italic tracking-tighter">{{ formatBytes(totalSize) }} MB</span>
        </div>
      </div>
    </div>

    <!-- Images Grid -->
    <div class="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div v-if="images.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div v-for="img in images" :key="img.path"
          class="group relative overflow-hidden bg-zinc-950 shadow-2xl transition-all hover:ring-2 hover:ring-yellow-500/50 rounded-[2.5rem]">

          <!-- Image Container -->
          <div class="aspect-video relative overflow-hidden bg-zinc-900">
            <img :src="img.url"
              class="block w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />

            <!-- Overlay Táctico -->
            <div
              class="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent opacity-60 group-hover:opacity-40 transition-opacity">
            </div>
          </div>

          <div class="p-4">
            <div class="flex items-center justify-between gap-3">
              <h3
                class="text-sm font-black italic tracking-tighter text-white uppercase group-hover:text-yellow-500 transition-colors leading-none truncate flex-1" :title="img.name">
                {{ img.name }}
              </h3>

              <div class="flex gap-2">
                <a :href="img.url" target="_blank"
                  class="p-2.5 rounded-xl bg-zinc-900 text-zinc-400 hover:bg-yellow-500 hover:text-zinc-950 transition-all border border-zinc-800">
                  <ExternalLink class="w-4 h-4" />
                </a>
                <button @click="openDeleteModal(img.path, img.name)"
                  class="p-2.5 rounded-xl bg-zinc-900 text-zinc-400 hover:bg-red-600 hover:text-white transition-all border border-zinc-800">
                  <Trash2 class="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="flex flex-col items-center justify-center py-32 bg-zinc-950 rounded-[3rem] border border-zinc-800 space-y-6">
        <div class="h-20 w-20 rounded-3xl bg-zinc-900 flex items-center justify-center border border-zinc-800">
          <AlertTriangle class="h-10 w-10 text-zinc-700" />
        </div>
        <div class="text-center space-y-2">
          <p class="text-white font-black italic text-2xl uppercase tracking-tighter">Sin imágenes en storage</p>
          <p class="text-zinc-500 text-sm font-bold uppercase tracking-widest">No hay archivos para mostrar</p>
        </div>
      </div>
    </div>

    <!-- Modal de Confirmación de Eliminación -->
    <Teleport to="body">
      <div v-if="deleteModal.isOpen" class="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-zinc-950/90 backdrop-blur-xl" @click="closeDeleteModal"></div>

        <div
          class="relative bg-zinc-950 w-full max-w-md rounded-[2.5rem] shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-red-500/20 animate-in zoom-in-95 duration-300">
          <div class="p-8 space-y-6">
            <!-- Header del Modal -->
            <div class="text-center space-y-4">
              <div class="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mx-auto border border-red-500/20">
                <Trash2 class="w-8 h-8 text-red-500" />
              </div>
              <div>
                <h3 class="text-xl font-black italic text-white uppercase tracking-tighter">Confirmar Eliminación</h3>
                <p class="text-zinc-500 text-sm mt-2">
                  Esta acción no se puede deshacer
                </p>
              </div>
            </div>

            <!-- Información del archivo -->
            <div class="bg-zinc-900 rounded-2xl p-4 border border-zinc-800">
              <p class="text-zinc-400 text-xs font-black uppercase tracking-widest mb-2">Archivo a eliminar:</p>
              <p class="text-white font-medium truncate">
                {{ deleteModal.imageName }}
              </p>
            </div>

            <!-- Botones de Acción -->
            <div class="flex gap-4">
              <button @click="closeDeleteModal"
                class="flex-1 h-12 rounded-xl bg-zinc-900 text-zinc-400 font-black uppercase tracking-widest text-xs hover:bg-zinc-800 transition-all border border-zinc-800">
                Cancelar
              </button>
              <button @click="confirmDelete"
                class="flex-1 h-12 rounded-xl bg-red-600 text-white font-black uppercase tracking-widest text-xs hover:bg-red-700 transition-all">
                Eliminar
              </button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>
