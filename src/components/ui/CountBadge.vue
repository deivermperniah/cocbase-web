<script setup lang="ts">
defineProps<{ count?: number }>();
</script>

<template>
  <span v-if="count" class="flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1.5 text-[11px] text-white">
    {{ count > 99 ? "99+" : count }}
  </span>
</template>
