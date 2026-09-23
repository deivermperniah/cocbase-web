<script setup lang="ts">
import IconArrowRight from "~icons/ph/arrow-right";
</script>

<template>
  <div class="flex min-h-[60vh] flex-col items-center justify-center text-center animate-in fade-in slide-in-from-bottom-2 duration-700 ease-out">
    <p class="text-[96px] leading-none text-yellow-400">404</p>
    <h2 class="mt-2 text-2xl text-white">Página no encontrada</h2>
    <p class="mt-2 font-body text-sm text-muted-foreground">
      La página que buscas no existe o fue movida.
    </p>

    <router-link
      to="/"
      class="mt-8 flex cursor-pointer items-center justify-center gap-2 px-6 h-12 rounded-full bg-yellow-400 text-black text-sm hover:bg-yellow-300 transition-all active:scale-95 shadow-xl shadow-yellow-400/20"
    >
      Volver al inicio
      <IconArrowRight class="h-4 w-4" />
    </router-link>
  </div>
</template>
