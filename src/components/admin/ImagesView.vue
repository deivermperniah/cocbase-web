<script setup lang="ts">
import { computed, ref } from "vue";
import IconImage from "~icons/ph/image";
import IconServer from "~icons/ph/hard-drives";
import AuthGate from "@/components/auth/AuthGate.vue";
import AppButton from "@/components/ui/AppButton.vue";
import Badge from "@/components/ui/Badge.vue";
import CardSkeletonGrid from "@/components/ui/CardSkeletonGrid.vue";
import EmptyState from "@/components/ui/EmptyState.vue";
import PageHeader from "@/components/ui/PageHeader.vue";
import { fetchUsedImageUrls } from "@/lib/admin";
import { listImages, type StoredImage } from "@/lib/storage";

const PAGE_SIZE = 24;

const images = ref<StoredImage[]>([]);
const usedUrls = ref(new Set<string>());
const offset = ref(0);
const hasMore = ref(false);
const loading = ref(true);
const loadingMore = ref(false);
const loadError = ref(false);

const totalMb = computed(() => (images.value.reduce((sum, img) => sum + img.size, 0) / (1024 * 1024)).toFixed(2));

function isInUse(image: StoredImage) {
  return usedUrls.value.has(image.url);
}

async function loadMore() {
  loadingMore.value = true;
  try {
    const result = await listImages(offset.value, PAGE_SIZE);
    images.value = images.value.concat(result.images);
    offset.value += result.fetched;
    hasMore.value = result.fetched === PAGE_SIZE;
  } catch (error) {
    console.error("Error listing images:", error);
    loadError.value = true;
  } finally {
    loadingMore.value = false;
  }
}

async function load() {
  loading.value = true;
  loadError.value = false;
  images.value = [];
  offset.value = 0;
  try {
    usedUrls.value = await fetchUsedImageUrls();
    await loadMore();
  } catch (error) {
    console.error("Error loading images:", error);
    loadError.value = true;
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <AuthGate access="admin" @ready="load">
    <div class="space-y-page">
      <PageHeader title="Imágenes">
        <template v-if="!loading && !loadError" #actions>
          <span class="flex items-center gap-2 text-sm text-white">
            <IconImage class="h-4 w-4 text-primary" />
            {{ images.length }}
          </span>
          <span class="flex items-center gap-2 text-sm text-white">
            <IconServer class="h-4 w-4 text-primary" />
            {{ totalMb }} MB
          </span>
        </template>
      </PageHeader>

      <CardSkeletonGrid v-if="loading" />

      <EmptyState v-else-if="loadError" message="No se pudieron cargar las imágenes">
        <AppButton @click="load">Reintentar</AppButton>
      </EmptyState>

      <EmptyState v-else-if="images.length === 0" message="Sin imágenes" />

      <template v-else>
        <div class="card-grid">
          <div v-for="img in images" :key="img.name" class="group overflow-hidden rounded-xl border border-border bg-card shadow-2xl">
            <div class="relative aspect-video overflow-hidden bg-secondary">
              <img
                :src="img.url"
                :alt="img.name"
                loading="lazy"
                width="1280"
                height="720"
                class="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div class="absolute left-4 top-4">
                <Badge :variant="isInUse(img) ? 'accent' : 'danger'">{{ isInUse(img) ? "En uso" : "Huérfana" }}</Badge>
              </div>
            </div>
            <div class="flex min-h-[68px] items-center gap-3 p-page">
              <h3 class="flex-1 truncate text-sm text-white group-hover:text-primary">{{ img.name }}</h3>
            </div>
          </div>
        </div>

        <div v-if="hasMore" class="flex justify-center pt-6">
          <AppButton variant="outline" :loading="loadingMore" @click="loadMore">Mostrar más</AppButton>
        </div>
      </template>
    </div>
  </AuthGate>
</template>
