<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, computed, watch } from "vue";
import { supabase } from "@/lib/supabase";
import { Plus, ExternalLink, Trash2, Filter, X, ZoomIn, ZoomOut, Shield, Castle, CalendarDays, Sword, Trophy, Hammer } from "lucide-vue-next";
import BaseForm from "@/components/BaseForm.vue";
import LoadingSpinner from "@/components/LoadingSpinner.vue";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const allBases = ref<any[]>([]);
const loading = ref(true);
const isModalOpen = ref(false);
const isFilterModalOpen = ref(false);

const deleteModal = ref({
  isOpen: false,
  baseId: null as number | null,
  baseTitle: "",
});

const imageViewer = ref({
  isOpen: false,
  url: "",
  title: "",
  level: "",
  type: "",
  date: "",
  scale: 1,
  x: 0,
  y: 0,
});

const isDraggingImage = ref(false);
const dragStart = ref({ x: 0, y: 0 });
const imageViewport = ref<HTMLElement | null>(null);

const selectedLevel = ref<string>("all");
const selectedType = ref<string>("all");
const types = ["Guerra", "Liga", "Mejora", "Recursos"];

const tempLevel = ref<string>("all");
const tempType = ref<string>("all");

function getTypeIcon(type: string) {
  if (type === "Guerra") return Sword;
  if (type === "Liga") return Trophy;
  if (type === "Mejora") return Hammer;
  return Shield;
}

function openFilterModal() {
  tempLevel.value = selectedLevel.value;
  tempType.value = selectedType.value;
  isFilterModalOpen.value = true;
}

function applyFilters() {
  selectedLevel.value = tempLevel.value;
  selectedType.value = tempType.value;
  isFilterModalOpen.value = false;
}

function clearFilters() {
  selectedLevel.value = "all";
  selectedType.value = "all";
  tempLevel.value = "all";
  tempType.value = "all";
}

const filteredBases = computed(() => {
  if (!allBases.value) return [];
  return allBases.value.filter((base) => {
    const matchesLevel = selectedLevel.value === "all" || String(base.level_th) === selectedLevel.value;
    const matchesType = selectedType.value === "all" || base.type === selectedType.value;
    return matchesLevel && matchesType;
  });
});

async function fetchBases() {
  try {
    const { data, error } = await supabase
      .from("bases")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    allBases.value = data || [];
  } catch (error) {
    console.error("Error fetching bases:", error);
  } finally {
    loading.value = false;
  }
}

function openDeleteModal(base: any) {
  deleteModal.value = {
    isOpen: true,
    baseId: base.id,
    baseTitle: `#${base.id} - Nivel ${base.level_th} - ${base.type}`,
  };
}

function closeDeleteModal() {
  deleteModal.value = {
    isOpen: false,
    baseId: null,
    baseTitle: "",
  };
}

function openImageViewer(base: any) {
  imageViewer.value = {
    isOpen: true,
    url: base.url_foto,
    title: `Base #${base.id} - Nivel ${base.level_th} - ${base.type}`,
    level: String(base.level_th),
    type: base.type,
    date: new Date(base.created_at).toLocaleDateString("es-ES"),
    scale: 1,
    x: 0,
    y: 0,
  };
}

function closeImageViewer() {
  imageViewer.value = {
    isOpen: false,
    url: "",
    title: "",
    level: "",
    type: "",
    date: "",
    scale: 1,
    x: 0,
    y: 0,
  };
  isDraggingImage.value = false;
}

function zoomImage(amount: number) {
  const scale = Math.min(3, Math.max(0.5, imageViewer.value.scale + amount));
  imageViewer.value.scale = scale;
  if (scale <= 1) {
    imageViewer.value.x = 0;
    imageViewer.value.y = 0;
  } else {
    clampImagePosition();
  }
}

function clampImagePosition() {
  const viewport = imageViewport.value;
  if (!viewport || imageViewer.value.scale <= 1) return;

  const { width, height } = viewport.getBoundingClientRect();
  const maxX = width * (imageViewer.value.scale - 1) / 2;
  const maxY = height * (imageViewer.value.scale - 1) / 2;

  imageViewer.value.x = Math.min(maxX, Math.max(-maxX, imageViewer.value.x));
  imageViewer.value.y = Math.min(maxY, Math.max(-maxY, imageViewer.value.y));
}

