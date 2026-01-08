<script setup lang="ts">
import { ref } from 'vue'
import Sidebar from './Sidebar.vue'
import { Menu } from 'lucide-vue-next'
import logo from '@/assets/logo.png' // Ensure we have the logo here too for mobile header

const isMobileMenuOpen = ref(false)
</script>

<template>
  <div class="flex h-screen bg-background overflow-hidden relative">
    
    <!-- Desktop Sidebar (Hidden on mobile) -->
    <div class="hidden md:block shrink-0">
        <Sidebar :showLabels="false" />
    </div>

    <!-- Mobile Sidebar Backdrop -->
    <div v-if="isMobileMenuOpen" 
         class="fixed inset-0 z-40 bg-zinc-950/80 backdrop-blur-sm md:hidden animate-in fade-in duration-200"
         @click="isMobileMenuOpen = false">
    </div>

    <div class="fixed inset-y-0 left-0 z-50 w-64 bg-card shadow-2xl transform transition-transform duration-300 md:hidden"
         :class="isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'">
         <Sidebar :showLabels="true" :showLogo="false" className="w-full border-r-0" @link-click="isMobileMenuOpen = false" />
    </div>

    <!-- Main Content Area -->
    <div class="flex-1 flex flex-col min-w-0 w-full relative">
      
      <!-- Mobile Header -->
      <header class="md:hidden h-16 border-b flex items-center justify-between px-4 bg-card/80 backdrop-blur sticky top-0 z-30">
          <button @click="isMobileMenuOpen = true" class="p-2 -ml-2 text-zinc-400 hover:text-white">
              <Menu class="w-6 h-6" />
          </button>
          
          <div class="flex items-center gap-2">
            <img :src="logo" class="w-10 h-10 object-contain" />
            <span class="font-black text-lg tracking-tighter uppercase">CocBase</span>
          </div>

          <div class="w-8"></div> <!-- Spacer for centering -->
      </header>

      <!-- Scrollable Content -->
      <main class="flex-1 overflow-y-auto overflow-x-hidden p-6 custom-scrollbar relative w-full">
        <div class="max-w-7xl mx-auto space-y-6 pb-20 sm:pb-0">
          <slot />
        </div>
      </main>
    </div>
  </div>
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: hsl(var(--muted-foreground) / 0.2);
  border-radius: 10px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: hsl(var(--muted-foreground) / 0.4);
}
</style>
