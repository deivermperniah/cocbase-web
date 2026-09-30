<script setup lang="ts">
import { ref } from "vue";
import IconBusiness from "~icons/ph/buildings";
import IconImage from "~icons/ph/image";
import BaseBadge from "@/components/ui/BaseBadge.vue";
import { getBaseTypeIcon } from "@/lib/base";

defineProps<{
  base: { level_th: number; type: string; url_foto?: string | null };
}>();

const emit = defineEmits<{ (e: "open-image"): void }>();

const isLoaded = ref(false);
</script>

<template>
  <div class="group relative overflow-hidden rounded-xl border border-border bg-card shadow-2xl transition-all">
    <div class="relative aspect-video overflow-hidden bg-secondary">
      <template v-if="base.url_foto">
        <div v-if="!isLoaded" class="absolute inset-0 animate-pulse bg-secondary"></div>
        <button
          type="button"
          class="absolute inset-0 z-10 block h-full w-full cursor-zoom-in"
          :aria-label="`Ver imagen de ${base.type} nivel ${base.level_th}`"
          @click="emit('open-image')"
        >
          <img
            :src="base.url_foto"
            alt=""
            loading="lazy"
            decoding="async"
            width="1280"
            height="720"
            class="block h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
            @load="isLoaded = true"
          />
        </button>
      </template>
      <div v-else class="flex h-full w-full flex-col items-center justify-center gap-2 text-muted-foreground">
        <IconImage class="h-8 w-8" />
        <span class="text-xs">Sin imagen</span>
      </div>

      <div
        class="pointer-events-none absolute inset-0 z-10 bg-gradient-to-t from-black via-black/20 to-transparent opacity-60 transition-opacity group-hover:opacity-40"
      ></div>

      <div class="pointer-events-none absolute bottom-4 left-4 z-20 flex items-center gap-2">
        <BaseBadge variant="accent" :icon="IconBusiness" shadow>{{ base.level_th }}</BaseBadge>
        <BaseBadge variant="accent" :icon="getBaseTypeIcon(base.type)" shadow>{{ base.type }}</BaseBadge>
      </div>
    </div>

    <div class="p-page">
      <slot />
    </div>
  </div>
</template>
