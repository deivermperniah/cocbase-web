<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from "vue";
import IconDownload from "~icons/ph/download-simple";
import IconAndroid from "~icons/ph/android-logo";
import IconApple from "~icons/ph/apple-logo";
import IconBrowsers from "~icons/ph/browsers";
import IconListChecks from "~icons/ph/list-checks";
import IconCheck from "~icons/ph/check";
import PageHeader from "@/components/ui/PageHeader.vue";
import ModalShell from "@/components/ui/ModalShell.vue";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const apkUrl = import.meta.env.VITE_APP_APK_URL || "/download/cocbase.apk";

const features = ["Explora bases sin conexión", "Guarda tus favoritas en el móvil", "Recibe avisos de nuevas bases"];

const guideSections = [
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

const deferredPrompt = ref<BeforeInstallPromptEvent | null>(null);
const isInstalled = ref(false);
const isGuideOpen = ref(false);

function handleBeforeInstallPrompt(e: Event) {
  e.preventDefault();
  deferredPrompt.value = e as BeforeInstallPromptEvent;
}

function handleAppInstalled() {
  isInstalled.value = true;
  deferredPrompt.value = null;
}

async function installPwa() {
  const prompt = deferredPrompt.value;
  if (!prompt) return;

  await prompt.prompt();
  const { outcome } = await prompt.userChoice;

  if (outcome === "accepted") {
    deferredPrompt.value = null;
    isGuideOpen.value = false;
  }
}

onMounted(() => {
  window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
  window.addEventListener("appinstalled", handleAppInstalled);

  if (window.matchMedia("(display-mode: standalone)").matches) {
    isInstalled.value = true;
  }
});

onBeforeUnmount(() => {
  window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
  window.removeEventListener("appinstalled", handleAppInstalled);
});
</script>

<template>
  <div class="space-y-page animate-in fade-in slide-in-from-bottom-2 duration-700 ease-out">
    <PageHeader title="Descargar app" />

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-page">
      <div class="bg-card rounded-xl border border-border p-6 sm:p-8 space-y-6">
        <div class="flex items-center gap-4">
          <div class="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-yellow-400/10">
            <IconAndroid class="h-7 w-7 text-yellow-400" />
          </div>
          <div>
            <h2 class="text-xl text-white">cocbase para Android</h2>
            <p class="text-xs text-muted-foreground">Lleva tus bases de Clash of Clans a todas partes</p>
          </div>
        </div>

        <ul class="space-y-3">
          <li v-for="feature in features" :key="feature" class="flex items-center gap-3 text-sm text-muted-foreground">
            <IconCheck class="h-4 w-4 shrink-0 text-yellow-400" />
            {{ feature }}
          </li>
        </ul>

        <a
          :href="apkUrl"
          download
          class="flex w-full cursor-pointer items-center justify-center gap-2 h-12 rounded-full bg-yellow-400 text-black text-sm hover:bg-yellow-300 transition-all active:scale-95 shadow-xl shadow-yellow-400/20"
        >
          <IconDownload class="h-5 w-5" />
          Descargar APK
        </a>
      </div>

      <div class="bg-card rounded-xl border border-border p-6 sm:p-8 space-y-6">
        <div class="flex items-center gap-4">
          <div class="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-yellow-400/10">
            <IconApple class="h-7 w-7 text-yellow-400" />
          </div>
          <div>
            <h2 class="text-xl text-white">cocbase para iOS</h2>
            <p class="text-xs text-muted-foreground">Próximamente en el App Store</p>
          </div>
        </div>

        <ul class="space-y-3">
          <li v-for="feature in features" :key="feature" class="flex items-center gap-3 text-sm text-muted-foreground">
            <IconCheck class="h-4 w-4 shrink-0 text-yellow-400" />
            {{ feature }}
          </li>
        </ul>

        <button
          type="button"
          disabled
          class="flex w-full cursor-not-allowed items-center justify-center gap-2 h-12 rounded-full bg-secondary text-muted-foreground text-sm border border-border"
        >
          <IconApple class="h-5 w-5" />
          Muy pronto
        </button>
      </div>

      <div class="bg-card rounded-xl border border-border p-6 sm:p-8 space-y-6">
        <div class="flex items-center gap-4">
          <div class="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-yellow-400/10">
            <IconBrowsers class="h-7 w-7 text-yellow-400" />
          </div>
          <div>
            <h2 class="text-xl text-white">cocbase Web</h2>
            <p class="text-xs text-muted-foreground">Instálala como app desde tu navegador</p>
          </div>
        </div>

        <ul class="space-y-3">
          <li v-for="feature in features" :key="feature" class="flex items-center gap-3 text-sm text-muted-foreground">
            <IconCheck class="h-4 w-4 shrink-0 text-yellow-400" />
            {{ feature }}
          </li>
        </ul>

        <button
          type="button"
          class="flex w-full cursor-pointer items-center justify-center gap-2 h-12 rounded-full bg-yellow-400 text-black text-sm hover:bg-yellow-300 transition-all active:scale-95 shadow-xl shadow-yellow-400/20"
          @click="isGuideOpen = true"
        >
          <IconListChecks class="h-5 w-5" />
          Guía paso a paso
        </button>
      </div>
    </div>

    <ModalShell
      :open="isGuideOpen"
      title="Guía paso a paso"
      max-width-class="max-w-lg"
      scrollable
      @close="isGuideOpen = false"
    >
      <p class="text-xs text-muted-foreground">Instala cocbase como app en tu dispositivo</p>

      <button
        v-if="deferredPrompt && !isInstalled"
        type="button"
        class="flex w-full cursor-pointer items-center justify-center gap-2 h-12 rounded-full bg-yellow-400 text-black text-sm transition-all hover:bg-yellow-300 active:scale-95"
        @click="installPwa"
      >
        <IconDownload class="h-5 w-5" />
        Instalar ahora
      </button>
      <p v-else-if="isInstalled" class="flex items-center gap-2 text-sm text-muted-foreground">
        <IconCheck class="h-4 w-4 shrink-0 text-yellow-400" />
        Ya tienes cocbase instalada
      </p>

      <div v-for="section in guideSections" :key="section.title" class="space-y-2">
        <div class="flex items-center gap-2">
          <component :is="section.icon" class="h-5 w-5 text-yellow-400" />
          <h3 class="text-sm text-white">{{ section.title }}</h3>
        </div>
        <ol class="space-y-1">
          <li v-for="(step, index) in section.steps" :key="index" class="flex gap-2 text-xs text-muted-foreground">
            <span class="text-yellow-400">{{ index + 1 }}.</span>
            <span>{{ step }}</span>
          </li>
        </ol>
      </div>
    </ModalShell>
  </div>
</template>
