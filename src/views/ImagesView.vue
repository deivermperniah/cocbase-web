<script setup lang="ts">
import { ref, onBeforeUnmount, onMounted, watch } from "vue";
import { supabase } from "@/lib/supabase";
import {
  Trash2,
  ExternalLink,
  Image as ImageIcon,
  HardDrive,
  Plus,
} from "lucide-vue-next";
import LoadingSpinner from "@/components/LoadingSpinner.vue";

interface Img {
  name: string;
  path: string;
  url: string;
  size?: number;
}

const images = ref<Img[]>([]);
const loading = ref(true);
const totalSize = ref(0);
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

async function loadImages() {
  images.value = [];
  totalSize.value = 0;

  const { data, error } = await supabase.storage
    .from("bases-fotos")
    .list(FOLDER, {
      limit: 100,
      sortBy: { column: "created_at", order: "desc" },
    });

  if (error) {
    console.error("❌ ERROR LISTANDO STORAGE:", error);
    loading.value = false;
    return;
  }

  if (!data) {
    loading.value = false;
    return;
  }

  for (const file of data) {
    if (!file.name.match(/\.(jpg|jpeg|png|webp)$/i)) continue;

    const fullPath = file.name;
    const { data: publicUrl } = supabase.storage
      .from("bases-fotos")
      .getPublicUrl(fullPath);

    images.value.push({
      name: file.name,
      path: fullPath,
      url: publicUrl.publicUrl,
      size: file.metadata?.size,
    });

    if (file.metadata?.size) {
      totalSize.value += file.metadata.size;
    }
  }

  loading.value = false;
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 MB";
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

onMounted(loadImages);

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
          <ImageIcon class="w-4 h-4 text-yellow-400" />
          <span
            class="text-white text-sm"
            >{{ images.length }}</span
          >
        </div>
        <div class="flex items-center gap-2">
          <HardDrive class="w-4 h-4 text-yellow-400" />
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
              class="block w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
            <div
              class="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-60 group-hover:opacity-40 transition-opacity"
            ></div>
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
                  class="cursor-pointer p-2.5 rounded-lg bg-secondary text-muted-foreground hover:bg-yellow-400 hover:text-black transition-all border border-border"
                >
                  <ExternalLink class="w-4 h-4" />
                </a>
                <button
                  @click="openDeleteModal(img.path, img.name)"
                  class="cursor-pointer p-2.5 rounded-lg bg-secondary text-muted-foreground hover:bg-red-600 hover:text-white transition-all border border-border"
                >
                  <Trash2 class="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-else class="text-center">
        <p class="text-muted-foreground text-sm ">
          Sin imágenes en el storage
        </p>
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
                <Plus class="w-5 h-5 rotate-45" />
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
