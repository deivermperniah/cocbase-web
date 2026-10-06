<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from "vue";
import IconPause from "~icons/ph/pause-fill";
import IconPlay from "~icons/ph/play-fill";

const props = defineProps<{ images: string[] }>();

const current = ref(props.images[0]);
const isPaused = ref(false);
let timer: ReturnType<typeof setInterval> | undefined;

function showNext() {
  const pool = props.images.filter((url) => url !== current.value);
  const next = pool[Math.floor(Math.random() * pool.length)];
  if (!next) return;
  const img = new Image();
  img.onload = () => (current.value = next);
  img.src = next;
}

function start() {
  if (props.images.length > 1 && !timer && !isPaused.value) timer = setInterval(showNext, 5000);
}

function stop() {
  clearInterval(timer);
  timer = undefined;
}

function togglePause() {
  isPaused.value = !isPaused.value;
  if (isPaused.value) stop();
  else start();
}

onMounted(start);
onBeforeUnmount(stop);
</script>

<template>
  <div class="relative aspect-video w-full bg-black" @mouseenter="stop" @mouseleave="start">
    <Transition
      enter-active-class="transition-opacity duration-700"
      leave-active-class="transition-opacity duration-700"
      enter-from-class="opacity-0"
      leave-to-class="opacity-0"
    >
      <img
        :key="current"
        :src="current"
        alt="Ejemplo de base de Clash of Clans"
        width="788"
        height="443"
        class="absolute inset-0 h-full w-full object-cover"
      />
    </Transition>
    <button
      v-if="images.length > 1"
      type="button"
      class="absolute bottom-3 right-3 z-10 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-black/60 text-white backdrop-blur transition-colors hover:bg-primary hover:text-black"
      @click="togglePause"
    >
      <component :is="isPaused ? IconPlay : IconPause" class="h-4 w-4" />
    </button>
  </div>
</template>
