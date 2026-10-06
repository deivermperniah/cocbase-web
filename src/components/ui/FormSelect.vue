<script setup lang="ts">
import { useId } from "vue";

defineProps<{ label: string; options: { value: string; label: string }[]; placeholder?: string }>();

const model = defineModel<string>({ required: true });
const id = useId();
</script>

<template>
  <div class="flex flex-col gap-2">
    <label :for="id" class="text-xs text-muted-foreground">{{ label }}</label>
    <select
      :id="id"
      v-model="model"
      class="h-11 w-full cursor-pointer rounded-lg border border-border bg-secondary px-3 text-sm text-white outline-none focus:border-primary"
    >
      <option v-if="placeholder" value="" disabled>{{ placeholder }}</option>
      <option v-for="option in options" :key="option.value" :value="option.value">{{ option.label }}</option>
    </select>
  </div>
</template>
