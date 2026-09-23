<script setup lang="ts">
import { ref, onBeforeUnmount, onMounted, watch } from "vue";
import { supabase } from "@/lib/supabase";
import IconTrash from "~icons/ph/trash";
import IconOpen from "~icons/ph/arrow-square-out";
import IconImage from "~icons/ph/image";
import IconServer from "~icons/ph/hard-drives";
import IconAdd from "~icons/ph/plus";
import LoadingSpinner from "@/components/LoadingSpinner.vue";

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

const deleteModal = ref<{
  isOpen: boolean;
  imagePath: string | null;
  imageName: string | null;
}>({
  isOpen: false,
  imagePath: null,
  imageName: null,
});

const FOLDER = "";

async function loadUsedUrls() {
  const { data, error } = await supabase.from("bases").select("url_foto");
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
    loading.value = true;
  } else {
    loadingMore.value = true;
  }

  const offset = reset ? 0 : images.value.length;

  const { data, error } = await supabase.storage
    .from("bases-fotos")
    .list(FOLDER, {
      limit: pageSize,
      offset,
      sortBy: { column: "created_at", order: "desc" },
    });

  if (error) {
    console.error("❌ ERROR LISTANDO STORAGE:", error);
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

function openDeleteModal(imagePath: string, imageName: string) {
  deleteModal.value = {
    isOpen: true,
    imagePath,
    imageName,
  };
}

function closeDeleteModal() {
  deleteModal.value = {
    isOpen: false,
    imagePath: null,
    imageName: null,
  };
}

async function confirmDelete() {
  const imagePath = deleteModal.value.imagePath;
  if (!imagePath) return;

  const { data: publicUrl } = supabase.storage
    .from("bases-fotos")
    .getPublicUrl(imagePath);
  const { error: referencesError } = await supabase
    .from("bases")
    .update({ url_foto: null })
    .eq("url_foto", publicUrl.publicUrl);

  if (referencesError) {
    console.error("❌ ERROR LIMPIANDO REFERENCIAS:", referencesError);
    return;
  }

  const { error } = await supabase.storage
    .from("bases-fotos")
    .remove([imagePath]);

  if (error) {
    console.error("❌ ERROR ELIMINANDO:", error);
    return;
  }

  const deletedImage = images.value.find(
    (img) => img.path === imagePath
  );
  if (deletedImage?.size) {
    totalSize.value -= deletedImage.size;
  }

  images.value = images.value.filter(
    (img) => img.path !== imagePath
  );
  closeDeleteModal();
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
  <div
    v-if="loading"
    class="flex flex-col items-center justify-center min-h-[50vh]"
  >
    <LoadingSpinner size="lg" />
  </div>

  <div
    v-else
    class="space-y-[15px] animate-in fade-in slide-in-from-bottom-2 duration-700 ease-out"
  >
    <div class="flex flex-row items-center justify-between gap-[15px]">
      <div class="space-y-1">
        <h2
          class="text-[28px] text-yellow-400"
        >
          Imágenes
        </h2>
      </div>

      <div class="flex gap-[15px]">
        <div class="flex items-center gap-2">
          <IconImage class="w-4 h-4 text-yellow-400" />
          <span
            class="text-white text-sm"
            >{{ images.length }}</span
          >
        </div>
        <div class="flex items-center gap-2">
          <IconServer class="w-4 h-4 text-yellow-400" />
          <span
            class="text-white text-sm"
            >{{ formatBytes(totalSize) }} MB</span
          >
        </div>
      </div>
    </div>

    <div class="space-y-[15px]">
      <div
        v-if="images.length > 0"
        class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[15px]"
      >
        <div
          v-for="img in images"
          :key="img.path"
          class="group relative overflow-hidden bg-card shadow-2xl transition-all rounded-xl"
        >
          <div class="aspect-video relative overflow-hidden bg-secondary">
            <img
              :src="img.url"
              loading="lazy"
              decoding="async"
              class="block w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
            <div
              class="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-60 group-hover:opacity-40 transition-opacity"
            ></div>

            <span
              class="absolute top-3 left-3 z-10 flex h-6 items-center rounded-md px-3 text-xs shadow-lg"
              :class="img.inUse ? 'bg-yellow-400 text-black' : 'bg-red-500/90 text-white'"
            >
              {{ img.inUse ? "En uso" : "Huérfana" }}
            </span>
          </div>

          <div class="p-[15px]">
            <div class="flex items-center justify-between gap-3">
              <h3
                class="text-sm text-white group-hover:text-yellow-400 transition-colors leading-none truncate flex-1"
                :title="img.name"
              >
                {{ img.name }}
              </h3>

              <div class="flex gap-2">
                <a
                  :href="img.url"
                  target="_blank"
                  class="cursor-pointer p-2.5 rounded-lg bg-secondary text-muted-foreground hover:bg-yellow-400/10 hover:text-yellow-400 transition-all border border-border"
                >
                  <IconOpen class="w-4 h-4" />
                </a>
                <button
                  @click="openDeleteModal(img.path, img.name)"
                  class="cursor-pointer p-2.5 rounded-lg bg-secondary text-muted-foreground hover:bg-red-600 hover:text-white transition-all border border-border"
                >
                  <IconTrash class="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-else class="text-center">
        <p class="text-muted-foreground text-sm ">
          Sin imágenes
        </p>
      </div>

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

    <Teleport to="body">
      <div
        v-if="deleteModal.isOpen"
        class="fixed inset-0 z-[100] flex items-center justify-center p-[15px]"
      >
        <div
          class="absolute inset-0 bg-card/90 backdrop-blur-xl"
          @click="closeDeleteModal"
        ></div>

        <div
          class="relative bg-card w-full max-w-md rounded-[1.25rem] shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-red-500/20 animate-in zoom-in-95 duration-300"
        >
          <div class="p-[15px] space-y-[15px]">
            <div class="flex items-center justify-between">
              <h3
                class="text-lg text-yellow-400 "
              >
                Eliminar
              </h3>
              <button
                @click="closeDeleteModal"
                class="cursor-pointer p-2 rounded-lg bg-secondary text-muted-foreground hover:text-white transition-all"
              >
                <IconAdd class="w-5 h-5 rotate-45" />
              </button>
            </div>

            <div class="bg-secondary rounded-xl p-[15px] border border-border">
              <p
                class="text-muted-foreground text-xs mb-1"
              >
                Imágen seleccionada:
              </p>
              <p class="text-white truncate text-sm">
                {{ deleteModal.imageName }}
              </p>
            </div>

            <div class="flex gap-[15px] pt-2">
              <button
                @click="closeDeleteModal"
                class="flex-1 cursor-pointer h-[44px] rounded-full bg-secondary border border-border text-muted-foreground text-xs hover:text-white transition-all active:scale-95"
              >
                Cancelar
              </button>
              <button
                @click="confirmDelete"
                class="flex-1 cursor-pointer h-[44px] rounded-full bg-red-600 text-white text-xs hover:bg-red-500 transition-all active:scale-95 shadow-xl shadow-red-600/20"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>
