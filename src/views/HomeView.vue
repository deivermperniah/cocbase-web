<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { BASE_LEVELS } from "@/lib/constants";
import { session, isAdmin } from "@/lib/auth";
import IconShield from "~icons/ph/shield-check";
import IconFunnel from "~icons/ph/funnel";
import IconHeart from "~icons/ph/heart";
import IconUpload from "~icons/ph/upload-simple";
import IconLayers from "~icons/ph/stack";
import IconInstagram from "~icons/ph/instagram-logo";
import IconYoutube from "~icons/ph/youtube-logo";
import IconX from "~icons/ph/x-logo";
import IconReddit from "~icons/ph/reddit-logo";
import IconPlayCircle from "~icons/ph/play-circle";
import IconVideo from "~icons/ph/video-camera";

const townhallModules = import.meta.glob("../assets/images/townhalls/th*.webp", {
  eager: true,
}) as Record<string, { default: string }>;

const townhallImages: Record<number, string> = {};
for (const [path, mod] of Object.entries(townhallModules)) {
  const match = path.match(/th(\d+)\.webp$/);
  if (match) townhallImages[Number(match[1])] = mod.default;
}

const townhalls = BASE_LEVELS.map((level) => ({ level, img: townhallImages[level] }));
const townhallsLoop = [...townhalls, ...townhalls];

const advantages = [
  {
    icon: IconShield,
    title: "Bases verificadas",
    text: "Cada diseño pasa una revisión antes de publicarse, sin duplicados",
  },
  {
    icon: IconFunnel,
    title: "Organizadas por nivel",
    text: "Filtra por ayuntamiento y categoría para encontrar lo que buscas",
  },
  {
    icon: IconHeart,
    title: "Guarda tus favoritas",
    text: "Crea tu cuenta y guarda las bases que quieras usar después",
  },
  {
    icon: IconUpload,
    title: "Comparte las tuyas",
    text: "Contribuye con tus propios diseños y ayuda a la comunidad",
  },
];

const socials = [
  { name: "Instagram", icon: IconInstagram, href: "https://instagram.com" },
  { name: "YouTube", icon: IconYoutube, href: "https://youtube.com" },
  { name: "X", icon: IconX, href: "https://x.com" },
  { name: "Reddit", icon: IconReddit, href: "https://reddit.com" },
];

const videoModules = import.meta.glob("../assets/videos/*.{mp4,webm}", {
  eager: true,
  query: "?url",
  import: "default",
}) as Record<string, string>;

const videos = Object.entries(videoModules)
  .sort(([a], [b]) => a.localeCompare(b, undefined, { numeric: true }))
  .map(([, url]) => url);

const currentIndex = ref(0);
const currentVideo = computed(() => videos[currentIndex.value] ?? null);
const isVideoLoaded = ref(false);

watch(currentVideo, () => {
  isVideoLoaded.value = false;
});
</script>

