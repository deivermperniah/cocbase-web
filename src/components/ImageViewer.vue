<script setup lang="ts">
import { nextTick, onBeforeUnmount, ref, watch } from "vue";
import IconClose from "~icons/ph/x";
import IconZoomIn from "~icons/ph/plus-circle";
import IconZoomOut from "~icons/ph/minus-circle";
import { trapFocus } from "@/lib/utils";

const props = defineProps<{ open: boolean; url: string; title: string }>();
const emit = defineEmits<{ (e: "close"): void }>();

const MIN_SCALE = 0.5;
const MAX_SCALE = 3;

const scale = ref(1);
const x = ref(0);
const y = ref(0);
const isDragging = ref(false);
const isPinching = ref(false);
const activePointers = new Map<number, { x: number; y: number }>();
let pinchStartDistance = 1;
let pinchStartScale = 1;
let dragStart = { x: 0, y: 0 };

const viewerRef = ref<HTMLElement | null>(null);
const closeRef = ref<HTMLButtonElement | null>(null);
const viewportRef = ref<HTMLElement | null>(null);
let previousFocus: HTMLElement | null = null;

function reset() {
  scale.value = 1;
  x.value = 0;
  y.value = 0;
  isDragging.value = false;
  isPinching.value = false;
  activePointers.clear();
}

function clampPosition() {
  const viewport = viewportRef.value;
  if (!viewport || scale.value <= 1) return;

  const { width, height } = viewport.getBoundingClientRect();
  const maxX = (width * (scale.value - 1)) / 2;
  const maxY = (height * (scale.value - 1)) / 2;

  x.value = Math.min(maxX, Math.max(-maxX, x.value));
  y.value = Math.min(maxY, Math.max(-maxY, y.value));
}

function setScale(value: number) {
  scale.value = Math.min(MAX_SCALE, Math.max(MIN_SCALE, value));
  if (scale.value <= 1) {
    x.value = 0;
    y.value = 0;
  } else {
    clampPosition();
  }
}

function zoom(amount: number) {
  setScale(scale.value + amount);
}

function startDrag(event: PointerEvent) {
  activePointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
  (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);

  if (activePointers.size === 2) {
    isDragging.value = false;
    isPinching.value = true;
    const [a, b] = Array.from(activePointers.values());
    if (!a || !b) return;
    pinchStartDistance = Math.hypot(a.x - b.x, a.y - b.y) || 1;
    pinchStartScale = scale.value;
    return;
  }

  if (event.button !== 0 || scale.value <= 1) return;

  isDragging.value = true;
  dragStart = { x: event.clientX - x.value, y: event.clientY - y.value };
}

function move(event: PointerEvent) {
  if (!activePointers.has(event.pointerId)) return;
  activePointers.set(event.pointerId, { x: event.clientX, y: event.clientY });

  if (isPinching.value && activePointers.size >= 2) {
    const [a, b] = Array.from(activePointers.values());
    if (!a || !b) return;
    const distance = Math.hypot(a.x - b.x, a.y - b.y) || 1;
    setScale(pinchStartScale * (distance / pinchStartDistance));
    return;
  }

  if (!isDragging.value) return;

  x.value = event.clientX - dragStart.x;
  y.value = event.clientY - dragStart.y;
  clampPosition();
}

function stopDrag(event: PointerEvent) {
  activePointers.delete(event.pointerId);
  const target = event.currentTarget as HTMLElement;
  if (target.hasPointerCapture(event.pointerId)) {
    target.releasePointerCapture(event.pointerId);
  }

  if (activePointers.size < 2) {
    isPinching.value = false;
  }

  if (activePointers.size === 0) {
    isDragging.value = false;
  } else if (!isPinching.value && scale.value > 1) {
    const [remaining] = Array.from(activePointers.values());
    if (!remaining) return;
    isDragging.value = true;
    dragStart = { x: remaining.x - x.value, y: remaining.y - y.value };
  }
}

function onKeydown(event: KeyboardEvent) {
  if (event.key === "Escape") emit("close");
}

watch(
  () => props.open,
  async (open) => {
    if (open) {
      reset();
      previousFocus = document.activeElement as HTMLElement | null;
      window.addEventListener("keydown", onKeydown);
      document.body.style.overflow = "hidden";
      await nextTick();
      closeRef.value?.focus();
    } else {
      window.removeEventListener("keydown", onKeydown);
      document.body.style.overflow = "";
      previousFocus?.focus();
      previousFocus = null;
    }
  },
);

onBeforeUnmount(() => {
  window.removeEventListener("keydown", onKeydown);
  if (props.open) document.body.style.overflow = "";
});
</script>

<template>
  <Teleport to="body">
    <div
      v-if="open"
      ref="viewerRef"
      role="dialog"
      aria-modal="true"
      aria-label="Visor de imagen"
      class="fixed inset-0 z-[110] flex items-center justify-center bg-card/95 backdrop-blur-xl"
      @keydown.tab="trapFocus($event, viewerRef)"
    >
      <button
        type="button"
        class="absolute inset-0 cursor-zoom-out"
        tabindex="-1"
        aria-hidden="true"
        @click="emit('close')"
      ></button>

      <div class="relative z-10 flex h-full w-full flex-col items-center">
        <button
          ref="closeRef"
          type="button"
          class="absolute right-4 top-4 z-20 cursor-pointer rounded-full bg-secondary p-2 text-muted-foreground transition-all hover:text-white sm:right-6 sm:top-6"
          aria-label="Cerrar visor de imagen"
          @click="emit('close')"
        >
          <IconClose class="h-5 w-5" />
        </button>

        <div
          ref="viewportRef"
          class="flex min-h-0 w-full flex-1 touch-none items-center justify-center overflow-hidden"
        >
          <img
            :src="url"
            :alt="title"
            draggable="false"
            class="h-full w-full origin-center touch-none select-none object-contain"
            :class="[
              isDragging ? 'cursor-grabbing' : scale > 1 ? 'cursor-grab' : 'cursor-default',
              isDragging || isPinching ? 'transition-none' : 'transition-transform duration-200',
            ]"
            :style="{ transform: `translate(${x}px, ${y}px) scale(${scale})` }"
            @pointerdown="startDrag"
            @pointermove="move"
            @pointerup="stopDrag"
            @pointercancel="stopDrag"
            @dragstart.prevent
            @wheel.prevent="zoom($event.deltaY > 0 ? -0.1 : 0.1)"
          />
        </div>

        <div
          class="absolute bottom-4 flex items-center gap-2 rounded-full border border-border bg-card p-1 sm:bottom-6"
        >
          <button
            type="button"
            class="cursor-pointer rounded-full p-2 text-muted-foreground transition-colors hover:bg-yellow-400/10 hover:text-yellow-400"
            aria-label="Reducir zoom"
            @click="zoom(-0.25)"
          >
            <IconZoomOut class="h-4 w-4" />
          </button>
          <span class="min-w-14 text-center text-xs text-yellow-400">{{ Math.round(scale * 100) }}%</span>
          <button
            type="button"
            class="cursor-pointer rounded-full p-2 text-muted-foreground transition-colors hover:bg-yellow-400/10 hover:text-yellow-400"
            aria-label="Aumentar zoom"
            @click="zoom(0.25)"
          >
            <IconZoomIn class="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>
