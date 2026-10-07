<script setup lang="ts">
import CountBadge from "@/components/ui/CountBadge.vue";
import { isActive, type NavItem } from "@/lib/navigation";

defineProps<{ items: NavItem[]; currentPath: string; variant: "pill" | "drawer" }>();
</script>

<template>
  <nav :class="variant === 'pill' ? 'flex flex-1 items-center justify-center gap-1' : 'space-y-2 p-page'">
    <a
      v-for="item in items"
      :key="item.name"
      :href="item.href"
      class="flex items-center text-sm transition-colors"
      :class="[
        variant === 'pill' ? 'gap-1.5 rounded-full px-3 py-2' : 'gap-3 rounded-lg border px-page py-3 hover:bg-card',
        isActive(item.path, currentPath)
          ? ['text-primary', variant === 'drawer' && 'border-primary/20 bg-card']
          : 'border-transparent text-muted-foreground hover:text-primary',
      ]"
    >
      <component :is="item.icon" v-if="variant === 'drawer'" class="h-5 w-5 shrink-0" />
      {{ item.name }}
      <CountBadge :count="item.badge" :class="variant === 'drawer' && 'ml-auto'" />
    </a>
  </nav>
</template>
