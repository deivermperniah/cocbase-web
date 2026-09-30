<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { supabase } from "@/lib/supabase";
import { session, user, isAdmin } from "@/lib/auth";
import { toast } from "@/lib/toast";
import { BASE_TYPES, BASE_LEVELS } from "@/lib/constants";
import IconCopy from "~icons/ph/copy";
import IconMore from "~icons/ph/dots-three-bold";
import IconFunnel from "~icons/ph/funnel";
import IconHeart from "~icons/ph/heart";
import IconHeartFill from "~icons/ph/heart-fill";
import BaseActionsModal, { type ActionsBase } from "@/components/BaseActionsModal.vue";
import type { Base } from "@/lib/base";
import BaseCard from "@/components/BaseCard.vue";
import ImageViewer from "@/components/ImageViewer.vue";
import { deleteBase } from "@/lib/admin";
import LoadingState from "@/components/ui/LoadingState.vue";
import PageHeader from "@/components/ui/PageHeader.vue";
import EmptyState from "@/components/ui/EmptyState.vue";
import ModalShell from "@/components/ui/ModalShell.vue";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const route = useRoute();
const router = useRouter();

const allBases = ref<Base[]>([]);
const loading = ref(true);
const loadingMore = ref(false);
const hasMore = ref(false);
const pageSize = 12;

const isFilterModalOpen = ref(false);

const favoriteIds = ref<Set<string>>(new Set());

const isDeleting = ref(false);
const actionsBase = ref<ActionsBase | null>(null);
const deleteModal = ref({
  isOpen: false,
  baseId: null as string | null,
  baseTitle: "",
  imageUrl: "",
});

const imageViewer = ref({ isOpen: false, url: "", title: "" });

const selectedLevel = ref<string>("all");
const selectedType = ref<string>("all");

const routeLevel = computed(() =>
  typeof route.params.level === "string" && route.params.level ? route.params.level.slice(3) : "all",
);

type BasesSnapshot = { level: string; data: Base[]; count: number | null };
const snapshotWindow = window as Window & { __BASES__?: BasesSnapshot };
const snapshot = snapshotWindow.__BASES__?.level === routeLevel.value ? snapshotWindow.__BASES__ : undefined;
if (snapshot) {
  allBases.value = snapshot.data;
  hasMore.value = snapshot.data.length < (snapshot.count ?? snapshot.data.length);
  loading.value = false;
}

const tempLevel = ref<string>("all");
const tempType = ref<string>("all");

function openFilterModal() {
  tempLevel.value = selectedLevel.value;
  tempType.value = selectedType.value;
  isFilterModalOpen.value = true;
}

function applyFilters() {
  selectedType.value = tempType.value;
  isFilterModalOpen.value = false;
  if (tempLevel.value !== routeLevel.value) {
    router.push(tempLevel.value === "all" ? "/bases" : `/bases/th-${tempLevel.value}`);
    return;
  }
  selectedLevel.value = tempLevel.value;
  fetchBases(true);
}

function clearFilters() {
  selectedType.value = "all";
  isFilterModalOpen.value = false;
  if (routeLevel.value !== "all") {
    router.push("/bases");
    return;
  }
  selectedLevel.value = "all";
  fetchBases(true);
}

async function fetchBases(reset = false, silent = false) {
  if (reset && !silent) {
    allBases.value = [];
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
      if (selectedType.value === "all") {
        snapshotWindow.__BASES__ = { level: selectedLevel.value, data: allBases.value, count };
      }
    } else {
      allBases.value = allBases.value.concat(data || []);
    }
    hasMore.value = allBases.value.length < (count ?? allBases.value.length);
  }

  loading.value = false;
  loadingMore.value = false;
}

async function fetchFavorites() {
  if (!user.value) {
    favoriteIds.value = new Set();
    return;
  }

  const { data, error } = await supabase.from("favorites").select("base_id").eq("user_id", user.value.id);

  if (error) {
    console.error("Error fetching favorites:", error);
    return;
  }

  favoriteIds.value = new Set((data || []).map((r) => r.base_id));
}

function isFavorite(baseId: string) {
  return favoriteIds.value.has(baseId);
}

