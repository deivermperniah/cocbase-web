<script setup lang="ts">
import IconX from "~icons/ph/x";

withDefaults(
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
  }
);

const emit = defineEmits<{ (e: "close"): void }>();
</script>

<template>
  <Teleport to="body">
    <div v-if="open" class="fixed inset-0 z-[100] flex items-center justify-center p-page">
      <div class="absolute inset-0 bg-card/90 backdrop-blur-xl" @click="emit('close')"></div>

      <div
        class="relative bg-card w-full rounded-[1.25rem] shadow-[0_0_50px_rgba(0,0,0,0.5)] border animate-in zoom-in-95 duration-300"
        :class="[
          maxWidthClass,
          borderClass,
          scrollable ? 'max-h-[90vh] overflow-y-auto custom-scrollbar' : 'overflow-hidden',
        ]"
      >
        <div class="p-page space-y-page">
          <div class="flex items-center justify-between">
            <h3 class="text-lg text-yellow-400">{{ title }}</h3>
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
