<script setup lang="ts">
import IconSync from "~icons/ph/arrows-clockwise";

withDefaults(defineProps<{ size?: "sm" | "lg" }>(), { size: "lg" });
</script>

<template>
  <div class="flex flex-col items-center justify-center" :class="size === 'lg' ? 'min-h-[50vh]' : 'py-8'">
    <IconSync class="mb-page animate-spin text-primary" :class="size === 'lg' ? 'h-12 w-12' : 'h-6 w-6'" />
    <span class="text-sm">Cargando...</span>
  </div>
</template>
