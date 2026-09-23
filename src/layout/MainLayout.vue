<script setup lang="ts">
import { ref } from "vue";
import Sidebar from "./Sidebar.vue";
import TopBar from "./TopBar.vue";
import AppFooter from "@/components/AppFooter.vue";
import IconMenu from "~icons/ph/list";
import IconSignIn from "~icons/ph/sign-in";
import logo from "@/assets/logo.png";
import { session, profile } from "@/lib/auth";

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
        :showLogo="false"
        className="w-full border-r-0"
        @link-click="isMobileMenuOpen = false"
      />
    </div>

    <div class="flex-1 flex flex-col min-w-0 w-full relative min-h-0">
      <header class="lg:hidden h-16 border-b border-border flex items-center justify-between px-[15px] bg-background sticky top-0 z-30">
        <button
          @click="isMobileMenuOpen = true"
          class="-ml-2 cursor-pointer p-2 text-white hover:text-yellow-400"
        >
          <IconMenu class="w-6 h-6" />
        </button>

        <router-link to="/" aria-label="cocbase" class="ml-auto">
          <img :src="logo" alt="logo" class="w-10 h-10 object-contain" />
        </router-link>

        <router-link
          v-if="!session"
          to="/login"
          class="ml-3 flex cursor-pointer items-center gap-2 px-[15px] h-9 rounded-full bg-yellow-400 text-black text-xs hover:bg-yellow-300 transition-all active:scale-95"
        >
          <IconSignIn class="h-4 w-4" />
          <span>Entrar</span>
        </router-link>
        <span v-else class="ml-3 text-xs text-yellow-400">{{ profile?.full_name?.split(' ')[0] }}</span>
      </header>

      <main class="flex-1 flex flex-col min-h-0 lg:overflow-y-auto overflow-x-hidden relative w-full">
        <div class="flex-1 w-full max-w-7xl mx-auto p-[15px] lg:pt-24">
          <slot />
        </div>
        <AppFooter />
      </main>
    </div>
  </div>
</template>
