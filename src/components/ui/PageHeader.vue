<script setup lang="ts">
withDefaults(defineProps<{ title: string; subtitle?: string }>(), {
  subtitle: "",
});
</script>

<template>
  <div class="flex items-center justify-between gap-page">
    <div class="space-y-1">
      <h2 class="text-[28px] text-yellow-400">{{ title }}</h2>
      <p v-if="subtitle" class="text-sm text-muted-foreground">{{ subtitle }}</p>
    </div>
    <div v-if="$slots.actions" class="flex items-center gap-page">
      <slot name="actions" />
    </div>
  </div>
</template>
