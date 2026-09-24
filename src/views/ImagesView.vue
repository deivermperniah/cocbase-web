<script setup lang="ts">
import { ref, onBeforeUnmount, onMounted, watch } from "vue";
import { supabase } from "@/lib/supabase";
import { toast } from "@/lib/toast";
import IconTrash from "~icons/ph/trash";
import IconImage from "~icons/ph/image";
import IconServer from "~icons/ph/hard-drives";
import LoadingState from "@/components/ui/LoadingState.vue";
import PageHeader from "@/components/ui/PageHeader.vue";
import BaseBadge from "@/components/ui/BaseBadge.vue";
import EmptyState from "@/components/ui/EmptyState.vue";
import ModalShell from "@/components/ui/ModalShell.vue";

interface Img {
  name: string;
  path: string;
  url: string;
  size?: number;
  inUse: boolean;
}

const images = ref<Img[]>([]);
const loading = ref(true);
const loadingMore = ref(false);
const hasMore = ref(false);
const pageSize = 24;
const totalSize = ref(0);
const usedUrls = ref<Set<string>>(new Set());
const storageOffset = ref(0);
const isDeleting = ref(false);

const deleteModal = ref<{
  isOpen: boolean;
  imagePath: string | null;
  imageName: string | null;
  inUse: boolean;
}>({
  isOpen: false,
  imagePath: null,
  imageName: null,
  inUse: false,
});

const FOLDER = "";

async function loadUsedUrls() {
  const { data, error } = await supabase
    .from("bases")
    .select("url_foto")
    .not("url_foto", "is", null)
    .limit(10000);
  if (error) {
    console.error("Error loading used urls:", error);
    return;
  }
  usedUrls.value = new Set((data || []).map((r: any) => r.url_foto).filter(Boolean));
}

async function loadImages(reset = false) {
  if (reset) {
    images.value = [];
    totalSize.value = 0;
    hasMore.value = false;
    storageOffset.value = 0;
    loading.value = true;
  } else {
    loadingMore.value = true;
  }

  const offset = storageOffset.value;

  const { data, error } = await supabase.storage
    .from("bases-fotos")
    .list(FOLDER, {
      limit: pageSize,
      offset,
      sortBy: { column: "created_at", order: "desc" },
    });

  if (error) {
    console.error("Error listando storage:", error);
    toast.error("No se pudieron cargar las imágenes.");
    loading.value = false;
    loadingMore.value = false;
    return;
  }

  const batch: Img[] = [];

  for (const file of data || []) {
    if (!file.name.match(/\.(jpg|jpeg|png|webp)$/i)) continue;

    const fullPath = file.name;
    const { data: publicUrl } = supabase.storage
      .from("bases-fotos")
      .getPublicUrl(fullPath);

    const size = file.metadata?.size || 0;

    batch.push({
      name: file.name,
      path: fullPath,
      url: publicUrl.publicUrl,
      size,
      inUse: usedUrls.value.has(publicUrl.publicUrl),
    });

    totalSize.value += size;
  }

  if (reset) {
    images.value = batch;
  } else {
    images.value = images.value.concat(batch);
  }

  storageOffset.value += (data || []).length;
  hasMore.value = (data || []).length === pageSize;
  loading.value = false;
  loadingMore.value = false;
}

function loadMore() {
  loadImages(false);
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0.00";
  const mb = bytes / (1024 * 1024);
  return mb.toFixed(2);
}

function openDeleteModal(imagePath: string, imageName: string, inUse = false) {
  deleteModal.value = {
    isOpen: true,
    imagePath,
    imageName,
    inUse,
  };
}

function closeDeleteModal() {
  deleteModal.value = {
    isOpen: false,
    imagePath: null,
    imageName: null,
    inUse: false,
  };
}

