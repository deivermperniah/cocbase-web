<script setup lang="ts">
import { LayoutDashboard, Layers, Image } from "lucide-vue-next";
import logo from "@/assets/logo.png";
import { cn } from "@/lib/utils";

const props = withDefaults(defineProps<{
  showLabels?: boolean;
  className?: string;
  showLogo?: boolean;
}>(), {
  showLogo: true
});

const emit = defineEmits<{
  (e: 'link-click'): void
}>()

const navItems = [
  { name: "Dashboard", icon: LayoutDashboard, path: "/" },
  { name: "Bases", icon: Layers, path: "/bases" },
  { name: "Imagenes", icon: Image, path: "/imagenes" },
];

function handleNavClick(e: MouseEvent, navigate: () => void) {
    e.preventDefault()
    navigate()
    emit('link-click')
}
</script>

<template>
  <aside
    :class="
      cn(
        'bg-card border-r flex flex-col h-full transition-all duration-300',
        showLabels ? 'w-64' : 'w-20',
        className
      )
    "
  >
    <!-- Logo / Header -->
    <div v-if="showLogo" class="h-16 flex flex-col shrink-0">
      <div class="flex-1 flex items-center justify-center">
        <div class="flex items-center shrink-0">
          <div class="flex items-center justify-center shrink-0 w-10 h-10 transition-all">
            <img :src="logo" alt="Logo" class="w-full h-full object-contain" />
          </div>
          <span
            v-if="showLabels"
            class="ml-3 font-black text-lg tracking-tighter uppercase"
            >CocBase</span
          >
        </div>  
      </div>
      <div class="border-b mx-2"></div>
    </div>

    <!-- Navigation -->
    <nav class="flex-1 p-4 space-y-2 overflow-y-auto custom-scrollbar">
      <router-link v-for="item in navItems" :key="item.name" :to="item.path" custom v-slot="{ navigate, href, isActive, isExactActive }">
        <a :href="href" @click="(e) => handleNavClick(e, navigate)" 
           :class="cn(
               'flex items-center rounded-lg hover:bg-muted group relative py-3 transition-all',
               showLabels ? 'justify-start px-4' : 'justify-center',
               (item.path === '/' ? isExactActive : isActive) && 'bg-zinc-950 text-yellow-500 shadow-lg shadow-yellow-500/10 border border-yellow-500/20 hover:bg-zinc-950'
           )">
          <component :is="item.icon" :class="cn(
              'w-5 h-5 shrink-0 transition-colors',
              (item.path === '/' ? isExactActive : isActive) ? 'text-yellow-500' : 'text-muted-foreground group-hover:text-primary'
          )" />
          <span v-if="showLabels" :class="cn(
              'ml-3 font-medium transition-colors text-sm uppercase tracking-wider',
              (item.path === '/' ? isExactActive : isActive) ? 'text-yellow-500' : 'text-muted-foreground group-hover:text-primary'
          )">
            {{ item.name }}
          </span>
        </a>
      </router-link>
    </nav>
  </aside>
</template>

<style scoped>
/* No styles needed, using utility classes to avoid @apply linter issues */
</style>
