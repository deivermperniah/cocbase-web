<script setup lang="ts">
import type { Component } from "vue";

withDefaults(defineProps<{ icon: Component; href?: string; tone?: "default" | "active" | "danger" }>(), {
  tone: "default",
});

const tones = {
  default: "text-muted-foreground hover:bg-primary/10 hover:text-primary",
  active: "text-primary",
  danger: "text-red-500 hover:bg-red-600 hover:text-white",
};
</script>

<template>
  <a
    v-if="href"
    :href="href"
    target="_blank"
    rel="noopener noreferrer"
    class="shrink-0 rounded-lg border border-border bg-secondary p-2.5 transition-all"
    :class="tones[tone]"
  >
    <component :is="icon" class="h-4 w-4" />
  </a>
  <button
    v-else
    type="button"
    class="shrink-0 cursor-pointer rounded-lg border border-border bg-secondary p-2.5 transition-all"
    :class="tones[tone]"
  >
    <component :is="icon" class="h-4 w-4" />
  </button>
</template>
