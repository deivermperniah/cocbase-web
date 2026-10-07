<script setup lang="ts">
withDefaults(defineProps<{ count?: number }>(), { count: 6 });
</script>

<template>
  <div class="card-grid">
    <div v-for="i in count" :key="i" class="overflow-hidden rounded-xl border border-border bg-card">
      <div class="skeleton aspect-video"></div>
      <div class="flex gap-2 p-page">
        <div class="skeleton h-[38px] flex-1 rounded-lg"></div>
        <div class="skeleton h-[38px] w-[38px] rounded-lg"></div>
      </div>
    </div>
  </div>
</template>
