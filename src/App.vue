<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import MainLayout from '@/layout/MainLayout.vue'
import { isAuthInitialized } from '@/lib/auth'

const route = useRoute()
const requiresAuth = computed(() => route.meta.requiresAuth === true)
</script>

<template>
  <div v-if="!isAuthInitialized" class="min-h-dvh bg-background" />
  <MainLayout v-else-if="requiresAuth">
    <RouterView />
  </MainLayout>
  <RouterView v-else />
</template>
