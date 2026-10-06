<script setup lang="ts">
import { onMounted, ref } from "vue";
import LoadingState from "@/components/ui/LoadingState.vue";
import { getAccessRedirect, initializeAuth, type Access } from "@/lib/auth";

const props = withDefaults(defineProps<{ access: Access; loadingSize?: "sm" | "lg" }>(), { loadingSize: "lg" });
const emit = defineEmits<{ ready: [] }>();

const isReady = ref(false);

onMounted(async () => {
  await initializeAuth().catch((error) => console.error("Error initializing auth:", error));
  const redirect = getAccessRedirect(props.access, window.location.pathname);
  if (redirect) {
    window.location.replace(redirect);
    return;
  }
  isReady.value = true;
  emit("ready");
});
</script>

<template>
  <slot v-if="isReady" />
  <LoadingState v-else :size="loadingSize" />
</template>
