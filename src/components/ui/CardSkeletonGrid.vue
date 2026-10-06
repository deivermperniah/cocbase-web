<script setup lang="ts">
withDefaults(defineProps<{ count?: number }>(), { count: 6 });
</script>

<template>
  <div class="card-grid">
    <div v-for="i in count" :key="i" class="overflow-hidden rounded-xl border border-border bg-card">
      <div class="aspect-video animate-pulse bg-secondary"></div>
      <div class="flex gap-2 p-page">
        <div class="h-[38px] flex-1 animate-pulse rounded-lg bg-secondary"></div>
        <div class="h-[38px] w-[38px] animate-pulse rounded-lg bg-secondary"></div>
      </div>
    </div>
  </div>
</template>
