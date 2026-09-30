<script setup lang="ts">
import IconEnvelope from "~icons/ph/envelope";
import { SOCIAL_LINKS } from "@/lib/constants";

const quickLinks = [
  { name: "Bases", path: "/bases" },
  { name: "Descargar app", path: "/descargar" },
  { name: "Contribuir", path: "/contribuir" },
];
</script>

<template>
  <footer class="mt-10 border-t border-border bg-chrome">
    <div class="max-w-7xl mx-auto px-page py-10 grid grid-cols-1 sm:grid-cols-2 lg:flex lg:justify-between gap-10">
      <div class="space-y-4 lg:w-max">
        <router-link to="/" class="flex items-center gap-2">
          <img src="@/assets/images/logo.webp" alt="" width="36" height="36" class="h-9 w-9 object-contain" />
          <span class="text-lg text-white">cocbase</span>
        </router-link>
        <p class="font-body text-xs text-muted-foreground leading-relaxed">
          La colección de bases de Clash of Clans para la comunidad.<br class="hidden lg:inline" />
          Encuentra, comparte y usa diseños.
        </p>
      </div>

      <div>
        <h2 class="text-sm text-white mb-4">Enlaces rápidos</h2>
        <ul class="space-y-2">
          <li v-for="link in quickLinks" :key="link.name">
            <router-link :to="link.path" class="text-xs text-muted-foreground hover:text-yellow-400 transition-colors">
              {{ link.name }}
            </router-link>
          </li>
        </ul>
      </div>

      <div>
        <h2 class="text-sm text-white mb-4">Síguenos</h2>
        <div class="flex gap-3">
          <a
            v-for="social in SOCIAL_LINKS"
            :key="social.name"
            :href="social.href"
            target="_blank"
            rel="noopener noreferrer"
            :aria-label="`${social.name} (se abre en una pestaña nueva)`"
            class="flex h-10 w-10 cursor-pointer items-center justify-center rounded-lg bg-secondary text-muted-foreground hover:bg-yellow-400 hover:text-black transition-all"
          >
            <component :is="social.icon" class="h-5 w-5" />
          </a>
        </div>
      </div>

      <div>
        <h2 class="text-sm text-white mb-4">Contacto</h2>
        <a
          href="mailto:deivermph@gmail.com"
          class="flex items-center gap-2 text-xs text-muted-foreground hover:text-yellow-400 transition-colors"
        >
          <IconEnvelope class="h-4 w-4" />
          deivermph@gmail.com
        </a>
      </div>
    </div>

    <div class="border-t border-border">
      <div class="max-w-7xl mx-auto px-page py-4 flex flex-col sm:flex-row items-center justify-between gap-3">
        <p class="text-xs text-muted-foreground">© 2026 cocbase. Todos los derechos reservados.</p>
        <nav aria-label="Legal" class="flex gap-4">
          <router-link to="/aviso-legal" class="text-xs text-muted-foreground hover:text-yellow-400 transition-colors"
            >Aviso legal</router-link
          >
          <router-link to="/privacidad" class="text-xs text-muted-foreground hover:text-yellow-400 transition-colors"
            >Privacidad</router-link
          >
        </nav>
      </div>
    </div>
  </footer>
</template>
