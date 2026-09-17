<script setup lang="ts">
import { ref } from "vue";
import Sidebar from "./Sidebar.vue";
import { Menu } from "lucide-vue-next";
import logo from "@/assets/logo.png";

const isMobileMenuOpen = ref(false);
</script>

<template>
  <div class="flex min-h-dvh md:h-dvh bg-background md:overflow-hidden relative">
    <div class="hidden md:block shrink-0 h-full">
      <Sidebar :showLabels="false" />
    </div>

    <div
      v-if="isMobileMenuOpen"
      class="fixed inset-0 z-40 bg-zinc-950/80 backdrop-blur-sm md:hidden animate-in fade-in duration-200"
      @click="isMobileMenuOpen = false"
    ></div>

    <div
      class="fixed inset-y-0 left-0 z-50 w-64 bg-card shadow-2xl transform transition-transform duration-300 md:hidden"
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
      <header class="md:hidden h-16 border-b flex items-center justify-between px-4 bg-card sticky top-0 z-30">
        <button
          @click="isMobileMenuOpen = true"
          class="-ml-2 cursor-pointer p-2 text-zinc-400 hover:text-white"
        >
          <Menu class="w-6 h-6" />
        </button>

        <div class="flex items-center gap-2">
          <img :src="logo" class="w-10 h-10 object-contain" />
          <span class="font-black text-lg tracking-tighter">cocbase-admin</span>
        </div>

        <div class="w-8"></div>
      </header>

      <main class="flex-1 md:overflow-y-auto overflow-x-hidden p-4 relative w-full">
        <div class="max-w-7xl mx-auto">
          <slot />
        </div>
      </main>
    </div>
  </div>
</template>

