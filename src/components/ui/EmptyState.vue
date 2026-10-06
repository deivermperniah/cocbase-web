<script setup lang="ts">
defineProps<{ message: string }>();
</script>

<template>
  <div class="flex flex-col items-center gap-page py-8 text-center">
    <p class="text-sm text-muted-foreground">{{ message }}</p>
    <slot />
  </div>
</template>
