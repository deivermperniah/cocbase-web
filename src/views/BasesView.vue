<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { supabase } from "@/lib/supabase";
import { session, user, isAdmin } from "@/lib/auth";
import { toast } from "@/lib/toast";
import { BASE_TYPES, BASE_LEVELS } from "@/lib/constants";
import IconCopy from "~icons/ph/copy";
import IconMore from "~icons/ph/dots-three-bold";
import IconFunnel from "~icons/ph/funnel";
import IconClose from "~icons/ph/x";
import IconZoomIn from "~icons/ph/plus-circle";
import IconZoomOut from "~icons/ph/minus-circle";
import IconHeart from "~icons/ph/heart";
import IconHeartFill from "~icons/ph/heart-fill";
import IconBusiness from "~icons/ph/buildings";
import BaseActionsModal, { type ActionsBase } from "@/components/BaseActionsModal.vue";
import { getBaseTypeIcon } from "@/lib/base";
import { deleteBase } from "@/lib/admin";
import LoadingState from "@/components/ui/LoadingState.vue";
import PageHeader from "@/components/ui/PageHeader.vue";
import BaseBadge from "@/components/ui/BaseBadge.vue";
import EmptyState from "@/components/ui/EmptyState.vue";
import ModalShell from "@/components/ui/ModalShell.vue";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const route = useRoute();
const router = useRouter();

const allBases = ref<any[]>([]);
const totalCount = ref(0);
const loading = ref(true);
const loadingMore = ref(false);
const hasMore = ref(false);
const pageSize = 12;

const isFilterModalOpen = ref(false);

const favoriteIds = ref<Set<string>>(new Set());
const loadedImages = ref<Set<string>>(new Set());

