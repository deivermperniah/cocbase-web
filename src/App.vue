<script setup lang="ts">
import MainLayout from '@/layout/MainLayout.vue'
</script>

<template>
  <MainLayout>
    <RouterView />
  </MainLayout>
</template>

<style>
.animate-in {
  animation-duration: 0.3s;
}

.fade-in {
  opacity: 0;
  animation-name: fadeIn;
  animation-fill-mode: forwards;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
}

.zoom-in {
  animation-name: zoomIn;
}

@keyframes zoomIn {
  from {
    transform: scale(0.95);
    opacity: 0;
  }

  to {
    transform: scale(1);
    opacity: 1;
  }
}
</style>
