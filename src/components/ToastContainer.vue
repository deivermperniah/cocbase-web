<script setup lang="ts">
import IconCheck from "~icons/ph/check-circle"
import IconWarning from "~icons/ph/warning"
import IconInfo from "~icons/ph/info"
import IconClose from "~icons/ph/x"
import { useToast } from "@/lib/toast"

const { toasts, dismiss } = useToast()

function iconFor(variant: string) {
  if (variant === "success") return IconCheck
  if (variant === "error") return IconWarning
  return IconInfo
}

function accentFor(variant: string) {
  if (variant === "success") return "text-yellow-400"
  if (variant === "error") return "text-red-500"
  return "text-sky-400"
}
</script>

<template>
  <Teleport to="body">
    <div class="fixed top-3 right-4 z-[200] flex w-full max-w-sm flex-col gap-3 px-page">
      <TransitionGroup
        name="toast"
        tag="div"
        class="flex flex-col gap-3"
      >
        <div
          v-for="t in toasts"
          :key="t.id"
          class="pointer-events-auto flex items-start gap-3 rounded-xl border bg-card p-4 shadow-2xl"
          :class="t.variant === 'error' ? 'border-red-500/30' : 'border-yellow-400/20'"
        >
          <component :is="iconFor(t.variant)" class="mt-0.5 h-5 w-5 shrink-0" :class="accentFor(t.variant)" />
          <div class="min-w-0 flex-1">
            <p class="text-sm text-white">{{ t.title }}</p>
            <p v-if="t.description" class="mt-1 text-xs text-muted-foreground">{{ t.description }}</p>
          </div>
          <button
            type="button"
            class="cursor-pointer shrink-0 p-1 rounded-md text-muted-foreground hover:text-white transition-colors"
            @click="dismiss(t.id)"
          >
            <IconClose class="h-4 w-4" />
          </button>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: all 0.25s ease;
}
.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
