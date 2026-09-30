<script setup lang="ts">
import { computed } from "vue";
import { useRoute } from "vue-router";
import MainLayout from "@/layout/MainLayout.vue";
import ToastContainer from "@/components/ToastContainer.vue";

const route = useRoute();
const isAuthScreen = computed(() => route.name === "login" || route.name === "register");
</script>

<template>
  <RouterView v-if="isAuthScreen" />
  <MainLayout v-else>
    <RouterView />
  </MainLayout>
  <ToastContainer />
</template>
