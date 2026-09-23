<script setup lang="ts">
import IconLock from "~icons/ph/lock"
import IconSync from "~icons/ph/arrows-clockwise"
import IconLogOut from "~icons/ph/sign-out"
import logo from "@/assets/logo.png"
import { cn } from "@/lib/utils"
import { session, isAdmin, profile } from "@/lib/auth"
import { useNavigation, type NavItem } from "@/lib/navigation"

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

const { navItems, isLocked, handleNavClick, handleSignOut, isSigningOut } = useNavigation()

function onNavClick(e: MouseEvent, item: NavItem, navigate?: () => void) {
  handleNavClick(e, item, navigate)
  emit('link-click')
}
</script>

<template>
  <aside
    :class="
      cn(
        'border-r border-border bg-[#121212] flex flex-col h-full transition-all duration-300',
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
          aria-label="cocbase"
        >
          <div class="flex items-center justify-center shrink-0 w-10 h-10 transition-all">
            <img :src="logo" alt="logo" class="w-full h-full object-contain" />
          </div>
        </router-link>
      </div>
      <div class="border-b border-border mx-2"></div>
    </div>

    <nav class="flex-1 p-[15px] space-y-2 overflow-y-auto custom-scrollbar">
      <router-link v-for="item in navItems" :key="item.name" :to="item.path" custom v-slot="{ navigate, href, isActive, isExactActive }">
        <a
          :href="href"
          @click="(e) => onNavClick(e, item, navigate)"
          :class="cn(
            'flex cursor-pointer items-center rounded-lg hover:bg-card group relative py-3 transition-all',
            showLabels ? 'justify-start px-[15px]' : 'justify-center',
            (item.path === '/' ? isExactActive : isActive) && 'bg-card text-yellow-400 shadow-lg shadow-yellow-400/10 border border-yellow-400/20 hover:bg-card'
          )"
        >
          <component :is="isLocked(item) ? IconLock : item.icon" :class="cn(
            'w-5 h-5 shrink-0 transition-colors',
            (item.path === '/' ? isExactActive : isActive) ? 'text-yellow-400' : isLocked(item) ? 'text-muted-foreground/60' : 'text-muted-foreground group-hover:text-yellow-400'
          )" />
          <span v-if="showLabels" :class="cn(
            'ml-3 transition-colors text-sm',
            (item.path === '/' ? isExactActive : isActive) ? 'text-yellow-400' : isLocked(item) ? 'text-muted-foreground/60' : 'text-muted-foreground group-hover:text-yellow-400'
          )">
            {{ item.name }}
          </span>
        </a>
      </router-link>
    </nav>

    <div class="border-b border-border mx-2"></div>
    <div class="p-[15px]">
      <template v-if="session">
        <div v-if="showLabels" class="mb-2 px-[15px]">
          <p class="text-xs text-muted-foreground truncate">{{ profile?.full_name || 'Usuario' }}</p>
          <p v-if="isAdmin" class="text-[10px] text-yellow-400">Administrador</p>
        </div>
        <button
          type="button"
          class="flex w-full cursor-pointer items-center rounded-lg py-3 text-red-500 transition-colors hover:bg-red-500/10 hover:text-red-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 disabled:cursor-not-allowed disabled:opacity-50"
          :class="showLabels ? 'justify-start px-[15px]' : 'justify-center'"
          :disabled="isSigningOut"
          title="Cerrar sesión"
          @click="handleSignOut"
        >
          <IconSync v-if="isSigningOut" class="h-5 w-5 shrink-0 animate-spin" />
          <IconLogOut v-else class="h-5 w-5 shrink-0" />
          <span v-if="showLabels" class="ml-3 text-sm">
            {{ isSigningOut ? 'Cerrando sesión...' : 'Cerrar sesión' }}
          </span>
        </button>
      </template>
      <template v-else>
        <router-link
          to="/login"
          class="flex w-full cursor-pointer items-center rounded-lg py-3 text-yellow-400 transition-colors hover:bg-yellow-400/10"
          :class="showLabels ? 'justify-start px-[15px]' : 'justify-center'"
          title="Iniciar sesión"
        >
          <IconLogOut class="h-5 w-5 shrink-0 rotate-180" />
          <span v-if="showLabels" class="ml-3 text-sm">Iniciar sesión</span>
        </router-link>
      </template>
    </div>
  </aside>
</template>