async function toggleFavorite(base: Base) {
  if (!user.value) {
    router.push({ name: "login", query: { redirect: "/bases" } });
    return;
  }

  const baseId = base.id;

  if (isFavorite(baseId)) {
    const { error } = await supabase.from("favorites").delete().eq("user_id", user.value.id).eq("base_id", baseId);

    if (error) {
      toast.error("No se pudo quitar de favoritos");
      return;
    }
    favoriteIds.value.delete(baseId);
    toast.success("Eliminada de favoritos");
  } else {
    const { error } = await supabase.from("favorites").insert({ user_id: user.value.id, base_id: baseId });

    if (error) {
      toast.error("No se pudo guardar en favoritos");
      return;
    }
    favoriteIds.value.add(baseId);
    toast.success("Guardada en favoritos");
  }
}

function openDeleteModal(base: ActionsBase) {
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

function openImageViewer(base: Base) {
  imageViewer.value = { isOpen: true, url: base.url_foto, title: `Nivel ${base.level_th} - ${base.type}` };
}

function closeImageViewer() {
  imageViewer.value = { isOpen: false, url: "", title: "" };
}

async function confirmDelete() {
  const baseId = deleteModal.value.baseId;
  if (!baseId || isDeleting.value) return;

  isDeleting.value = true;
  try {
    await deleteBase({ id: baseId, url_foto: deleteModal.value.imageUrl });
    allBases.value = allBases.value.filter((b) => b.id !== baseId);
    toast.success("Base eliminada");
    closeDeleteModal();
  } catch (error) {
    console.error("Error deleting base:", error);
    toast.error("No se pudo eliminar la base");
  } finally {
    isDeleting.value = false;
  }
}

onMounted(() => {
  selectedLevel.value = routeLevel.value;

  fetchBases(true, Boolean(snapshot));
  fetchFavorites();
});

watch(routeLevel, (level) => {
  selectedLevel.value = level;
  fetchBases(true);
});

watch(
  () => session.value,
  () => {
    fetchFavorites();
  },
);

onBeforeUnmount(() => {
  document.body.style.overflow = "";
});

watch(
  [isFilterModalOpen, () => deleteModal.value.isOpen, () => actionsBase.value !== null],
  ([filter, del, actions]) => {
    if (filter || del || actions) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
  },
);
</script>

<template>
  <LoadingState v-if="loading" />

  <div v-else class="space-y-page animate-in fade-in slide-in-from-bottom-2 duration-700 ease-out">
    <PageHeader
      :title="routeLevel === 'all' ? 'Bases de Clash of Clans' : `Bases para Ayuntamiento ${routeLevel}`"
      :subtitle="
        routeLevel === 'all'
          ? 'Bases de guerra, liga, mejora y recursos para todos los niveles de ayuntamiento.'
          : `Bases de guerra, liga, mejora y recursos para TH${routeLevel}, listas para copiar en el juego.`
      "
    >
      <template #actions>
        <button
          type="button"
          aria-label="Filtrar bases"
          class="flex cursor-pointer items-center justify-center w-[44px] h-[44px] rounded-full transition-all active:scale-95 shadow-xl"
          :class="
            selectedLevel !== 'all' || selectedType !== 'all'
              ? 'bg-yellow-400 border-2 border-yellow-400 text-black shadow-[0_0_20px_rgba(250,204,21,0.3)]'
              : 'bg-secondary border-2 border-border text-muted-foreground hover:text-yellow-400 hover:border-yellow-400'
          "
          @click="openFilterModal"
        >
          <IconFunnel class="w-4 h-4" />
        </button>
      </template>
    </PageHeader>

    <div>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-page">
        <BaseCard v-for="base in allBases" :key="base.id" :base="base" @open-image="openImageViewer(base)">
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
              type="button"
              :aria-pressed="isFavorite(base.id)"
              aria-label="Favorito"
              class="cursor-pointer p-2.5 rounded-lg bg-secondary transition-all border border-border"
              :class="isFavorite(base.id) ? 'text-yellow-400' : 'text-muted-foreground hover:text-yellow-400'"
              :title="isFavorite(base.id) ? 'Quitar de favoritos' : 'Guardar en favoritos'"
              @click="toggleFavorite(base)"
            >
              <component :is="isFavorite(base.id) ? IconHeartFill : IconHeart" class="w-4 h-4" />
            </button>
            <button
              type="button"
              class="cursor-pointer p-2.5 rounded-lg bg-secondary text-muted-foreground hover:bg-yellow-400/10 hover:text-yellow-400 transition-all border border-border"
              title="Más opciones"
              aria-label="Más opciones"
              @click="actionsBase = base"
            >
              <IconMore class="w-4 h-4" />
            </button>
          </div>
        </BaseCard>
      </div>

      <EmptyState
        v-if="allBases.length === 0"
        :message="selectedLevel !== 'all' || selectedType !== 'all' ? 'Sin bases para este filtro' : 'Sin bases'"
      />

      <div v-if="hasMore" class="flex justify-center pt-6">
        <button
          :disabled="loadingMore"
          class="flex cursor-pointer items-center justify-center gap-2 px-6 h-11 rounded-full bg-card border-2 border-yellow-400 text-yellow-400 text-xs hover:bg-yellow-400/10 transition-all active:scale-95 disabled:opacity-50"
          @click="fetchBases(false)"
        >
          <span v-if="loadingMore" class="animate-pulse">Cargando...</span>
          <span v-else>Mostrar más</span>
        </button>
      </div>
    </div>

    <ModalShell :open="isFilterModalOpen" title="Filtro" max-width-class="max-w-lg" @close="isFilterModalOpen = false">
      <div class="grid grid-cols-2 gap-page">
        <div class="flex flex-col">
          <label for="filter-level" class="text-xs text-muted-foreground mb-2">Nivel</label>
          <Select v-model="tempLevel">
            <SelectTrigger id="filter-level" class="h-[44px] rounded-lg bg-secondary border border-border text-white">
              <SelectValue placeholder="Seleccionar" />
            </SelectTrigger>
            <SelectContent
              side="bottom"
              :side-offset="4"
              :avoid-collisions="false"
              class="z-[9999] bg-card border border-border text-white mt-1"
            >
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem v-for="n in BASE_LEVELS" :key="n" :value="String(n)"> Nivel {{ n }} </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div class="flex flex-col">
          <label for="filter-type" class="text-xs text-muted-foreground mb-2">Categoría</label>
          <Select v-model="tempType">
            <SelectTrigger id="filter-type" class="h-[44px] rounded-lg bg-secondary border border-border text-white">
              <SelectValue placeholder="Seleccionar" />
            </SelectTrigger>
            <SelectContent
              side="bottom"
              :side-offset="4"
              :avoid-collisions="false"
              class="z-[9999] bg-card border border-border text-white mt-1"
            >
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem v-for="t in BASE_TYPES" :key="t" :value="t">{{ t }}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div class="flex gap-page">
        <button
          class="flex-1 cursor-pointer h-[44px] rounded-full bg-secondary border border-border text-muted-foreground text-xs hover:text-white transition-all active:scale-95"
          @click="clearFilters"
        >
          Limpiar
        </button>
        <button
          class="flex-1 cursor-pointer h-[44px] rounded-full bg-yellow-400 text-black text-xs hover:bg-yellow-300 transition-all duration-300 shadow-xl shadow-yellow-400/10 active:scale-95"
          @click="applyFilters"
        >
          Aplicar Filtros
        </button>
      </div>
    </ModalShell>

    <BaseActionsModal :base="actionsBase" :can-delete="isAdmin" @close="actionsBase = null" @delete="openDeleteModal" />

    <ModalShell :open="deleteModal.isOpen" title="Eliminar" border-class="border-red-500/20" @close="closeDeleteModal">
      <div class="bg-secondary rounded-xl p-page border border-border">
        <p class="text-muted-foreground text-xs mb-1">Base seleccionada:</p>
        <p class="text-white truncate text-sm">{{ deleteModal.baseTitle }}</p>
      </div>

      <div class="flex gap-page pt-2">
        <button
          class="flex-1 cursor-pointer h-[44px] rounded-full bg-secondary border border-border text-muted-foreground text-xs hover:text-white transition-all active:scale-95"
          @click="closeDeleteModal"
        >
          Cancelar
        </button>
        <button
          :disabled="isDeleting"
          class="flex-1 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed h-[44px] rounded-full bg-red-600 text-white text-xs hover:bg-red-500 transition-all active:scale-95 shadow-xl shadow-red-600/20"
          @click="confirmDelete"
        >
          Confirmar
        </button>
      </div>
    </ModalShell>

    <ImageViewer
      :open="imageViewer.isOpen"
      :url="imageViewer.url"
      :title="imageViewer.title"
      @close="closeImageViewer"
    />
  </div>
</template>
