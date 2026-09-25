<script setup lang="ts">
import { computed } from "vue";
import IconDownload from "~icons/ph/download-simple";
import AccountDropdown from "@/components/AccountDropdown.vue";
import logo from "@/assets/logo.png";
import { cn } from "@/lib/utils";
import { session } from "@/lib/auth";
import { useNavigation, type NavItem } from "@/lib/navigation";

const { navItems, handleNavClick } = useNavigation();

const centerItems = computed<NavItem[]>(() =>
  navItems.value.filter((item) => item.path !== "/descargar")
);
</script>

<template>
  <header class="fixed top-3 left-1/2 z-40 hidden h-14 w-[min(92vw,54rem)] -translate-x-1/2 items-center gap-5 rounded-full border border-border bg-chrome/95 px-5 shadow-xl shadow-black/40 backdrop-blur lg:flex">
    <router-link to="/" aria-label="cocbase" class="flex shrink-0 items-center gap-2">
      <img :src="logo" alt="logo" class="h-9 w-9 object-contain" />
      <span class="text-lg text-white">cocbase</span>
    </router-link>

    <nav class="flex flex-1 items-center justify-center gap-1">
      <router-link
        v-for="item in centerItems"
        :key="item.name"
        :to="item.path"
        custom
        v-slot="{ navigate, href, isActive, isExactActive }"
      >
        <a
          :href="href"
          @click="(e) => handleNavClick(e, item, navigate)"
          :class="cn(
            'relative flex cursor-pointer items-center gap-1.5 rounded-full px-3 py-2 text-sm transition-colors',
            (item.path === '/' ? isExactActive : isActive) ? 'text-yellow-400' : 'text-muted-foreground hover:text-yellow-400'
          )"
        >
          {{ item.name }}
          <span
            v-if="item.badge"
            class="flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1.5 text-[10px] text-white"
          >
            {{ item.badge > 99 ? '99+' : item.badge }}
          </span>
        </a>
      </router-link>
    </nav>

    <div class="flex shrink-0 items-center gap-2">
      <router-link
        to="/descargar"
        class="flex h-9 cursor-pointer items-center gap-2 rounded-full border border-yellow-400/40 px-4 text-xs text-yellow-400 transition-all hover:bg-yellow-400/10 active:scale-95"
      >
        <IconDownload class="h-4 w-4" />
        <span>Descargar app</span>
      </router-link>

      <AccountDropdown v-if="session" />
      <router-link
        v-else
        to="/login"
        class="flex h-9 cursor-pointer items-center rounded-full bg-yellow-400 px-4 text-xs text-black transition-all hover:bg-yellow-300 active:scale-95"
      >
        <span>Iniciar sesión</span>
      </router-link>
    </div>
  </header>
</template>