function startImageDrag(event: PointerEvent) {
  if (event.button !== 0 || imageViewer.value.scale <= 1) return;

  isDraggingImage.value = true;
  dragStart.value = {
    x: event.clientX - imageViewer.value.x,
    y: event.clientY - imageViewer.value.y,
  };
  (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
}

function moveImage(event: PointerEvent) {
  if (!isDraggingImage.value) return;

  imageViewer.value.x = event.clientX - dragStart.value.x;
  imageViewer.value.y = event.clientY - dragStart.value.y;
  clampImagePosition();
}

function stopImageDrag(event: PointerEvent) {
  isDraggingImage.value = false;
  const target = event.currentTarget as HTMLElement;
  if (target.hasPointerCapture(event.pointerId)) {
    target.releasePointerCapture(event.pointerId);
  }
}

function handleImageViewerKeydown(event: KeyboardEvent) {
  if (event.key === "Escape" && imageViewer.value.isOpen) {
    closeImageViewer();
  }
}

async function confirmDelete() {
  if (!deleteModal.value.baseId) return;

  try {
    const { error } = await supabase
      .from("bases")
      .delete()
      .eq("id", deleteModal.value.baseId);
    if (error) throw error;
    allBases.value = allBases.value.filter((b) => b.id !== deleteModal.value.baseId);
    closeDeleteModal();
  } catch (error) {
    console.error("Error deleting base:", error);
  }
}

function handleSuccess() {
  isModalOpen.value = false;
  fetchBases();
}

onMounted(() => {
  fetchBases();
  window.addEventListener("keydown", handleImageViewerKeydown);
});

onBeforeUnmount(() => {
  window.removeEventListener("keydown", handleImageViewerKeydown);
  document.body.style.overflow = "";
});

watch([isModalOpen, isFilterModalOpen, () => deleteModal.value.isOpen, () => imageViewer.value.isOpen], ([modal, filter, del, viewer]) => {
  if (modal || filter || del || viewer) {
    document.body.style.overflow = 'hidden'
  } else {
    document.body.style.overflow = ''
  }
})
</script>

<template>
  <div v-if="loading" class="flex flex-col items-center justify-center min-h-[50vh]">
    <LoadingSpinner size="lg" />
  </div>

  <div v-else class="space-y-4 animate-in fade-in zoom-in-95 slide-in-from-bottom-4 duration-500 ease-out">
    <div class="flex flex-row items-center justify-between gap-4">
      <div class="space-y-1">
        <h2 class="text-xl font-black italic tracking-tighter uppercase text-zinc-950 dark:text-white">
          Bases
        </h2>
      </div>

      <div class="flex flex-row items-center gap-2 sm:gap-4">
        <button @click="openFilterModal" 
            class="flex cursor-pointer items-center justify-center w-[44px] h-[44px] rounded-full transition-all active:scale-95 shadow-xl"
            :class="selectedLevel !== 'all' || selectedType !== 'all' 
                ? 'bg-yellow-500 border-2 border-yellow-500 text-zinc-950 shadow-[0_0_20px_rgba(234,179,8,0.3)]' 
                : 'bg-zinc-900 border-2 border-zinc-400 text-zinc-400 hover:text-yellow-500 hover:border-yellow-500'"
        >
          <Filter class="w-4 h-4 stroke-[2.5px]" />
        </button>

        <div class="ml-auto">
          <button
            @click="isModalOpen = true"
            class="group flex cursor-pointer items-center justify-center gap-3 w-[44px] sm:w-auto px-0 sm:px-4 h-[44px] rounded-full bg-zinc-950 border-2 border-yellow-500 text-yellow-500 font-black uppercase tracking-[0.15em] text-[10px] sm:text-[10px] hover:bg-yellow-500 hover:text-zinc-950 transition-all duration-300 shadow-xl shadow-yellow-500/10 active:scale-95"
          >
            <Plus class="w-4 h-4 stroke-[3px]" />
            <span class="hidden sm:inline text-[10px] sm:text-xs">Nueva Base</span>
          </button>
        </div>
      </div>
    </div>

    <div>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div
          v-for="base in filteredBases"
          :key="base.id"
          class="group relative overflow-hidden bg-zinc-950 shadow-2xl transition-all hover:ring-2 hover:ring-yellow-500/50 rounded-[2.5rem]"
        >
          <div class="aspect-video relative overflow-hidden bg-zinc-900">
            <button
              type="button"
              class="absolute inset-0 z-10 block h-full w-full cursor-zoom-in text-left"
              :aria-label="`Ver imagen de ${base.type}`"
              @click="openImageViewer(base)"
            >
              <img :src="base.url_foto" class="block w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
            </button>
            <div class="pointer-events-none absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent opacity-60 transition-opacity group-hover:opacity-40"></div>

            <div class="pointer-events-none absolute bottom-4 left-4 z-20 flex items-center gap-2">
              <span class="flex h-6 items-center gap-2 rounded-lg bg-yellow-500 px-3 text-[10px] font-black uppercase tracking-widest text-zinc-950 shadow-lg">
                <Castle class="h-3.5 w-3.5" />
                {{ base.level_th }}
              </span>
              <span class="flex h-6 items-center gap-2 rounded-lg bg-yellow-500 px-3 text-[10px] font-black uppercase tracking-widest text-zinc-950 shadow-lg">
                <component :is="getTypeIcon(base.type)" class="h-3.5 w-3.5" />
                {{ base.type }}
              </span>
            </div>
            <div class="pointer-events-none absolute bottom-4 right-4 z-20">
              <span class="flex h-6 items-center gap-2 rounded-lg border border-yellow-500/20 bg-zinc-950 px-3 text-[10px] font-black uppercase tracking-widest text-yellow-500 shadow-lg">
                <CalendarDays class="h-3.5 w-3.5" />
                {{ new Date(base.created_at).toLocaleDateString("es-ES") }}
              </span>
            </div>
          </div>

          <div class="p-4">
            <div class="flex items-center justify-between">
              <h3 class="text-lg font-black italic tracking-tighter text-white uppercase group-hover:text-yellow-500 transition-colors leading-none">
                {{ base.id }}
              </h3>

              <div class="flex gap-2">
                <a 
                  v-if="base.link"
                  :href="base.link" 
                  target="_blank" 
                  class="cursor-pointer p-2.5 rounded-xl bg-zinc-900 text-zinc-400 hover:bg-yellow-500 hover:text-zinc-950 transition-all border border-zinc-800"
                >
                  <ExternalLink class="w-4 h-4" />
                </a>
                <div 
                  v-else
                  class="p-2.5 rounded-xl bg-zinc-900 text-zinc-700 border border-zinc-800 cursor-not-allowed"
                  title="Esta base no tiene enlace (Nivel 3)"
                >
                  <ExternalLink class="w-4 h-4" />
                </div>
                <button @click="openDeleteModal(base)" class="cursor-pointer p-2.5 rounded-xl bg-zinc-900 text-zinc-400 hover:bg-red-600 hover:text-white transition-all border border-zinc-800">
                  <Trash2 class="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-if="filteredBases.length === 0" class="text-center">
        <p class="text-zinc-500 text-sm font-bold uppercase tracking-widest">
          {{ allBases.length === 0 ? 'Sin bases registradas' : 'Sin bases para el filtro' }}
        </p>
      </div>
    </div>

    <Teleport to="body">
      <div v-if="isFilterModalOpen" class="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-zinc-950/90 backdrop-blur-xl" @click="isFilterModalOpen = false"></div>

        <div class="relative bg-zinc-950 w-full max-w-lg rounded-[2.5rem] shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-yellow-500/20 animate-in zoom-in-95 duration-300 overflow-hidden">
            <div class="p-4 space-y-4">
                <div class="flex items-center justify-between">
                    <h3 class="text-xl font-black italic text-white uppercase tracking-tighter">Filtro</h3>
                    <button @click="isFilterModalOpen = false" class="cursor-pointer p-2 rounded-xl bg-zinc-900 text-zinc-500 hover:text-white transition-all">
                        <Plus class="w-5 h-5 rotate-45" />
                    </button>
                </div>

                <div class="grid grid-cols-2 gap-4">
                    <div class="flex flex-col">
                        <label class="text-[11px] font-black uppercase tracking-[0.2em] text-zinc-500 mb-2">Nivel</label>
                        <Select v-model="tempLevel">
                            <SelectTrigger class="h-[44px] rounded-xl bg-zinc-900 border border-zinc-800 text-white">
                                <SelectValue placeholder="Seleccionar" />
                            </SelectTrigger>
                            <SelectContent side="bottom" :side-offset="4" :avoid-collisions="false" class="z-[9999] bg-zinc-950 border border-zinc-800 text-white mt-1" data-select-content>
                                <SelectItem value="all">Todos</SelectItem>
                                <SelectItem v-for="n in 16" :key="n + 2" :value="String(n + 2)">
                                    Nivel {{ n + 2 }}
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div class="flex flex-col">
                        <label class="text-[11px] font-black uppercase tracking-[0.2em] text-zinc-500 mb-2">Categoría</label>
                        <Select v-model="tempType">
                            <SelectTrigger class="h-[44px] rounded-xl bg-zinc-900 border border-zinc-800 text-white">
                                <SelectValue placeholder="Seleccionar" />
                            </SelectTrigger>
                            <SelectContent side="bottom" :side-offset="4" :avoid-collisions="false" class="z-[9999] bg-zinc-950 border border-zinc-800 text-white mt-1" data-select-content>
                                <SelectItem value="all">Todos</SelectItem>
                                <SelectItem v-for="t in types" :key="t" :value="t">{{ t }}</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div class="flex gap-4 border-zinc-900">
                    <button @click="clearFilters(); isFilterModalOpen = false" class="flex-1 cursor-pointer h-[44px] rounded-full bg-zinc-900 border border-zinc-800 text-zinc-500 font-black uppercase tracking-[0.15em] text-[10px] hover:text-white transition-all active:scale-95">
                        Limpiar
                    </button>
                    <button @click="applyFilters" class="flex-1 cursor-pointer h-[44px] rounded-full bg-yellow-500 text-zinc-950 font-black uppercase tracking-[0.15em] text-[10px] hover:bg-white transition-all duration-300 shadow-xl shadow-yellow-500/10 active:scale-95">
                        Aplicar Filtros
                    </button>
                </div>
            </div>
        </div>
      </div>
    </Teleport>

    <Teleport to="body">
      <div v-if="isModalOpen" class="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-zinc-950/90 backdrop-blur-xl" @click="isModalOpen = false"></div>

        <div class="relative bg-zinc-950 w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-[2.5rem] shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-yellow-500/20 animate-in zoom-in-95 duration-300 custom-scrollbar">
          <div class="px-4 pt-4 flex items-center justify-between">
            <h3 class="text-xl font-black italic text-white uppercase tracking-tighter">Nueva Base</h3>
            <button @click="isModalOpen = false" class="cursor-pointer p-2 rounded-xl bg-zinc-900 text-zinc-500 hover:text-white transition-all">
              <Plus class="w-5 h-5 rotate-45" />
            </button>
          </div>
          <div class="p-4">
            <BaseForm @success="handleSuccess" />
          </div>
        </div>
      </div>
    </Teleport>

    <Teleport to="body">
      <div v-if="deleteModal.isOpen" class="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-zinc-950/90 backdrop-blur-xl" @click="closeDeleteModal"></div>

        <div class="relative bg-zinc-950 w-full max-w-md rounded-[2.5rem] shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-red-500/20 animate-in zoom-in-95 duration-300 overflow-hidden">
            <div class="p-4 space-y-4">
                <div class="flex items-center justify-between">
                    <h3 class="text-xl font-black italic text-white uppercase tracking-tighter">Eliminar</h3>
                    <button @click="closeDeleteModal" class="cursor-pointer p-2 rounded-xl bg-zinc-900 text-zinc-500 hover:text-white transition-all">
                        <Plus class="w-5 h-5 rotate-45" />
                    </button>
                </div>

                <div class="bg-zinc-900 rounded-2xl p-4 border border-zinc-800">
                    <p class="text-zinc-500 text-[10px] font-black uppercase tracking-[0.2em] mb-1">Base seleccionada:</p>
                    <p class="text-white font-medium truncate text-sm">{{ deleteModal.baseTitle }}</p>
                </div>

                <div class="flex gap-4 pt-2">
                    <button @click="closeDeleteModal" class="flex-1 cursor-pointer h-[44px] rounded-full bg-zinc-900 border border-zinc-800 text-zinc-500 font-black uppercase tracking-[0.15em] text-[10px] hover:text-white transition-all active:scale-95">
                        Cancelar
                    </button>
                    <button @click="confirmDelete" class="flex-1 cursor-pointer h-[44px] rounded-full bg-red-600 text-white font-black uppercase tracking-[0.15em] text-[10px] hover:bg-red-500 transition-all active:scale-95 shadow-xl shadow-red-600/20">
                        Confirmar
                    </button>
                </div>
            </div>
        </div>
      </div>
    </Teleport>

    <Teleport to="body">
      <div v-if="imageViewer.isOpen" class="fixed inset-0 z-[110] flex items-center justify-center bg-zinc-950/95 backdrop-blur-xl">
        <button
          type="button"
          class="absolute inset-0 cursor-zoom-out"
          aria-label="Cerrar visor de imagen"
          @click="closeImageViewer"
        ></button>

        <div class="relative z-10 flex h-full w-full flex-col items-center">
          <div class="relative z-20 flex h-16 w-full shrink-0 items-center justify-between gap-4 px-4 text-white sm:h-20 sm:px-6">
            <div class="flex min-w-0 items-center gap-2">
              <span class="flex h-6 items-center gap-2 rounded-lg bg-yellow-500 px-3 text-[10px] font-black uppercase tracking-widest text-zinc-950 shadow-lg">
                <Castle class="h-3.5 w-3.5" />
                {{ imageViewer.level }}
              </span>
              <span class="flex h-6 items-center gap-2 rounded-lg bg-yellow-500 px-3 text-[10px] font-black uppercase tracking-widest text-zinc-950 shadow-lg">
                <component :is="getTypeIcon(imageViewer.type)" class="h-3.5 w-3.5" />
                {{ imageViewer.type }}
              </span>
              <span class="flex h-6 shrink-0 items-center rounded-lg border border-yellow-500/20 bg-zinc-950 px-3 text-[10px] font-black uppercase tracking-widest text-yellow-500 shadow-lg">{{ imageViewer.date }}</span>
            </div>
            <button
              type="button"
              class="cursor-pointer rounded-xl bg-zinc-900 p-2 text-zinc-400 transition-all hover:bg-red-600 hover:text-white"
              aria-label="Cerrar visor de imagen"
              @click="closeImageViewer"
            >
              <X class="h-5 w-5" />
            </button>
          </div>

          <div ref="imageViewport" class="flex min-h-0 w-full flex-1 items-center justify-center overflow-hidden">
            <img
              :src="imageViewer.url"
              :alt="imageViewer.title"
              draggable="false"
              class="h-full w-full origin-center touch-none select-none object-contain"
              :class="[
                isDraggingImage ? 'cursor-grabbing' : imageViewer.scale > 1 ? 'cursor-grab' : 'cursor-default',
                isDraggingImage ? 'transition-none' : 'transition-transform duration-200'
              ]"
              :style="{ transform: `translate(${imageViewer.x}px, ${imageViewer.y}px) scale(${imageViewer.scale})` }"
              @pointerdown="startImageDrag"
              @pointermove="moveImage"
              @pointerup="stopImageDrag"
              @pointercancel="stopImageDrag"
              @dragstart.prevent
              @wheel.prevent="zoomImage($event.deltaY > 0 ? -0.1 : 0.1)"
            />
          </div>

          <div class="absolute bottom-4 flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-950 p-1 sm:bottom-6">
            <button type="button" class="cursor-pointer rounded-full p-2 text-zinc-400 transition-colors hover:bg-yellow-500 hover:text-zinc-950" aria-label="Reducir zoom" @click="zoomImage(-0.25)">
              <ZoomOut class="h-4 w-4" />
            </button>
            <span class="min-w-14 text-center text-[10px] font-black uppercase tracking-widest text-yellow-500">{{ Math.round(imageViewer.scale * 100) }}%</span>
            <button type="button" class="cursor-pointer rounded-full p-2 text-zinc-400 transition-colors hover:bg-yellow-500 hover:text-zinc-950" aria-label="Aumentar zoom" @click="zoomImage(0.25)">
              <ZoomIn class="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

