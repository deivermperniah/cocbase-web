<script setup lang="ts">
import type { Component } from "vue";

withDefaults(defineProps<{ variant?: "accent" | "danger"; icon?: Component }>(), { variant: "accent" });
</script>

<template>
  <span
    class="flex h-6 shrink-0 items-center gap-2 rounded-md px-3 text-xs shadow-lg"
    :class="variant === 'danger' ? 'bg-red-500/90 text-white' : 'bg-primary text-black'"
  >
    <component :is="icon" v-if="icon" class="h-3.5 w-3.5" />
    <slot />
  </span>
</template>
