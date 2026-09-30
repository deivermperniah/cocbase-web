<script setup lang="ts">
import IconSync from "~icons/ph/arrows-clockwise";

interface Props {
  size?: "sm" | "md" | "lg";
}

withDefaults(defineProps<Props>(), {
  size: "md",
});

const sizeClasses = {
  sm: "w-6 h-6",
  md: "w-8 h-8",
  lg: "w-12 h-12",
};
</script>

<template>
  <div role="status" class="flex flex-col items-center justify-center">
    <IconSync :class="[sizeClasses[size], 'animate-spin text-yellow-400 mb-page']" />
    <span class="text-foreground text-sm"> Cargando... </span>
  </div>
</template>
