<script setup lang="ts">
import { nextTick, ref, useId, watch } from "vue";
import IconX from "~icons/ph/x";
import { trapFocus } from "@/lib/utils";

const props = withDefaults(
  defineProps<{
    open: boolean;
    title: string;
    maxWidthClass?: string;
    borderClass?: string;
    scrollable?: boolean;
  }>(),
  {
    maxWidthClass: "max-w-md",
    borderClass: "border-yellow-400/20",
    scrollable: false,
  },
);

const emit = defineEmits<{ (e: "close"): void }>();

const titleId = useId();
const dialogRef = ref<HTMLElement | null>(null);
let previousFocus: HTMLElement | null = null;

watch(
  () => props.open,
  async (open) => {
    if (open) {
      previousFocus = document.activeElement as HTMLElement | null;
      await nextTick();
      dialogRef.value?.focus();
    } else {
      previousFocus?.focus();
      previousFocus = null;
    }
  },
  { immediate: true },
);
</script>

<template>
  <Teleport to="body">
    <div v-if="open" class="fixed inset-0 z-[100] flex items-center justify-center p-page" @keydown.esc="emit('close')">
      <div aria-hidden="true" class="absolute inset-0 bg-card/90 backdrop-blur-xl" @click="emit('close')"></div>

      <div
        ref="dialogRef"
        role="dialog"
        aria-modal="true"
        :aria-labelledby="titleId"
        tabindex="-1"
        class="relative bg-card w-full outline-none rounded-[1.25rem] shadow-[0_0_50px_rgba(0,0,0,0.5)] border animate-in zoom-in-95 duration-300"
        :class="[
          maxWidthClass,
          borderClass,
          scrollable ? 'max-h-[90vh] overflow-y-auto custom-scrollbar' : 'overflow-hidden',
        ]"
        @keydown.tab="trapFocus($event, dialogRef)"
      >
        <div class="p-page space-y-page">
          <div class="flex items-center justify-between">
            <h2 :id="titleId" class="text-lg text-yellow-400">{{ title }}</h2>
            <button
              type="button"
              class="cursor-pointer rounded-full bg-secondary p-2 text-muted-foreground transition-all hover:text-white"
              aria-label="Cerrar"
              @click="emit('close')"
            >
              <IconX class="w-5 h-5" />
            </button>
          </div>
          <slot />
        </div>
      </div>
    </div>
  </Teleport>
</template>
