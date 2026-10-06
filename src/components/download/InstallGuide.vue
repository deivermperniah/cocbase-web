<script setup lang="ts">
import { ref } from "vue";
import IconListChecks from "~icons/ph/list-checks";
import IconAndroid from "~icons/ph/android-logo";
import IconApple from "~icons/ph/apple-logo";
import IconBrowsers from "~icons/ph/browsers";
import AppButton from "@/components/ui/AppButton.vue";
import Modal from "@/components/ui/Modal.vue";

const sections = [
  {
    icon: IconAndroid,
    title: "Android (Chrome)",
    steps: [
      "Abre el menú del navegador (los tres puntos)",
      'Toca "Instalar app" o "Añadir a pantalla de inicio".',
      "Confirma para instalar cocbase",
    ],
  },
  {
    icon: IconApple,
    title: "iPhone / iPad (Safari)",
    steps: ["Toca el botón Compartir", 'Elige "Añadir a pantalla de inicio".', 'Confirma con "Añadir".'],
  },
  {
    icon: IconBrowsers,
    title: "Escritorio (Chrome / Edge)",
    steps: ["Haz clic en el ícono de instalar de la barra de direcciones", 'Confirma con "Instalar".'],
  },
];

const isOpen = ref(false);
</script>

<template>
  <AppButton size="lg" :icon="IconListChecks" class="w-full" @click="isOpen = true">Guía paso a paso</AppButton>

  <Modal :open="isOpen" title="Guía paso a paso" size="lg" @close="isOpen = false">
    <p class="text-xs text-muted-foreground">Instala cocbase como app en tu dispositivo</p>
    <div v-for="section in sections" :key="section.title" class="space-y-2">
      <div class="flex items-center gap-2">
        <component :is="section.icon" class="h-5 w-5 text-primary" />
        <h3 class="text-sm text-white">{{ section.title }}</h3>
      </div>
      <ol class="space-y-1">
        <li v-for="(step, index) in section.steps" :key="step" class="flex gap-2 text-xs text-muted-foreground">
          <span class="text-primary">{{ index + 1 }}.</span>
          <span>{{ step }}</span>
        </li>
      </ol>
    </div>
  </Modal>
</template>
