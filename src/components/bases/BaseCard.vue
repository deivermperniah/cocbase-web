<script setup lang="ts">
import { ref } from "vue";
import IconBuildings from "~icons/ph/buildings";
import IconImage from "~icons/ph/image";
import Badge from "@/components/ui/Badge.vue";
import { getBaseTypeIcon, type Base } from "@/lib/bases";

defineProps<{ base: Base }>();
const emit = defineEmits<{ openImage: [] }>();

const isLoaded = ref(false);
</script>

<template>
  <div class="group overflow-hidden rounded-xl border border-border bg-card shadow-2xl">
    <div class="relative aspect-video overflow-hidden bg-secondary">
      <button v-if="base.url_foto" type="button" class="block h-full w-full cursor-zoom-in" @click="emit('openImage')">
        <div v-if="!isLoaded" class="absolute inset-0 animate-pulse bg-secondary"></div>
        <img
          :src="base.url_foto"
          alt=""
          loading="lazy"
          width="1280"
          height="720"
          class="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
          @load="isLoaded = true"
        />
      </button>
      <div v-else class="flex h-full w-full flex-col items-center justify-center gap-2 text-muted-foreground">
        <IconImage class="h-8 w-8" />
        <span class="text-xs">Sin imagen</span>
      </div>

      <div
        class="pointer-events-none absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-60 transition-opacity group-hover:opacity-40"
      ></div>

      <div class="pointer-events-none absolute bottom-4 left-4 flex items-center gap-2">
        <Badge :icon="IconBuildings">{{ base.level_th }}</Badge>
        <Badge :icon="getBaseTypeIcon(base.type)">{{ base.type }}</Badge>
      </div>
    </div>

    <div class="p-page">
      <slot />
    </div>
  </div>
</template>
