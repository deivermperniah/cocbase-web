<script setup lang="ts">
import IconCopy from "~icons/ph/copy";

defineProps<{ link: string | null }>();
</script>

<template>
  <a
    v-if="link"
    :href="link"
    target="_blank"
    rel="noopener noreferrer"
    class="flex flex-1 items-center justify-center gap-2 rounded-lg border border-border bg-secondary px-3 py-2.5 text-xs text-muted-foreground transition-all hover:bg-primary/10 hover:text-primary"
  >
    <IconCopy class="h-4 w-4" />
    Copiar Base
  </a>
  <span
    v-else
    title="Esta base no tiene enlace (Nivel 3)"
    class="flex flex-1 cursor-not-allowed items-center justify-center gap-2 rounded-lg border border-border bg-secondary px-3 py-2.5 text-xs text-muted-foreground/50"
  >
    <IconCopy class="h-4 w-4" />
    Copiar Base
  </span>
</template>
