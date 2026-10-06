<script lang="ts">
let openModals = 0;

function lockScroll(delta: number) {
  openModals = Math.max(0, openModals + delta);
  document.body.style.overflow = openModals > 0 ? "hidden" : "";
}
</script>

<script setup lang="ts">
import { onBeforeUnmount, watch } from "vue";
import IconX from "~icons/ph/x";

const props = withDefaults(defineProps<{ open: boolean; title: string; size?: "md" | "lg" | "xl"; danger?: boolean }>(), {
  size: "md",
});

const emit = defineEmits<{ close: [] }>();

const sizes = { md: "max-w-md", lg: "max-w-lg", xl: "max-w-2xl" };

function onKeydown(event: KeyboardEvent) {
  if (event.key === "Escape") emit("close");
}

watch(
  () => props.open,
  (open) => {
    lockScroll(open ? 1 : -1);
    if (open) window.addEventListener("keydown", onKeydown);
    else window.removeEventListener("keydown", onKeydown);
  },
);

onBeforeUnmount(() => {
  if (props.open) lockScroll(-1);
  window.removeEventListener("keydown", onKeydown);
});
</script>

<template>
  <Teleport v-if="open" to="body">
    <div class="fixed inset-0 z-[100] flex items-center justify-center p-page">
      <div class="absolute inset-0 bg-card/90 backdrop-blur-xl" @click="emit('close')"></div>

      <div
        class="relative max-h-[90vh] w-full space-y-page overflow-y-auto rounded-[1.25rem] border bg-card p-page shadow-[0_0_50px_rgba(0,0,0,0.5)]"
        :class="[sizes[size], danger ? 'border-red-500/20' : 'border-primary/20']"
      >
        <div class="flex items-center justify-between">
          <h2 class="text-lg text-primary">{{ title }}</h2>
          <button
            type="button"
            class="cursor-pointer rounded-full bg-secondary p-2 text-muted-foreground transition-all hover:text-white"
            @click="emit('close')"
          >
            <IconX class="h-5 w-5" />
          </button>
        </div>
        <slot />
      </div>
    </div>
  </Teleport>
</template>
