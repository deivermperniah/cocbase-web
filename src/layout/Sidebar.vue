<script setup lang="ts">
import { cn } from "@/lib/utils";
import { useNavigation, type NavItem } from "@/lib/navigation";

defineProps<{
  className?: string;
}>();

const emit = defineEmits<{
  (e: "link-click"): void;
}>();

const { navItems, handleNavClick, prefetchRoute } = useNavigation();

function onNavClick(e: MouseEvent, item: NavItem, navigate?: () => void) {
  handleNavClick(e, item, navigate);
  emit("link-click");
}
</script>

<template>
  <aside :class="cn('border-r border-border bg-chrome flex flex-col h-full w-64', className)">
    <nav aria-label="Principal" class="flex-1 p-page space-y-2 overflow-y-auto custom-scrollbar">
      <router-link
        v-for="item in navItems.filter((i) => i.path !== '/descargar')"
        :key="item.name"
        v-slot="{ navigate, href, isActive, isExactActive }"
        :to="item.path"
        custom
      >
        <a
          :href="href"
          :aria-current="(item.path === '/' ? isExactActive : isActive) ? 'page' : undefined"
          :class="
            cn(
              'flex cursor-pointer items-center justify-start rounded-lg border border-transparent hover:bg-card group relative py-3 px-page transition-all',
              (item.path === '/' ? isExactActive : isActive) &&
                'bg-card text-yellow-400 shadow-lg shadow-yellow-400/10 border border-yellow-400/20 hover:bg-card',
            )
          "
          @click="(e) => onNavClick(e, item, navigate)"
          @mouseenter="prefetchRoute(item.path)"
          @focus="prefetchRoute(item.path)"
        >
          <component
            :is="item.icon"
            :class="
              cn(
                'w-5 h-5 shrink-0 transition-colors',
                (item.path === '/' ? isExactActive : isActive)
                  ? 'text-yellow-400'
                  : 'text-muted-foreground group-hover:text-yellow-400',
              )
            "
          />
          <span
            :class="
              cn(
                'ml-3 transition-colors text-sm',
                (item.path === '/' ? isExactActive : isActive)
                  ? 'text-yellow-400'
                  : 'text-muted-foreground group-hover:text-yellow-400',
              )
            "
          >
            {{ item.name }}
          </span>
          <span
            v-if="item.badge"
            :aria-label="`${item.badge} pendientes`"
            class="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1.5 text-[11px] text-white"
          >
            {{ item.badge > 99 ? "99+" : item.badge }}
          </span>
        </a>
      </router-link>
    </nav>
  </aside>
</template>
