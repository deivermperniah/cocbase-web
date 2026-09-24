<script setup lang="ts">
import IconLock from "~icons/ph/lock"
import { cn } from "@/lib/utils"
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

const { navItems, isLocked, handleNavClick } = useNavigation()

function onNavClick(e: MouseEvent, item: NavItem, navigate?: () => void) {
  handleNavClick(e, item, navigate)
  emit('link-click')
}
</script>

<template>
  <aside
    :class="
      cn(
        'border-r border-border bg-chrome flex flex-col h-full transition-all duration-300',
        showLabels ? 'w-64' : 'w-20',
        className
      )
    "
  >
    <nav class="flex-1 p-page space-y-2 overflow-y-auto custom-scrollbar">
      <router-link v-for="item in navItems.filter((i) => i.path !== '/descargar')" :key="item.name" :to="item.path" custom v-slot="{ navigate, href, isActive, isExactActive }">
        <a
          :href="href"
          @click="(e) => onNavClick(e, item, navigate)"
          :class="cn(
            'flex cursor-pointer items-center rounded-lg border border-transparent hover:bg-card group relative py-3 transition-all',
            showLabels ? 'justify-start px-page' : 'justify-center',
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
          <span
            v-if="item.badge"
            :class="cn(
              'flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1.5 text-[10px] text-white',
              showLabels ? 'ml-auto' : 'absolute right-2 top-1.5'
            )"
          >
            {{ item.badge > 99 ? '99+' : item.badge }}
          </span>
        </a>
      </router-link>
    </nav>
  </aside>
</template>
