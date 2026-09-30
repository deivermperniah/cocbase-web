<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import MainLayout from '@/layout/MainLayout.vue'
import ToastContainer from '@/components/ToastContainer.vue'

const route = useRoute()
const isRouterReady = ref(false)
useRouter().isReady().finally(() => (isRouterReady.value = true))
const isAuthScreen = computed(() => route.name === 'login' || route.name === 'register')
</script>

<template>
  <template v-if="isRouterReady">
    <RouterView v-if="isAuthScreen" />
    <MainLayout v-else>
      <RouterView />
    </MainLayout>
  </template>

  <Transition leave-active-class="transition-opacity duration-500" leave-to-class="opacity-0">
    <div v-if="!isRouterReady" class="fixed inset-0 z-[200] flex items-center justify-center bg-background">
      <img src="/pwa-192x192.png" alt="cocbase" width="64" height="64" class="h-16 w-16 animate-pulse" />
    </div>
  </Transition>
  <ToastContainer />
</template>
