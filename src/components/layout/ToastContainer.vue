<script setup lang="ts">
import IconCheck from "~icons/ph/check-circle";
import IconWarning from "~icons/ph/warning";
import IconClose from "~icons/ph/x";
import { dismissToast, toasts } from "@/lib/toast";
</script>

<template>
  <div class="fixed right-4 top-3 z-[200] flex w-full max-w-sm flex-col gap-3 px-page">
    <div
      v-for="t in toasts"
      :key="t.id"
      class="flex items-start gap-3 rounded-xl border bg-card p-4 shadow-2xl"
      :class="t.variant === 'error' ? 'border-red-500/30' : 'border-primary/20'"
    >
      <IconWarning v-if="t.variant === 'error'" class="mt-0.5 h-5 w-5 shrink-0 text-red-500" />
      <IconCheck v-else class="mt-0.5 h-5 w-5 shrink-0 text-primary" />
      <div class="min-w-0 flex-1">
        <p class="text-sm text-white">{{ t.title }}</p>
        <p v-if="t.description" class="mt-1 text-xs text-muted-foreground">{{ t.description }}</p>
      </div>
      <button
        type="button"
        class="shrink-0 cursor-pointer rounded-md p-1 text-muted-foreground hover:text-white"
        @click="dismissToast(t.id)"
      >
        <IconClose class="h-4 w-4" />
      </button>
    </div>
  </div>
</template>
