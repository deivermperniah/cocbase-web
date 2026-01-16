<script setup lang="ts">
import { Loader2 } from 'lucide-vue-next'

interface Props {
  size?: 'sm' | 'md' | 'lg'
}

withDefaults(defineProps<Props>(), {
  size: 'md'
})

const sizeClasses = {
  sm: 'w-6 h-6',
  md: 'w-8 h-8', 
  lg: 'w-12 h-12'
}
</script>

<template>
  <div class="flex flex-col items-center justify-center">
    <Loader2 :class="[sizeClasses[size], 'animate-spin text-yellow-500 mb-4']" />
    <span class="text-foreground text-sm font-black italic uppercase tracking-[0.2em] animate-pulse">
      Cargando...
    </span>
  </div>
</template>
