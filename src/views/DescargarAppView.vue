<script setup lang="ts">
import { computed, ref, onMounted, onBeforeUnmount } from "vue";
import IconDownload from "~icons/ph/download-simple";
import IconAndroid from "~icons/ph/android-logo";
import IconApple from "~icons/ph/apple-logo";
import IconBrowsers from "~icons/ph/browsers";
import IconListChecks from "~icons/ph/list-checks";
import IconCheck from "~icons/ph/check";
import IconX from "~icons/ph/x";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const apkUrl = computed(() => import.meta.env.VITE_APP_APK_URL || "/download/cocbase.apk");

const features = [
  "Explora bases sin conexión",
  "Guarda tus favoritas en el móvil",
  "Recibe avisos de nuevas bases",
];

const guideSections = [
  {
    icon: IconAndroid,
    title: "Android (Chrome)",
    steps: [
      "Abre el menú del navegador (los tres puntos).",
      'Toca "Instalar app" o "Añadir a pantalla de inicio".',
      "Confirma para instalar cocbase.",
    ],
  },
  {
    icon: IconApple,
    title: "iPhone / iPad (Safari)",
    steps: [
      "Toca el botón Compartir.",
      'Elige "Añadir a pantalla de inicio".',
      'Confirma con "Añadir".',
    ],
  },
  {
    icon: IconBrowsers,
    title: "Escritorio (Chrome / Edge)",
    steps: [
      "Haz clic en el ícono de instalar de la barra de direcciones.",
      'Confirma con "Instalar".',
    ],
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
  <div class="space-y-[15px] animate-in fade-in slide-in-from-bottom-2 duration-700 ease-out">
    <h2 class="text-[28px] text-yellow-400">Descargar app</h2>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[15px]">
      <div class="bg-card rounded-xl border border-border p-6 sm:p-8 space-y-6">
        <div class="flex items-center gap-4">
          <div class="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-yellow-400/10">
            <IconAndroid class="h-7 w-7 text-yellow-400" />
          </div>
          <div>
            <h3 class="text-xl text-white">cocbase para Android</h3>
            <p class="text-xs text-muted-foreground">Lleva tus bases de Clash of Clans a todas partes.</p>
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
            <h3 class="text-xl text-white">cocbase para iOS</h3>
            <p class="text-xs text-muted-foreground">Próximamente en el App Store.</p>
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
            <h3 class="text-xl text-white">cocbase Web</h3>
            <p class="text-xs text-muted-foreground">Instálala como app desde tu navegador.</p>
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

    <Teleport to="body">
      <div v-if="isGuideOpen" class="fixed inset-0 z-[100] flex items-center justify-center p-[15px]">
        <div class="absolute inset-0 bg-card/90 backdrop-blur-xl" @click="isGuideOpen = false"></div>

        <div class="relative w-full max-w-lg max-h-[85vh] overflow-y-auto custom-scrollbar rounded-[1.25rem] border border-yellow-400/20 bg-card shadow-[0_0_50px_rgba(0,0,0,0.5)] animate-in zoom-in-95 duration-300">
          <div class="p-[15px] space-y-[15px]">
            <div class="flex items-center justify-between">
              <h3 class="text-lg text-yellow-400">Guía paso a paso</h3>
              <button
                type="button"
                class="cursor-pointer rounded-lg bg-secondary p-2 text-muted-foreground transition-all hover:text-white"
                aria-label="Cerrar"
                @click="isGuideOpen = false"
              >
                <IconX class="h-5 w-5" />
              </button>
            </div>

            <p class="text-xs text-muted-foreground">Instala cocbase como app en tu dispositivo.</p>

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
              Ya tienes cocbase instalada.
            </p>

            <div v-for="section in guideSections" :key="section.title" class="space-y-2">
              <div class="flex items-center gap-2">
                <component :is="section.icon" class="h-5 w-5 text-yellow-400" />
                <h4 class="text-sm text-white">{{ section.title }}</h4>
              </div>
              <ol class="space-y-1">
                <li v-for="(step, index) in section.steps" :key="index" class="flex gap-2 text-xs text-muted-foreground">
                  <span class="text-yellow-400">{{ index + 1 }}.</span>
                  <span>{{ step }}</span>
                </li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>