async function confirmDelete() {
  const imagePath = deleteModal.value.imagePath;
  if (!imagePath || isDeleting.value) return;

  isDeleting.value = true;
  try {
    if (deleteModal.value.inUse) {
      const { data: publicUrl } = supabase.storage
        .from("bases-fotos")
        .getPublicUrl(imagePath);
      const { error: referencesError } = await supabase
        .from("bases")
        .update({ url_foto: null })
        .eq("url_foto", publicUrl.publicUrl);
      if (referencesError) throw referencesError;
    }

    const { error } = await supabase.storage
      .from("bases-fotos")
      .remove([imagePath]);
    if (error) throw error;

    const deletedImage = images.value.find((img) => img.path === imagePath);
    if (deletedImage?.size) {
      totalSize.value -= deletedImage.size;
    }

    images.value = images.value.filter((img) => img.path !== imagePath);
    storageOffset.value = Math.max(0, storageOffset.value - 1);
    toast.success("Imagen eliminada.");
    closeDeleteModal();
  } catch (error) {
    console.error("Error eliminando imagen:", error);
    toast.error("No se pudo eliminar la imagen.");
  } finally {
    isDeleting.value = false;
  }
}

onMounted(async () => {
  await loadUsedUrls();
  await loadImages(true);
});

onBeforeUnmount(() => {
  document.body.style.overflow = "";
});

watch(
  () => deleteModal.value.isOpen,
  (val) => {
    if (val) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
  }
);
</script>

<template>
  <LoadingState v-if="loading" />

  <div
    v-else
    class="space-y-page animate-in fade-in slide-in-from-bottom-2 duration-700 ease-out"
  >
    <PageHeader title="Imágenes">
      <template #actions>
        <div class="flex items-center gap-2">
          <IconImage class="w-4 h-4 text-yellow-400" />
          <span class="text-white text-sm">{{ images.length }}</span>
        </div>
        <div class="flex items-center gap-2">
          <IconServer class="w-4 h-4 text-yellow-400" />
          <span class="text-white text-sm">{{ formatBytes(totalSize) }} MB</span>
        </div>
      </template>
    </PageHeader>

    <div class="space-y-page">
      <div
        v-if="images.length > 0"
        class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-page"
      >
        <div
          v-for="img in images"
          :key="img.path"
          class="group relative overflow-hidden bg-card border border-border shadow-2xl transition-all rounded-xl"
        >
          <div class="aspect-video relative overflow-hidden bg-secondary">
            <img
              :src="img.url"
              loading="lazy"
              decoding="async"
              class="block w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
            <div
              class="pointer-events-none absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-60 group-hover:opacity-40 transition-opacity"
            ></div>

            <div class="pointer-events-none absolute bottom-4 left-4 z-20">
              <BaseBadge :variant="img.inUse ? 'accent' : 'danger'" shadow>
                {{ img.inUse ? "En uso" : "Huérfana" }}
              </BaseBadge>
            </div>
          </div>

          <div class="p-page">
            <div class="flex items-center justify-between gap-3">
              <h3
                class="text-sm text-white group-hover:text-yellow-400 transition-colors leading-none truncate flex-1"
                :title="img.name"
              >
                {{ img.name }}
              </h3>

              <div class="flex gap-2">
                <button
                  @click="openDeleteModal(img.path, img.name, img.inUse)"
                  class="cursor-pointer p-2.5 rounded-lg bg-secondary text-muted-foreground hover:bg-red-600 hover:text-white transition-all border border-border"
                >
                  <IconTrash class="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <EmptyState v-else message="Sin imágenes" />

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
      :open="deleteModal.isOpen"
      title="Eliminar"
      border-class="border-red-500/20"
      @close="closeDeleteModal"
    >
      <div class="bg-secondary rounded-xl p-page border border-border">
        <p class="text-muted-foreground text-xs mb-1">Imagen seleccionada:</p>
        <p class="text-white truncate text-sm">
          {{ deleteModal.imageName }}
        </p>
      </div>

      <p v-if="deleteModal.inUse" class="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-400">
        Esta imagen está en uso. La base que la usa quedará sin foto.
      </p>

      <div class="flex gap-page pt-2">
        <button
          @click="closeDeleteModal"
          class="flex-1 cursor-pointer h-[44px] rounded-full bg-secondary border border-border text-muted-foreground text-xs hover:text-white transition-all active:scale-95"
        >
          Cancelar
        </button>
        <button
          @click="confirmDelete"
          :disabled="isDeleting"
          class="flex-1 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed h-[44px] rounded-full bg-red-600 text-white text-xs hover:bg-red-500 transition-all active:scale-95 shadow-xl shadow-red-600/20"
        >
          Eliminar
        </button>
      </div>
    </ModalShell>
  </div>
</template>
