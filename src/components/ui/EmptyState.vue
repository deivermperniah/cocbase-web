<script setup lang="ts">
defineProps<{ message: string }>();
</script>

<template>
  <div class="text-center">
    <p class="text-muted-foreground text-sm">{{ message }}</p>
  </div>
</template>
