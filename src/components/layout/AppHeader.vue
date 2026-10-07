<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import IconMenu from "~icons/ph/list";
import IconDownload from "~icons/ph/download-simple";
import IconSignIn from "~icons/ph/sign-in";
import AppButton from "@/components/ui/AppButton.vue";
import Logo from "@/components/ui/Logo.vue";
import AccountMenu from "@/components/layout/AccountMenu.vue";
import NavLinks from "@/components/layout/NavLinks.vue";
import { pendingCount, refreshPendingCount } from "@/lib/admin";
import { authReady, initializeAuth, isAdmin, session } from "@/lib/auth";
import { getNavItems } from "@/lib/navigation";

defineProps<{ currentPath: string }>();

const isMenuOpen = ref(false);
const navItems = computed(() => getNavItems(authReady.value, Boolean(session.value), isAdmin.value, pendingCount.value));

watch(isAdmin, (admin) => {
  if (admin) refreshPendingCount().catch((error) => console.error("Error fetching pending count:", error));
});

onMounted(() => initializeAuth().catch((error) => console.error("Error initializing auth:", error)));
</script>

<template>
  <header
    class="fixed left-1/2 top-3 z-40 hidden h-14 w-[min(92vw,54rem)] -translate-x-1/2 items-center gap-5 rounded-full border border-border bg-chrome/95 px-5 shadow-xl shadow-black/40 backdrop-blur lg:flex"
  >
    <Logo />
    <NavLinks :items="navItems" :current-path="currentPath" variant="pill" />
    <div class="flex shrink-0 items-center gap-2">
      <AppButton href="/descargar" variant="outline" size="sm" :icon="IconDownload">Descargar app</AppButton>
      <div v-if="!authReady" class="skeleton h-9 w-9 rounded-full"></div>
      <AccountMenu v-else-if="session" />
      <AppButton v-else href="/login" size="sm">Iniciar sesión</AppButton>
    </div>
  </header>

  <header
    class="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-background px-page lg:hidden"
  >
    <button type="button" class="-ml-2 cursor-pointer p-2 text-white hover:text-primary" @click="isMenuOpen = true">
      <IconMenu class="h-6 w-6" />
    </button>
    <Logo />
    <div class="ml-auto flex items-center gap-2">
      <a
        href="/descargar"
        class="flex h-9 w-9 items-center justify-center rounded-full border border-primary/40 text-primary hover:bg-primary/10"
      >
        <IconDownload class="h-4 w-4" />
      </a>
      <div v-if="!authReady" class="skeleton h-9 w-9 rounded-full"></div>
      <AccountMenu v-else-if="session" />
      <a v-else href="/login" class="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-black hover:bg-yellow-300">
        <IconSignIn class="h-5 w-5" />
      </a>
    </div>
  </header>

  <div v-if="isMenuOpen" class="fixed inset-0 z-40 bg-card/80 backdrop-blur-sm lg:hidden" @click="isMenuOpen = false"></div>
  <aside
    class="fixed inset-y-0 left-0 z-50 w-64 border-r border-border bg-chrome shadow-2xl transition-transform duration-300 lg:hidden"
    :class="isMenuOpen ? 'translate-x-0' : '-translate-x-full'"
  >
    <NavLinks :items="navItems" :current-path="currentPath" variant="drawer" />
  </aside>
</template>
