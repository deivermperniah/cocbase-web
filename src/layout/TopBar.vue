<script setup lang="ts">
import { computed, ref } from "vue";
import { onClickOutside } from "@vueuse/core";
import IconDownload from "~icons/ph/download-simple";
import IconSync from "~icons/ph/arrows-clockwise";
import IconLogOut from "~icons/ph/sign-out";
import IconUserCircle from "~icons/ph/user-circle";
import logo from "@/assets/logo.png";
import { cn } from "@/lib/utils";
import { session, profile, user } from "@/lib/auth";
import { useNavigation, type NavItem } from "@/lib/navigation";

const { navItems, isLocked, handleNavClick, handleSignOut, isSigningOut } = useNavigation();

const centerItems = computed<NavItem[]>(() =>
  navItems.value.filter((item) => item.path !== "/descargar")
);

const isAccountOpen = ref(false);
const accountRef = ref<HTMLElement | null>(null);
onClickOutside(accountRef, () => (isAccountOpen.value = false));
</script>

<template>
  <header class="fixed top-3 left-1/2 z-40 hidden h-14 w-[min(92vw,54rem)] -translate-x-1/2 items-center gap-5 rounded-full border border-border bg-[#121212]/95 px-5 shadow-xl shadow-black/40 backdrop-blur lg:flex">
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
            'cursor-pointer rounded-full px-3 py-2 text-sm transition-colors',
            (item.path === '/' ? isExactActive : isActive) ? 'text-yellow-400' : isLocked(item) ? 'text-muted-foreground/60' : 'text-muted-foreground hover:text-yellow-400'
          )"
        >
          {{ item.name }}
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

      <template v-if="session">
        <div ref="accountRef" class="relative">
          <button
            type="button"
            class="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-border bg-card text-muted-foreground transition-colors hover:border-yellow-400/40 hover:text-yellow-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400"
            :aria-expanded="isAccountOpen"
            aria-label="Cuenta"
            @click="isAccountOpen = !isAccountOpen"
          >
            <IconUserCircle class="h-5 w-5" />
          </button>

          <div
            v-if="isAccountOpen"
            class="absolute right-0 top-14 z-50 w-64 rounded-xl border border-border bg-[#121212] p-4 shadow-2xl shadow-black/50"
          >
            <div class="space-y-3">
              <div>
                <p class="text-[10px] uppercase tracking-wide text-muted-foreground">Nombre</p>
                <p class="truncate text-sm text-white">{{ profile?.full_name || 'Usuario' }}</p>
              </div>
              <div>
                <p class="text-[10px] uppercase tracking-wide text-muted-foreground">Correo Electrónico</p>
                <p class="truncate text-sm text-white">{{ user?.email }}</p>
              </div>
            </div>

            <div class="my-3 border-t border-border"></div>

            <button
              type="button"
              class="flex w-full cursor-pointer items-center gap-2 rounded-lg px-2 py-2 text-xs text-red-500 transition-colors hover:bg-red-500/10 hover:text-red-400 disabled:cursor-not-allowed disabled:opacity-50"
              :disabled="isSigningOut"
              @click="handleSignOut"
            >
              <IconSync v-if="isSigningOut" class="h-4 w-4 shrink-0 animate-spin" />
              <IconLogOut v-else class="h-4 w-4 shrink-0" />
              <span>{{ isSigningOut ? 'Cerrando...' : 'Cerrar sesión' }}</span>
            </button>
          </div>
        </div>
      </template>
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
