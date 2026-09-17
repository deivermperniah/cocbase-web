<script setup lang="ts">
import { LayoutDashboard, Layers, Image, LogOut } from "lucide-vue-next";
import { useRouter } from "vue-router";
import logo from "@/assets/logo.png";
import { cn } from "@/lib/utils";
import { signOut } from "@/lib/auth";

const router = useRouter();

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

async function handleSignOut() {
  await signOut()
  await router.replace({ name: 'login' })
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
    <div v-if="showLogo" class="h-16 flex flex-col shrink-0">
      <div class="flex-1 flex items-center justify-center">
        <router-link
          to="/"
          class="flex items-center shrink-0"
          aria-label="Ir a CocBase Admin"
        >
          <div class="flex items-center justify-center shrink-0 w-10 h-10 transition-all">
            <img :src="logo" alt="Logo" class="w-full h-full object-contain" />
          </div>
          <span v-if="showLabels" class="ml-3 font-black text-lg tracking-tighter uppercase">
            CocBase
          </span>
        </router-link>
      </div>
      <div class="border-b mx-2"></div>
    </div>

    <nav class="flex-1 p-4 space-y-2 overflow-y-auto custom-scrollbar">
      <router-link v-for="item in navItems" :key="item.name" :to="item.path" custom v-slot="{ navigate, href, isActive, isExactActive }">
        <a :href="href" @click="(e) => handleNavClick(e, navigate)" 
           :class="cn(
               'flex cursor-pointer items-center rounded-lg hover:bg-muted group relative py-3 transition-all',
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

    <div class="border-t p-4">
      <button
        type="button"
        class="flex w-full cursor-pointer items-center rounded-lg py-3 text-red-500 transition-colors hover:bg-red-500/10 hover:text-red-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
        :class="showLabels ? 'justify-start px-4' : 'justify-center'"
        title="Cerrar sesión"
        @click="handleSignOut"
      >
        <LogOut class="h-5 w-5 shrink-0" />
        <span v-if="showLabels" class="ml-3 text-sm font-medium uppercase tracking-wider">
          Cerrar sesión
        </span>
      </button>
    </div>
  </aside>
</template>

<style scoped></style>
