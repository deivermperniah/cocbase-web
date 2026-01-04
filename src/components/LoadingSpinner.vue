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
    <Loader2 :class="[sizeClasses[size], 'animate-spin text-yellow-500']" />
    <p class="text-zinc-500 text-sm font-medium uppercase tracking-widest mt-4">
      Cargando...
    </p>
  </div>
</template>
