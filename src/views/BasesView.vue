<script setup lang="ts">
import { ref, onMounted, computed, watch } from "vue";
import { supabase } from "@/lib/supabase";
import { Plus, ExternalLink, Trash2, Filter } from "lucide-vue-next";
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

// Estado del Modal de Eliminación
const deleteModal = ref({
  isOpen: false,
  baseId: null as number | null,
  baseTitle: "",
});

// Filtros
const selectedLevel = ref<string>("all");
const selectedType = ref<string>("all");
const types = ["Guerra", "Liga", "Mejora", "Recursos"];

// Estado temporal para el modal
const tempLevel = ref<string>("all");
const tempType = ref<string>("all");

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

// Filtrado del lado del cliente para optimizar rendimiento
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
});

// Bloquear scroll cuando hay modales abiertos
watch([isModalOpen, isFilterModalOpen, () => deleteModal.value.isOpen], ([modal, filter, del]) => {
  if (modal || filter || del) {
    document.body.style.overflow = 'hidden'
  } else {
    document.body.style.overflow = ''
  }
})
</script>

<template>
  <div
    v-if="loading"
    class="flex flex-col items-center justify-center min-h-[50vh]"
  >
    <LoadingSpinner size="lg" />
  </div>

  <div
    v-else
    class="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700"
  >
    <!-- Premium Header -->
    <div class="flex flex-row items-center justify-between gap-4">
      <!-- Título -->
      <div class="space-y-1">
        <h2
          class="text-xl font-black italic tracking-tighter uppercase text-zinc-950 dark:text-white"
        >
          Bases
        </h2>
      </div>

      <!-- Botones -->
      <div class="flex flex-row items-center gap-2 sm:gap-4">
        <button @click="openFilterModal" 
            class="flex items-center justify-center w-[44px] h-[44px] rounded-full transition-all active:scale-95 shadow-xl"
            :class="selectedLevel !== 'all' || selectedType !== 'all' 
                ? 'bg-yellow-500 border-2 border-yellow-500 text-zinc-950 shadow-[0_0_20px_rgba(234,179,8,0.3)]' 
                : 'bg-zinc-900 border-2 border-zinc-400 text-zinc-400 hover:text-yellow-500 hover:border-yellow-500'"
        >
            <Filter class="w-4 h-4 stroke-[2.5px]" />
        </button>

        <div class="ml-auto">
          <button
            @click="isModalOpen = true"
            class="group flex items-center justify-center gap-3 w-[44px] sm:w-auto px-0 sm:px-4 h-[44px] rounded-full bg-zinc-950 border-2 border-yellow-500 text-yellow-500 font-black uppercase tracking-[0.15em] text-[10px] sm:text-[10px] hover:bg-yellow-500 hover:text-zinc-950 transition-all duration-300 shadow-xl shadow-yellow-500/10 active:scale-95"
          >
            <Plus class="w-4 h-4 stroke-[3px]" />
            <span class="hidden sm:inline text-[10px] sm:text-xs"
              >Nueva Base</span
            >
          </button>
        </div>
      </div>
    </div>

    <div>
      <!-- Grid View -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div
          v-for="base in filteredBases"
          :key="base.id"
          class="group relative overflow-hidden bg-zinc-950 shadow-2xl transition-all hover:ring-2 hover:ring-yellow-500/50 rounded-[2.5rem]"
        >
          <!-- Image Container -->
          <div class="aspect-video relative overflow-hidden bg-zinc-900">
            <img
              :src="base.url_foto"
              class="block w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />

            <!-- Overlay Táctico -->
            <div
              class="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent opacity-60 group-hover:opacity-40 transition-opacity"
            ></div>

            <!-- Badge Inferior (Izquierda) -->
            <div class="absolute bottom-4 left-4">
              <span
                class="px-3 py-1.5 rounded-lg text-[10px] font-black bg-yellow-500 text-zinc-950 uppercase tracking-widest shadow-lg"
              >
                NIVEL {{ base.level_th }} <span class="text-white">➖</span>
                {{ base.type }}
              </span>
            </div>

            <!-- Fecha (Abajo Derecha) -->
            <div class="absolute bottom-4 right-4">
              <span
                class="px-3 py-1.5 rounded-lg text-[10px] font-black bg-zinc-950 text-yellow-500 uppercase tracking-widest shadow-lg border border-yellow-500/20"
              >
                {{ new Date(base.created_at).toLocaleDateString("es-ES") }}
              </span>
            </div>
          </div>

          <div class="p-4">
            <div class="flex items-center justify-between">
              <h3
                class="text-lg font-black italic tracking-tighter text-white uppercase group-hover:text-yellow-500 transition-colors leading-none"
              >
                {{ base.id }}
              </h3>

              <div class="flex gap-2">
                <a
                  :href="base.link"
                  target="_blank"
                  class="p-2.5 rounded-xl bg-zinc-900 text-zinc-400 hover:bg-yellow-500 hover:text-zinc-950 transition-all border border-zinc-800"
                >
                  <ExternalLink class="w-4 h-4" />
                </a>
                <button
                  @click="openDeleteModal(base)"
                  class="p-2.5 rounded-xl bg-zinc-900 text-zinc-400 hover:bg-red-600 hover:text-white transition-all border border-zinc-800"
                >
                  <Trash2 class="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State Simplificado -->
      <div v-if="filteredBases.length === 0" class="text-center">
        <p class="text-zinc-500 text-sm font-bold uppercase tracking-widest">
          {{ allBases.length === 0 ? 'Sin bases registradas' : 'Sin bases para el filtro' }}
        </p>
      </div>
    </div>

    <!-- Filter Modal Wrapper -->
    <Teleport to="body">
      <div v-if="isFilterModalOpen" class="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-zinc-950/90 backdrop-blur-xl" @click="isFilterModalOpen = false"></div>

        <div class="relative bg-zinc-950 w-full max-w-lg rounded-[2.5rem] shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-yellow-500/20 animate-in zoom-in-95 duration-300 overflow-hidden">
            <div class="p-4 space-y-4">
                <!-- Header -->
                <div class="flex items-center justify-between">
                    <h3 class="text-xl font-black italic text-white uppercase tracking-tighter">
                        Filtro
                    </h3>
                    <button @click="isFilterModalOpen = false" class="p-2 rounded-xl bg-zinc-900 text-zinc-500 hover:text-white transition-all">
                        <Plus class="w-5 h-5 rotate-45" />
                    </button>
                </div>

                <!-- Selects Row -->
                <div class="grid grid-cols-2 gap-4">
                    <!-- Categorías -->
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

                    <!-- Niveles -->
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
                </div>

                <!-- Footer -->
                <div class="flex gap-4 border-zinc-900">
                    <button 
                        @click="clearFilters(); isFilterModalOpen = false" 
                        class="flex-1 h-[44px] rounded-full bg-zinc-900 border border-zinc-800 text-zinc-500 font-black uppercase tracking-[0.15em] text-[10px] hover:text-white transition-all active:scale-95"
                    >
                        Limpiar
                    </button>
                    <button 
                        @click="applyFilters" 
                        class="flex-1 h-[44px] rounded-full bg-yellow-500 text-zinc-950 font-black uppercase tracking-[0.15em] text-[10px] hover:bg-white transition-all duration-300 shadow-xl shadow-yellow-500/10 active:scale-95"
                    >
                        Aplicar Filtros
                    </button>
                </div>
            </div>
        </div>
      </div>
    </Teleport>

    <!-- Premium Modal Wrapper -->
    <Teleport to="body">
      <div
        v-if="isModalOpen"
        class="fixed inset-0 z-[100] flex items-center justify-center p-4"
      >
        <div
          class="absolute inset-0 bg-zinc-950/90 backdrop-blur-xl"
          @click="isModalOpen = false"
        ></div>

        <div
          class="relative bg-zinc-950 w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-[2.5rem] shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-yellow-500/20 animate-in zoom-in-95 duration-300 custom-scrollbar"
        >
          <div
            class="px-4 pt-4 flex items-center justify-between"
          >
            <h3 class="text-xl font-black italic text-white uppercase tracking-tighter">
                Nueva Base
            </h3>
            <button
              @click="isModalOpen = false"
              class="p-2 rounded-xl bg-zinc-900 text-zinc-500 hover:text-white transition-all"
            >
              <Plus class="w-5 h-5 rotate-45" />
            </button>
          </div>

          <div class="p-4">
            <BaseForm @success="handleSuccess" />
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Modal de Confirmación de Eliminación -->
    <Teleport to="body">
      <div v-if="deleteModal.isOpen" class="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-zinc-950/90 backdrop-blur-xl" @click="closeDeleteModal"></div>

        <div class="relative bg-zinc-950 w-full max-w-md rounded-[2.5rem] shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-red-500/20 animate-in zoom-in-95 duration-300 overflow-hidden">
            <div class="p-4 space-y-4">
                <!-- Header -->
                <div class="flex items-center justify-between">
                    <h3 class="text-xl font-black italic text-white uppercase tracking-tighter">
                        Eliminar
                    </h3>
                    <button @click="closeDeleteModal" class="p-2 rounded-xl bg-zinc-900 text-zinc-500 hover:text-white transition-all">
                        <Plus class="w-5 h-5 rotate-45" />
                    </button>
                </div>

                <!-- Info -->
                <div class="bg-zinc-900 rounded-2xl p-4 border border-zinc-800">
                    <p class="text-zinc-500 text-[10px] font-black uppercase tracking-[0.2em] mb-1">Base seleccionada:</p>
                    <p class="text-white font-medium truncate text-sm">
                        {{ deleteModal.baseTitle }}
                    </p>
                </div>

                <!-- Footer -->
                <div class="flex gap-4 pt-2">
                    <button 
                        @click="closeDeleteModal" 
                        class="flex-1 h-[44px] rounded-full bg-zinc-900 border border-zinc-800 text-zinc-500 font-black uppercase tracking-[0.15em] text-[10px] hover:text-white transition-all active:scale-95"
                    >
                        Cancelar
                    </button>
                    <button 
                        @click="confirmDelete" 
                        class="flex-1 h-[44px] rounded-full bg-red-600 text-white font-black uppercase tracking-[0.15em] text-[10px] hover:bg-red-500 transition-all active:scale-95 shadow-xl shadow-red-600/20"
                    >
                        Confirmar
                    </button>
                </div>
            </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
.custom-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
.custom-scrollbar::-webkit-scrollbar {
  display: none;
}
</style>