const isDeleting = ref(false);
const actionsBase = ref<ActionsBase | null>(null);
const deleteModal = ref({
  isOpen: false,
  baseId: null as string | null,
  baseTitle: "",
  imageUrl: "",
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
const isPinchingImage = ref(false);
const activePointers = new Map<number, { x: number; y: number }>();
const pinchStartDistance = ref(0);
const pinchStartScale = ref(1);
const dragStart = ref({ x: 0, y: 0 });
const imageViewport = ref<HTMLElement | null>(null);

const selectedLevel = ref<string>("all");
const selectedType = ref<string>("all");

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
  fetchBases(true);
}

function clearFilters() {
  selectedLevel.value = "all";
  selectedType.value = "all";
  tempLevel.value = "all";
  tempType.value = "all";
}

async function fetchBases(reset = false) {
  if (reset) {
    allBases.value = [];
    totalCount.value = 0;
    hasMore.value = false;
    loading.value = true;
  } else {
    loadingMore.value = true;
  }

  const from = reset ? 0 : allBases.value.length;
  const to = from + pageSize - 1;

  let query = supabase
    .from("bases")
    .select("*, profiles!bases_author_id_fkey(full_name)", { count: "exact" })
    .eq("status", "approved")
    .order("created_at", { ascending: false })
    .range(from, to);

  if (selectedLevel.value !== "all") {
    query = query.eq("level_th", Number(selectedLevel.value));
  }
  if (selectedType.value !== "all") {
    query = query.eq("type", selectedType.value);
  }

  const { data, count, error } = await query;

  if (error) {
    console.error("Error fetching bases:", error);
  } else {
    if (reset) {
      allBases.value = data || [];
    } else {
      allBases.value = allBases.value.concat(data || []);
    }
    totalCount.value = count ?? allBases.value.length;
    hasMore.value = allBases.value.length < (count ?? allBases.value.length);
  }

  loading.value = false;
  loadingMore.value = false;
}

function loadMore() {
  fetchBases(false);
}

async function fetchFavorites() {
  if (!user.value) {
    favoriteIds.value = new Set();
    return;
  }

  const { data, error } = await supabase
    .from("favorites")
    .select("base_id")
    .eq("user_id", user.value.id);

  if (error) {
    console.error("Error fetching favorites:", error);
    return;
  }

  favoriteIds.value = new Set((data || []).map((r: any) => r.base_id));
}

function isFavorite(baseId: string) {
  return favoriteIds.value.has(baseId);
}

async function toggleFavorite(base: any) {
  if (!user.value) {
    router.push({ name: "login", query: { redirect: "/bases" } });
    return;
  }

  const baseId = base.id;

  if (isFavorite(baseId)) {
    const { error } = await supabase
      .from("favorites")
      .delete()
      .eq("user_id", user.value.id)
      .eq("base_id", baseId);

    if (error) {
      toast.error("No se pudo quitar de favoritos.");
      return;
    }
    favoriteIds.value.delete(baseId);
    toast.success("Eliminada de favoritos.");
  } else {
    const { error } = await supabase
      .from("favorites")
      .insert({ user_id: user.value.id, base_id: baseId });

    if (error) {
      toast.error("No se pudo guardar en favoritos.");
      return;
    }
    favoriteIds.value.add(baseId);
    toast.success("Guardada en favoritos.");
  }
}

function openDeleteModal(base: any) {
  deleteModal.value = {
    isOpen: true,
    baseId: base.id,
    baseTitle: `${base.type} · Nivel ${base.level_th}`,
    imageUrl: base.url_foto || "",
  };
}

function closeDeleteModal() {
  deleteModal.value = {
    isOpen: false,
    baseId: null,
    baseTitle: "",
    imageUrl: "",
  };
}

function openImageViewer(base: any) {
  imageViewer.value = {
    isOpen: true,
    url: base.url_foto,
    title: `Nivel ${base.level_th} - ${base.type}`,
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
  isPinchingImage.value = false;
  activePointers.clear();
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
  activePointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
  (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);

  if (activePointers.size === 2) {
    isDraggingImage.value = false;
    isPinchingImage.value = true;
    const [a, b] = Array.from(activePointers.values());
    if (!a || !b) return;
    pinchStartDistance.value = Math.hypot(a.x - b.x, a.y - b.y) || 1;
    pinchStartScale.value = imageViewer.value.scale;
    return;
  }

  if (event.button !== 0 || imageViewer.value.scale <= 1) return;

  isDraggingImage.value = true;
  dragStart.value = {
    x: event.clientX - imageViewer.value.x,
    y: event.clientY - imageViewer.value.y,
  };
}

function moveImage(event: PointerEvent) {
  if (!activePointers.has(event.pointerId)) return;
  activePointers.set(event.pointerId, { x: event.clientX, y: event.clientY });

  if (isPinchingImage.value && activePointers.size >= 2) {
    const [a, b] = Array.from(activePointers.values());
    if (!a || !b) return;
    const distance = Math.hypot(a.x - b.x, a.y - b.y) || 1;
    const scale = Math.min(3, Math.max(0.5, pinchStartScale.value * (distance / pinchStartDistance.value)));
    imageViewer.value.scale = scale;
    if (scale <= 1) {
      imageViewer.value.x = 0;
      imageViewer.value.y = 0;
    } else {
      clampImagePosition();
    }
    return;
  }

  if (!isDraggingImage.value) return;

  imageViewer.value.x = event.clientX - dragStart.value.x;
  imageViewer.value.y = event.clientY - dragStart.value.y;
  clampImagePosition();
}

function stopImageDrag(event: PointerEvent) {
  activePointers.delete(event.pointerId);
  const target = event.currentTarget as HTMLElement;
  if (target.hasPointerCapture(event.pointerId)) {
    target.releasePointerCapture(event.pointerId);
  }

  if (activePointers.size < 2) {
    isPinchingImage.value = false;
  }

  if (activePointers.size === 0) {
    isDraggingImage.value = false;
  } else if (!isPinchingImage.value && imageViewer.value.scale > 1) {
    const [remaining] = Array.from(activePointers.values());
    if (!remaining) return;
    isDraggingImage.value = true;
    dragStart.value = {
      x: remaining.x - imageViewer.value.x,
      y: remaining.y - imageViewer.value.y,
    };
  }
}

function handleImageViewerKeydown(event: KeyboardEvent) {
  if (event.key === "Escape" && imageViewer.value.isOpen) {
    closeImageViewer();
  }
}

async function confirmDelete() {
  const baseId = deleteModal.value.baseId;
  if (!baseId || isDeleting.value) return;

  isDeleting.value = true;
  try {
    await deleteBase({ id: baseId, url_foto: deleteModal.value.imageUrl });
    allBases.value = allBases.value.filter((b) => b.id !== baseId);
    totalCount.value = Math.max(0, totalCount.value - 1);
    toast.success("Base eliminada.");
    closeDeleteModal();
  } catch (error) {
    console.error("Error deleting base:", error);
    toast.error("No se pudo eliminar la base.");
  } finally {
    isDeleting.value = false;
  }
}

function markLoaded(url: string) {
  loadedImages.value.add(url);
}

onMounted(() => {
  const levelParam = route.query.level;
  if (typeof levelParam === "string" && levelParam !== "") {
    selectedLevel.value = levelParam;
  }

  fetchBases(true);
  fetchFavorites();
  window.addEventListener("keydown", handleImageViewerKeydown);
});

watch(
  () => route.query.level,
  (level) => {
    if (typeof level === "string" && level !== "") {
      selectedLevel.value = level;
      fetchBases(true);
    }
  }
);

watch(
  () => session.value,
  () => {
    fetchFavorites();
  }
);

onBeforeUnmount(() => {
  window.removeEventListener("keydown", handleImageViewerKeydown);
  document.body.style.overflow = "";
});

watch([isFilterModalOpen, () => deleteModal.value.isOpen, () => imageViewer.value.isOpen, () => actionsBase.value !== null], ([filter, del, viewer, actions]) => {
  if (filter || del || viewer || actions) {
    document.body.style.overflow = 'hidden'
  } else {
    document.body.style.overflow = ''
  }
})
</script>

<template>
  <LoadingState v-if="loading" />

  <div v-else class="space-y-page animate-in fade-in slide-in-from-bottom-2 duration-700 ease-out">
    <PageHeader title="Bases">
      <template #actions>
        <button @click="openFilterModal"
            class="flex cursor-pointer items-center justify-center w-[44px] h-[44px] rounded-full transition-all active:scale-95 shadow-xl"
            :class="selectedLevel !== 'all' || selectedType !== 'all'
                ? 'bg-yellow-400 border-2 border-yellow-400 text-black shadow-[0_0_20px_rgba(250,204,21,0.3)]'
                : 'bg-secondary border-2 border-border text-muted-foreground hover:text-yellow-400 hover:border-yellow-400'"
        >
          <IconFunnel class="w-4 h-4" />
        </button>
      </template>
    </PageHeader>

    <div>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-page">
        <div
          v-for="base in allBases"
          :key="base.id"
          class="group relative overflow-hidden bg-card border border-border shadow-2xl transition-all rounded-xl"
        >
          <div class="aspect-video relative overflow-hidden bg-secondary">
            <div v-if="!loadedImages.has(base.url_foto)" class="absolute inset-0 z-0 animate-pulse bg-secondary"></div>
            <button
              type="button"
              class="absolute inset-0 z-10 block h-full w-full cursor-zoom-in text-left"
              :aria-label="`Ver imagen de ${base.type}`"
              @click="openImageViewer(base)"
            >
              <img
                :src="base.url_foto"
                loading="lazy"
                decoding="async"
                class="block w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                @load="markLoaded(base.url_foto)"
              />
            </button>
            <div class="pointer-events-none absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-60 transition-opacity group-hover:opacity-40"></div>

            <div class="pointer-events-none absolute bottom-4 left-4 z-20 flex items-center gap-2">
              <BaseBadge variant="accent" :icon="IconBusiness" shadow>{{ base.level_th }}</BaseBadge>
              <BaseBadge variant="accent" :icon="getBaseTypeIcon(base.type)" shadow>{{ base.type }}</BaseBadge>
            </div>
          </div>

          <div class="p-page">
            <div class="flex items-center justify-between">
              <div class="flex w-full gap-2">
                <a
                  v-if="base.link"
                  :href="base.link"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="flex flex-1 cursor-pointer items-center justify-center gap-2 px-3 py-2.5 rounded-lg bg-secondary text-muted-foreground hover:bg-yellow-400/10 hover:text-yellow-400 transition-all border border-border text-xs"
                >
                  <IconCopy class="w-4 h-4" />
                  Copiar Base
                </a>
                <div
                  v-else
                  class="flex flex-1 items-center justify-center gap-2 px-3 py-2.5 rounded-lg bg-secondary text-muted-foreground/50 border border-border cursor-not-allowed text-xs"
                  title="Esta base no tiene enlace (Nivel 3)"
                >
                  <IconCopy class="w-4 h-4" />
                  Copiar Base
                </div>
                <button
                  @click="toggleFavorite(base)"
                  class="cursor-pointer p-2.5 rounded-lg bg-secondary transition-all border border-border"
                  :class="isFavorite(base.id) ? 'text-yellow-400' : 'text-muted-foreground hover:text-yellow-400'"
                  :title="isFavorite(base.id) ? 'Quitar de favoritos' : 'Guardar en favoritos'"
                >
                  <component :is="isFavorite(base.id) ? IconHeartFill : IconHeart" class="w-4 h-4" />
                </button>
                <button
                  @click="actionsBase = base"
                  class="cursor-pointer p-2.5 rounded-lg bg-secondary text-muted-foreground hover:bg-yellow-400/10 hover:text-yellow-400 transition-all border border-border"
                  title="Más opciones"
                  aria-label="Más opciones"
                >
                  <IconMore class="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <EmptyState
        v-if="allBases.length === 0"
        :message="selectedLevel !== 'all' || selectedType !== 'all' ? 'Sin bases para este filtro' : 'Sin bases'"
      />

      <div v-if="hasMore" class="flex justify-center pt-6">
        <button
          @click="loadMore"
          :disabled="loadingMore"
          class="flex cursor-pointer items-center justify-center gap-2 px-6 h-11 rounded-full bg-card border-2 border-yellow-400 text-yellow-400 text-xs hover:bg-yellow-400/10 transition-all active:scale-95 disabled:opacity-50"
        >
          <span v-if="loadingMore" class="animate-pulse">Cargando...</span>
          <span v-else>Mostrar más</span>
        </button>
      </div>
    </div>

    <ModalShell
      :open="isFilterModalOpen"
      title="Filtro"
      max-width-class="max-w-lg"
      @close="isFilterModalOpen = false"
    >
      <div class="grid grid-cols-2 gap-page">
        <div class="flex flex-col">
          <label class="text-xs text-muted-foreground mb-2">Nivel</label>
          <Select v-model="tempLevel">
            <SelectTrigger class="h-[44px] rounded-lg bg-secondary border border-border text-white">
              <SelectValue placeholder="Seleccionar" />
            </SelectTrigger>
            <SelectContent side="bottom" :side-offset="4" :avoid-collisions="false" class="z-[9999] bg-card border border-border text-white mt-1" data-select-content>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem v-for="n in BASE_LEVELS" :key="n" :value="String(n)">
                Nivel {{ n }}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div class="flex flex-col">
          <label class="text-xs text-muted-foreground mb-2">Categoría</label>
          <Select v-model="tempType">
            <SelectTrigger class="h-[44px] rounded-lg bg-secondary border border-border text-white">
              <SelectValue placeholder="Seleccionar" />
            </SelectTrigger>
            <SelectContent side="bottom" :side-offset="4" :avoid-collisions="false" class="z-[9999] bg-card border border-border text-white mt-1" data-select-content>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem v-for="t in BASE_TYPES" :key="t" :value="t">{{ t }}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div class="flex gap-page">
        <button @click="clearFilters(); isFilterModalOpen = false; fetchBases(true)" class="flex-1 cursor-pointer h-[44px] rounded-full bg-secondary border border-border text-muted-foreground text-xs hover:text-white transition-all active:scale-95">
          Limpiar
        </button>
        <button @click="applyFilters" class="flex-1 cursor-pointer h-[44px] rounded-full bg-yellow-400 text-black text-xs hover:bg-yellow-300 transition-all duration-300 shadow-xl shadow-yellow-400/10 active:scale-95">
          Aplicar Filtros
        </button>
      </div>
    </ModalShell>

    <BaseActionsModal
      :base="actionsBase"
      :can-delete="isAdmin"
      @close="actionsBase = null"
      @delete="openDeleteModal"
    />

    <ModalShell
      :open="deleteModal.isOpen"
      title="Eliminar"
      border-class="border-red-500/20"
      @close="closeDeleteModal"
    >
      <div class="bg-secondary rounded-xl p-page border border-border">
        <p class="text-muted-foreground text-xs mb-1">Base seleccionada:</p>
        <p class="text-white truncate text-sm">{{ deleteModal.baseTitle }}</p>
      </div>

      <div class="flex gap-page pt-2">
        <button @click="closeDeleteModal" class="flex-1 cursor-pointer h-[44px] rounded-full bg-secondary border border-border text-muted-foreground text-xs hover:text-white transition-all active:scale-95">
          Cancelar
        </button>
        <button @click="confirmDelete" :disabled="isDeleting" class="flex-1 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed h-[44px] rounded-full bg-red-600 text-white text-xs hover:bg-red-500 transition-all active:scale-95 shadow-xl shadow-red-600/20">
          Confirmar
        </button>
      </div>
    </ModalShell>

    <Teleport to="body">
      <div v-if="imageViewer.isOpen" class="fixed inset-0 z-[110] flex items-center justify-center bg-card/95 backdrop-blur-xl">
        <button
          type="button"
          class="absolute inset-0 cursor-zoom-out"
          aria-label="Cerrar visor de imagen"
          @click="closeImageViewer"
        ></button>

        <div class="relative z-10 flex h-full w-full flex-col items-center">
          <div class="relative z-20 flex h-16 w-full shrink-0 items-center justify-between gap-page px-page text-white sm:h-20 sm:px-6">
            <div class="flex min-w-0 items-center gap-2">
              <BaseBadge variant="accent" :icon="IconBusiness" shadow>{{ imageViewer.level }}</BaseBadge>
              <BaseBadge variant="accent" :icon="getBaseTypeIcon(imageViewer.type)" shadow>{{ imageViewer.type }}</BaseBadge>
              <BaseBadge variant="outline" shadow>{{ imageViewer.date }}</BaseBadge>
            </div>
            <button
              type="button"
              class="cursor-pointer p-2 rounded-full bg-secondary text-muted-foreground hover:text-white transition-all"
              aria-label="Cerrar visor de imagen"
              @click="closeImageViewer"
            >
              <IconClose class="h-5 w-5" />
            </button>
          </div>

          <div ref="imageViewport" class="flex min-h-0 w-full flex-1 touch-none items-center justify-center overflow-hidden">
            <img
              :src="imageViewer.url"
              :alt="imageViewer.title"
              draggable="false"
              class="h-full w-full origin-center touch-none select-none object-contain"
              :class="[
                isDraggingImage ? 'cursor-grabbing' : imageViewer.scale > 1 ? 'cursor-grab' : 'cursor-default',
                isDraggingImage || isPinchingImage ? 'transition-none' : 'transition-transform duration-200'
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

          <div class="absolute bottom-4 flex items-center gap-2 rounded-full border border-border bg-card p-1 sm:bottom-6">
            <button type="button" class="cursor-pointer rounded-full p-2 text-muted-foreground transition-colors hover:bg-yellow-400/10 hover:text-yellow-400" aria-label="Reducir zoom" @click="zoomImage(-0.25)">
              <IconZoomOut class="h-4 w-4" />
            </button>
            <span class="min-w-14 text-center text-xs text-yellow-400">{{ Math.round(imageViewer.scale * 100) }}%</span>
            <button type="button" class="cursor-pointer rounded-full p-2 text-muted-foreground transition-colors hover:bg-yellow-400/10 hover:text-yellow-400" aria-label="Aumentar zoom" @click="zoomImage(0.25)">
              <IconZoomIn class="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>
