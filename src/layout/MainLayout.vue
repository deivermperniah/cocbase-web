<script setup lang="ts">
import { ref } from "vue";
import Sidebar from "./Sidebar.vue";
import TopBar from "./TopBar.vue";
import AppFooter from "@/components/AppFooter.vue";
import AccountDropdown from "@/components/AccountDropdown.vue";
import logo from "@/assets/logo.png";
import IconMenu from "~icons/ph/list";
import IconDownload from "~icons/ph/download-simple";
import IconSignIn from "~icons/ph/sign-in";
import { session } from "@/lib/auth";

const isMobileMenuOpen = ref(false);
</script>

<template>
  <div class="flex flex-col min-h-dvh lg:h-dvh lg:overflow-hidden relative">
    <TopBar />

    <div
      v-if="isMobileMenuOpen"
      class="fixed inset-0 z-40 bg-card/80 backdrop-blur-sm lg:hidden animate-in fade-in duration-200"
      @click="isMobileMenuOpen = false"
    ></div>

    <div
      class="fixed inset-y-0 left-0 z-50 w-64 bg-card shadow-2xl transform transition-transform duration-300 lg:hidden"
      :class="isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'"
    >
      <Sidebar
        :showLabels="true"
        :showLogo="true"
        className="w-full border-r-0"
        @link-click="isMobileMenuOpen = false"
      />
    </div>

    <div class="flex-1 flex flex-col min-w-0 w-full relative min-h-0">
      <header class="lg:hidden h-16 border-b border-border flex items-center justify-between px-page bg-background sticky top-0 z-30">
        <button
          @click="isMobileMenuOpen = true"
          class="-ml-2 cursor-pointer p-2 text-white hover:text-yellow-400"
        >
          <IconMenu class="w-6 h-6" />
        </button>

        <router-link to="/" aria-label="cocbase" class="flex items-center gap-2">
          <img :src="logo" alt="logo" class="h-9 w-9 object-contain" />
          <span class="text-lg text-white">cocbase</span>
        </router-link>

        <div class="ml-auto flex items-center gap-2">
          <router-link
            to="/descargar"
            class="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full border border-yellow-400/40 text-yellow-400 transition-all hover:bg-yellow-400/10 active:scale-95"
            aria-label="Descargar app"
          >
            <IconDownload class="h-4 w-4" />
          </router-link>
          <AccountDropdown v-if="session" />
          <router-link
            v-else
            to="/login"
            class="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-yellow-400 text-black transition-all hover:bg-yellow-300 active:scale-95"
            aria-label="Iniciar sesión"
          >
            <IconSignIn class="h-5 w-5" />
          </router-link>
        </div>
      </header>

      <main class="flex-1 flex flex-col min-h-0 lg:overflow-y-auto overflow-x-hidden relative w-full">
        <div class="flex-1 w-full max-w-7xl mx-auto p-page lg:pt-24">
          <slot />
        </div>
        <AppFooter />
      </main>
    </div>
  </div>
</template>