<template>
  <div class="space-y-16 pb-6">
    <!-- Hero -->
    <section class="relative pt-10 sm:pt-16 pb-6">
      <div class="pointer-events-none absolute left-1/2 top-14 -z-10 h-56 w-[36rem] max-w-full -translate-x-1/2 rounded-full bg-yellow-400/10 blur-3xl" />

      <div class="grid grid-cols-1 lg:grid-cols-2 items-center gap-10 lg:gap-14">
        <div class="text-center lg:text-left">
          <h1 class="text-4xl sm:text-5xl lg:text-6xl leading-none text-white">
            Tus bases de Clash of Clans
          </h1>
          <p class="mt-4 max-w-xl mx-auto lg:mx-0 font-body text-sm sm:text-base text-muted-foreground leading-relaxed">
            Encuentra, guarda y comparte diseños de base organizados por nivel de ayuntamiento. Todo revisado por la comunidad.
          </p>

          <div class="mt-8 flex flex-row items-center justify-center lg:justify-start gap-3">
            <router-link
              to="/bases"
              class="flex cursor-pointer items-center justify-center gap-2 px-6 h-12 rounded-full bg-yellow-400 text-black text-sm hover:bg-yellow-300 transition-all active:scale-95 shadow-xl shadow-yellow-400/20"
            >
              <IconLayers class="h-4 w-4" />
              Ver bases
            </router-link>
            <router-link
              :to="isAdmin ? '/panel' : session ? '/contribuir' : '/login'"
              class="flex cursor-pointer items-center justify-center gap-2 px-6 h-12 rounded-full border-2 border-yellow-400 text-yellow-400 text-sm hover:bg-yellow-400/10 transition-all active:scale-95"
            >
              {{ isAdmin ? 'Panel' : 'Contribuir' }}
            </router-link>
          </div>
        </div>

        <!-- Videos -->
        <div class="relative">
          <div class="pointer-events-none absolute -inset-3 -z-10 rounded-3xl bg-gradient-to-br from-yellow-400/25 via-yellow-400/5 to-transparent blur-2xl" />
          <div class="overflow-hidden rounded-2xl border border-yellow-400/30 bg-chrome shadow-2xl shadow-yellow-400/10">
            <div class="relative aspect-video w-full bg-black">
              <div
                v-if="currentVideo && !isVideoLoaded"
                class="absolute inset-0 flex items-center justify-center"
              >
                <div class="absolute inset-0 animate-pulse bg-secondary"></div>
                <div class="relative flex h-14 w-14 items-center justify-center rounded-full bg-yellow-400/10 animate-pulse">
                  <IconVideo class="h-7 w-7 text-yellow-400" />
                </div>
              </div>
              <video
                v-if="currentVideo"
                :src="currentVideo"
                class="h-full w-full object-cover transition-opacity duration-500"
                :class="isVideoLoaded ? 'opacity-100' : 'opacity-0'"
                autoplay
                muted
                loop
                playsinline
                @canplay="isVideoLoaded = true"
              />
              <div v-else class="flex h-full w-full flex-col items-center justify-center gap-3">
                <div class="flex h-14 w-14 items-center justify-center rounded-full bg-yellow-400/10">
                  <IconPlayCircle class="h-7 w-7 text-yellow-400" />
                </div>
                <p class="font-body text-xs text-muted-foreground">Próximamente</p>
              </div>
            </div>
          </div>

          <div v-if="videos.length > 1" class="mt-3 flex items-center justify-center gap-2">
            <button
              v-for="(video, index) in videos"
              :key="video"
              type="button"
              class="h-2 cursor-pointer rounded-full transition-all"
              :class="index === currentIndex ? 'w-6 bg-yellow-400' : 'w-2 bg-border hover:bg-muted-foreground'"
              :aria-label="`Video ${index + 1}`"
              @click="currentIndex = index"
            />
          </div>
        </div>
      </div>
    </section>

    <!-- Ayuntamientos scroller -->
    <section>
      <div class="flex items-end justify-between mb-6">
        <h2 class="text-2xl sm:text-3xl text-white">Explora por ayuntamiento</h2>
        <router-link to="/bases" class="text-xs text-yellow-400 hover:text-yellow-300 transition-colors">
          Ver todas
        </router-link>
      </div>

      <div class="group relative overflow-hidden">
        <div class="flex w-max animate-marquee group-hover:[animation-play-state:paused]">
          <router-link
            v-for="(th, index) in townhallsLoop"
            :key="index"
            :to="`/bases?level=${th.level}`"
            class="group/card mr-3 block h-56 w-56 shrink-0 overflow-hidden rounded-xl border border-border bg-card transition-all duration-300 ease-out hover:border-yellow-400/60 hover:shadow-xl hover:shadow-yellow-400/10"
          >
            <img
              :src="th.img"
              :alt="`Ayuntamiento nivel ${th.level}`"
              width="480"
              height="480"
              decoding="async"
              class="h-full w-full object-cover transition-transform duration-500 ease-out group-hover/card:scale-105"
              loading="lazy"
            />
          </router-link>
        </div>
      </div>
    </section>

    <!-- Ventajas -->
    <section>
      <h2 class="text-2xl sm:text-3xl text-white mb-8">Por qué usar cocbase</h2>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-8">
        <div v-for="adv in advantages" :key="adv.title" class="flex items-start gap-4">
          <div class="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-yellow-400/10">
            <component :is="adv.icon" class="h-5 w-5 text-yellow-400" />
          </div>
          <div>
            <h3 class="text-base text-white">{{ adv.title }}</h3>
            <p class="mt-1 font-body text-sm text-muted-foreground leading-relaxed">{{ adv.text }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Síguenos -->
    <section class="text-center">
      <h2 class="text-2xl sm:text-3xl text-white mb-4">Síguenos</h2>
      <p class="font-body text-sm text-muted-foreground mb-6">Nuevas bases y novedades en nuestras redes</p>
      <div class="flex items-center justify-center gap-3">
        <a
          v-for="social in socials"
          :key="social.name"
          :href="social.href"
          target="_blank"
          rel="noopener noreferrer"
          :aria-label="social.name"
          class="flex h-12 w-12 cursor-pointer items-center justify-center rounded-full bg-card border border-border text-muted-foreground hover:bg-yellow-400 hover:text-black hover:border-yellow-400 transition-all"
        >
          <component :is="social.icon" class="h-5 w-5" />
        </a>
      </div>
    </section>
  </div>
</template>
