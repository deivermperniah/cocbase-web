<script setup lang="ts">
import IconInstagram from "~icons/ph/instagram-logo"
import IconYoutube from "~icons/ph/youtube-logo"
import IconX from "~icons/ph/x-logo"
import IconReddit from "~icons/ph/reddit-logo"
import IconEnvelope from "~icons/ph/envelope"
import { useNavigation } from "@/lib/navigation"

const { navItems } = useNavigation()

const socials = [
  { name: "Instagram", icon: IconInstagram, href: "https://instagram.com" },
  { name: "YouTube", icon: IconYoutube, href: "https://youtube.com" },
  { name: "X", icon: IconX, href: "https://x.com" },
  { name: "Reddit", icon: IconReddit, href: "https://reddit.com" },
]
</script>

<template>
  <footer class="mt-10 border-t border-border bg-[#121212]">
    <div class="max-w-7xl mx-auto px-[15px] py-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
      <div class="space-y-4 lg:pr-16">
        <router-link to="/" class="flex items-center gap-2">
          <img src="@/assets/logo.png" alt="cocbase" class="h-8 w-8 object-contain" />
          <span class="text-lg text-white">cocbase</span>
        </router-link>
        <p class="font-body text-xs text-muted-foreground leading-relaxed">
          La colección de bases de Clash of Clans para la comunidad. Encuentra, comparte y usa diseños.
        </p>
      </div>

      <div>
        <h4 class="text-sm text-white mb-4">Enlaces rápidos</h4>
        <ul class="grid grid-cols-2 gap-x-4 gap-y-2">
          <li v-for="link in navItems" :key="link.name">
            <router-link :to="link.path" class="text-xs text-muted-foreground hover:text-yellow-400 transition-colors">
              {{ link.name }}
            </router-link>
          </li>
        </ul>
      </div>

      <div>
        <h4 class="text-sm text-white mb-4">Síguenos</h4>
        <div class="flex gap-3">
          <a
            v-for="social in socials"
            :key="social.name"
            :href="social.href"
            target="_blank"
            rel="noopener noreferrer"
            :aria-label="social.name"
            class="flex h-10 w-10 cursor-pointer items-center justify-center rounded-lg bg-secondary text-muted-foreground hover:bg-yellow-400 hover:text-black transition-all"
          >
            <component :is="social.icon" class="h-5 w-5" />
          </a>
        </div>
      </div>

      <div>
        <h4 class="text-sm text-white mb-4">Contacto</h4>
        <a href="mailto:deivermph@gmail.com" class="flex items-center gap-2 text-xs text-muted-foreground hover:text-yellow-400 transition-colors">
          <IconEnvelope class="h-4 w-4" />
          deivermph@gmail.com
        </a>
      </div>
    </div>

    <div class="border-t border-border">
      <div class="max-w-7xl mx-auto px-[15px] py-4 flex flex-col sm:flex-row items-center justify-between gap-3">
        <p class="text-xs text-muted-foreground">© 2026 cocbase. Todos los derechos reservados.</p>
        <div class="flex gap-4">
          <router-link to="/aviso-legal" class="text-xs text-muted-foreground hover:text-yellow-400 transition-colors">Aviso legal</router-link>
          <router-link to="/privacidad" class="text-xs text-muted-foreground hover:text-yellow-400 transition-colors">Privacidad</router-link>
        </div>
      </div>
    </div>
  </footer>
</template>
