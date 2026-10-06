<script setup lang="ts">
import { ref, watch } from "vue";
import IconClose from "~icons/ph/x";
import IconZoomIn from "~icons/ph/plus-circle";
import IconZoomOut from "~icons/ph/minus-circle";

const props = defineProps<{ url: string | null }>();
const emit = defineEmits<{ close: [] }>();

const scale = ref(1);
const buttonClass = "cursor-pointer rounded-full p-2 text-muted-foreground hover:bg-primary/10 hover:text-primary";

function zoom(amount: number) {
  scale.value = Math.min(3, Math.max(1, scale.value + amount));
}

watch(
  () => props.url,
  (url) => {
    scale.value = 1;
    document.body.style.overflow = url ? "hidden" : "";
  },
);
</script>

<template>
  <Teleport v-if="url" to="body">
    <div class="fixed inset-0 z-[110] flex flex-col bg-card/95 backdrop-blur-xl">
      <button
        type="button"
        class="absolute right-4 top-4 z-10 cursor-pointer rounded-full bg-secondary p-2 text-muted-foreground hover:text-white sm:right-6 sm:top-6"
        @click="emit('close')"
      >
        <IconClose class="h-5 w-5" />
      </button>

      <div class="flex min-h-0 flex-1 overflow-auto" @click.self="emit('close')">
        <img
          :src="url"
          alt=""
          class="m-auto max-w-none object-contain transition-[width] duration-200"
          :style="{ width: `${scale * 100}%`, maxHeight: scale === 1 ? '100%' : 'none' }"
          @wheel.prevent="zoom($event.deltaY > 0 ? -0.1 : 0.1)"
        />
      </div>

      <div
        class="absolute bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-full border border-border bg-card p-1 sm:bottom-6"
      >
        <button type="button" :class="buttonClass" @click="zoom(-0.25)">
          <IconZoomOut class="h-4 w-4" />
        </button>
        <span class="min-w-14 text-center text-xs text-primary">{{ Math.round(scale * 100) }}%</span>
        <button type="button" :class="buttonClass" @click="zoom(0.25)">
          <IconZoomIn class="h-4 w-4" />
        </button>
      </div>
    </div>
  </Teleport>
</template>
