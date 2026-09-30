<script setup lang="ts">
import { computed } from "vue";

const props = withDefaults(
  defineProps<{
    variant?: "accent" | "danger";
    icon?: any;
    shadow?: boolean;
  }>(),
  { variant: "accent", icon: undefined, shadow: false }
);

const variantClass = computed(() => {
  switch (props.variant) {
    case "danger":
      return "bg-red-500/90 text-white";
    default:
      return "bg-yellow-400 text-black";
  }
});
</script>

<template>
  <span
    class="flex h-6 shrink-0 items-center gap-2 rounded-md px-3 text-xs"
    :class="[variantClass, shadow && 'shadow-lg']"
  >
    <component :is="icon" v-if="icon" class="h-3.5 w-3.5" />
    <slot />
  </span>
</template>
