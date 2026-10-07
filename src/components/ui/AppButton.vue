<script setup lang="ts">
import { computed, type Component } from "vue";
import IconSync from "~icons/ph/arrows-clockwise";

const props = withDefaults(
  defineProps<{
    variant?: "primary" | "secondary" | "outline" | "danger";
    size?: "sm" | "md" | "lg";
    href?: string;
    download?: boolean;
    icon?: Component;
    loading?: boolean;
    disabled?: boolean;
    type?: "button" | "submit";
  }>(),
  { variant: "primary", size: "md", type: "button" },
);

const variants = {
  primary: "bg-primary text-black hover:bg-yellow-300 shadow-xl shadow-primary/10",
  secondary: "bg-secondary border border-border text-muted-foreground hover:text-white",
  outline: "border-2 border-primary text-primary hover:bg-primary/10",
  danger: "border border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20",
};

const sizes = {
  sm: "h-9 px-4 text-xs",
  md: "h-11 px-page text-xs",
  lg: "h-12 px-6 text-sm",
};

const classes = computed(() => [
  "flex cursor-pointer items-center justify-center gap-2 rounded-full transition-all active:scale-95 disabled:cursor-not-allowed disabled:opacity-50",
  variants[props.variant],
  sizes[props.size],
]);
</script>

<template>
  <a v-if="href" :href="href" :download="download || undefined" :class="classes">
    <component :is="icon" v-if="icon" class="h-4 w-4" />
    <slot />
  </a>
  <button v-else :type="type" :disabled="disabled || loading" :class="classes">
    <IconSync v-if="loading" class="h-4 w-4 animate-spin" />
    <component :is="icon" v-else-if="icon" class="h-4 w-4" />
    <slot />
  </button>
</template>
