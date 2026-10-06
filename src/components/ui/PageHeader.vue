<script setup lang="ts">
defineProps<{ title: string; subtitle?: string }>();
</script>

<template>
  <div class="flex items-center justify-between gap-page">
    <div class="space-y-1">
      <h1 class="text-[28px] text-primary">{{ title }}</h1>
      <p v-if="subtitle" class="text-sm text-muted-foreground">{{ subtitle }}</p>
    </div>
    <div v-if="$slots.actions" class="flex items-center gap-page">
      <slot name="actions" />
    </div>
  </div>
</template>
