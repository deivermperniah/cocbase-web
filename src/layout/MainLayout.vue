<script setup lang="ts">
import { ref } from "vue";
import Sidebar from "./Sidebar.vue";
import IconMenu from "~icons/ph/list";
import logo from "@/assets/logo.png";

const isMobileMenuOpen = ref(false);
</script>

<template>
  <div class="flex min-h-dvh lg:h-dvh lg:overflow-hidden relative">
    <div class="hidden lg:block shrink-0 h-full">
      <Sidebar :showLabels="false" />
    </div>

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

    <div class="flex-1 flex flex-col min-w-0 w-full relative">
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
      </header>

      <main class="flex-1 lg:overflow-y-auto overflow-x-hidden p-[15px] relative w-full">
        <div class="max-w-7xl mx-auto">
          <slot />
        </div>
      </main>
    </div>
  </div>
</template>

