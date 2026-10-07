<script setup lang="ts">
import { ref } from "vue";
import IconLayers from "~icons/ph/stack";
import IconPlus from "~icons/ph/plus";
import IconClipboard from "~icons/ph/clipboard-text";
import IconImage from "~icons/ph/image";
import IconCaret from "~icons/ph/caret-right";
import AuthGate from "@/components/auth/AuthGate.vue";
import BaseForm from "@/components/bases/BaseForm.vue";
import AppButton from "@/components/ui/AppButton.vue";
import CountBadge from "@/components/ui/CountBadge.vue";
import EmptyState from "@/components/ui/EmptyState.vue";
import Modal from "@/components/ui/Modal.vue";
import PageHeader from "@/components/ui/PageHeader.vue";
import { fetchDashboardStats } from "@/lib/admin";
import { getBaseTypeIcon } from "@/lib/bases";
import { BASE_TYPES } from "@/lib/constants";

type Stats = Awaited<ReturnType<typeof fetchDashboardStats>>;

const managementLinks = [
  { name: "Comunidad", description: "Aprobar envíos de la comunidad", icon: IconClipboard, href: "/comunidad" },
  { name: "Imágenes", description: "Gestionar el almacenamiento", icon: IconImage, href: "/imagenes" },
];

const stats = ref<Stats | null>(null);
const loading = ref(true);
const isNewBaseOpen = ref(false);

async function load() {
  loading.value = true;
  try {
    stats.value = await fetchDashboardStats();
  } catch (error) {
    console.error("Error fetching stats:", error);
    stats.value = null;
  } finally {
    loading.value = false;
  }
}

function handleNewBase() {
  isNewBaseOpen.value = false;
  load();
}
</script>

<template>
  <div class="space-y-page">
    <PageHeader title="Panel">
      <template v-if="!loading || stats" #actions>
        <AppButton href="/bases" variant="outline" :icon="IconLayers" class="hidden sm:flex">Ver bases</AppButton>
        <AppButton :icon="IconPlus" @click="isNewBaseOpen = true">Nueva base</AppButton>
      </template>
    </PageHeader>

    <div v-if="loading && !stats" class="grid grid-cols-2 gap-page md:grid-cols-3">
      <div v-for="i in 5" :key="i" class="skeleton h-[200px] rounded-xl" :class="i === 1 && 'col-span-2'"></div>
    </div>

    <AuthGate access="admin" @ready="load">
      <EmptyState v-if="!loading && !stats" message="No se pudieron cargar las estadísticas">
        <AppButton @click="load">Reintentar</AppButton>
      </EmptyState>

      <div v-else-if="stats" class="grid grid-cols-2 gap-page md:grid-cols-3">
        <div
          class="col-span-2 flex h-[200px] flex-col items-center justify-center rounded-xl bg-gradient-to-br from-yellow-300 via-primary to-yellow-500 text-center shadow-2xl"
        >
          <p class="text-[28px] leading-none text-black">{{ stats.approved }}</p>
          <p class="text-xs text-black/60">Bases publicadas</p>
        </div>

        <div
          v-for="type in BASE_TYPES"
          :key="type"
          class="group flex h-[200px] flex-col justify-center gap-page rounded-xl bg-card p-4 shadow-xl"
        >
          <div class="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 transition-all group-hover:bg-primary">
            <component :is="getBaseTypeIcon(type)" class="h-5 w-5 text-primary group-hover:text-black" />
          </div>
          <div>
            <h2 class="text-base text-white">{{ type }}</h2>
            <p class="mt-1 text-[28px] text-primary">{{ stats.byType[type] }}</p>
          </div>
        </div>
      </div>

      <Modal :open="isNewBaseOpen" title="Nueva base" size="xl" @close="isNewBaseOpen = false">
        <BaseForm @success="handleNewBase" />
      </Modal>
    </AuthGate>

    <div class="space-y-3">
      <h2 class="text-base text-white">Gestión</h2>
      <div class="grid grid-cols-1 gap-page md:grid-cols-3">
        <a
          v-for="link in managementLinks"
          :key="link.name"
          :href="link.href"
          class="group flex items-center gap-3 rounded-xl border border-border bg-card p-4 transition-all hover:border-primary/40"
        >
          <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <component :is="link.icon" class="h-5 w-5" />
          </div>
          <div class="min-w-0 flex-1">
            <p class="text-sm text-white">{{ link.name }}</p>
            <p class="truncate text-xs text-muted-foreground">{{ link.description }}</p>
          </div>
          <CountBadge v-if="link.href === '/comunidad'" :count="stats?.pending" />
          <IconCaret class="h-4 w-4 shrink-0 text-muted-foreground group-hover:text-primary" />
        </a>
      </div>
    </div>
  </div>
</template>
