<script setup lang="ts">
import { SOCIAL_LINKS } from "@/lib/constants";

defineProps<{ variant: "round" | "square" }>();
</script>

<template>
  <div class="flex gap-3" :class="variant === 'round' && 'justify-center'">
    <a
      v-for="social in SOCIAL_LINKS"
      :key="social.name"
      :href="social.href"
      target="_blank"
      rel="noopener noreferrer"
      class="flex items-center justify-center text-muted-foreground transition-all hover:bg-primary hover:text-black"
      :class="
        variant === 'round'
          ? 'h-12 w-12 rounded-full border border-border bg-card hover:border-primary'
          : 'h-10 w-10 rounded-lg bg-secondary'
      "
    >
      <component :is="social.icon" class="h-5 w-5" />
    </a>
  </div>
</template>
