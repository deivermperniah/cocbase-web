<script setup lang="ts">
import { computed, ref, useId } from "vue";
import IconEye from "~icons/ph/eye";
import IconEyeOff from "~icons/ph/eye-slash";
import IconX from "~icons/ph/x";

const props = withDefaults(
  defineProps<{
    label: string;
    type?: string;
    placeholder?: string;
    autocomplete?: string;
    required?: boolean;
    clearable?: boolean;
    invalid?: boolean;
  }>(),
  { type: "text" },
);

const model = defineModel<string>({ required: true });

const id = useId();
const showPassword = ref(false);
const isPassword = computed(() => props.type === "password");
const inputType = computed(() => (isPassword.value && showPassword.value ? "text" : props.type));
const iconButtonClass = "absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-muted-foreground hover:text-white";
</script>

<template>
  <div class="flex flex-col gap-2">
    <label :for="id" class="text-xs text-muted-foreground">{{ label }}</label>
    <div class="relative">
      <input
        :id="id"
        v-model="model"
        :type="inputType"
        :placeholder="placeholder"
        :autocomplete="autocomplete"
        :required="required"
        class="h-11 w-full rounded-lg border bg-secondary px-3 text-sm text-white outline-none placeholder:text-muted-foreground"
        :class="[invalid ? 'border-red-500' : 'border-border focus:border-primary', (isPassword || clearable) && 'pr-10']"
      />
      <button v-if="isPassword" type="button" :class="iconButtonClass" @click="showPassword = !showPassword">
        <component :is="showPassword ? IconEye : IconEyeOff" class="h-4 w-4" />
      </button>
      <button v-else-if="clearable && model" type="button" :class="iconButtonClass" @click="model = ''">
        <IconX class="h-4 w-4" />
      </button>
    </div>
  </div>
</template>
