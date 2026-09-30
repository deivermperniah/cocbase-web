<script setup lang="ts">
import { ref, onMounted } from "vue";
import { BASE_TYPES, type BaseType } from "@/lib/constants";
import { fetchDashboardStats } from "@/lib/admin";
import { getBaseTypeIcon } from "@/lib/base";
import { Card, CardContent } from "@/components/ui/card";
import IconLayers from "~icons/ph/stack";
import IconPlus from "~icons/ph/plus";
import IconClipboard from "~icons/ph/clipboard-text";
import IconImage from "~icons/ph/image";
import IconCaret from "~icons/ph/caret-right";
import LoadingState from "@/components/ui/LoadingState.vue";
import PageHeader from "@/components/ui/PageHeader.vue";
import EmptyState from "@/components/ui/EmptyState.vue";
import ModalShell from "@/components/ui/ModalShell.vue";
import BaseForm from "@/components/BaseForm.vue";

const approved = ref(0);
const pending = ref(0);
const byType = ref<Record<BaseType, number>>({ Guerra: 0, Liga: 0, Mejora: 0, Recursos: 0 });
const loading = ref(true);
const loadError = ref(false);
const isNewBaseOpen = ref(false);

const managementLinks = [
  { name: "Comunidad", description: "Aprobar envíos de la comunidad", icon: IconClipboard, to: { path: "/comunidad" } },
  { name: "Imágenes", description: "Gestionar el almacenamiento", icon: IconImage, to: { path: "/imagenes" } },
];

async function fetchStats() {
  loading.value = true;
  loadError.value = false;
  try {
    const stats = await fetchDashboardStats();
    approved.value = stats.approved;
    pending.value = stats.pending;
    byType.value = stats.byType;
  } catch (error) {
    console.error("Error fetching stats:", error);
    loadError.value = true;
  } finally {
    loading.value = false;
  }
}

function handleNewBaseSuccess() {
  isNewBaseOpen.value = false;
  fetchDashboardStats()
    .then((stats) => {
      approved.value = stats.approved;
      pending.value = stats.pending;
      byType.value = stats.byType;
    })
    .catch((error) => console.error("Error fetching stats:", error));
}

onMounted(fetchStats);
</script>

<template>
  <LoadingState v-if="loading" />

  <div v-else class="space-y-page animate-in fade-in slide-in-from-bottom-2 duration-700 ease-out">
    <PageHeader title="Panel">
      <template #actions>
        <router-link
          to="/bases"
          class="hidden sm:flex cursor-pointer items-center gap-3 px-page h-[44px] rounded-full bg-card border-2 border-yellow-400 text-yellow-400 text-xs hover:bg-yellow-400/10 transition-all duration-300 shadow-xl shadow-yellow-400/10 active:scale-95"
        >
          <IconLayers class="h-4 w-4" />
          <span class="text-xs">Ver Bases</span>
        </router-link>
      </template>
    </PageHeader>

    <div v-if="loadError" class="flex flex-col items-center gap-page">
      <EmptyState message="No se pudieron cargar las estadísticas" />
      <button
        type="button"
        class="cursor-pointer h-[44px] px-page rounded-full bg-yellow-400 text-black text-xs hover:bg-yellow-300 transition-all active:scale-95"
        @click="fetchStats"
      >
        Reintentar
      </button>
    </div>

    <template v-else>
      <!-- Stats Grid -->
      <div class="grid grid-cols-2 md:grid-cols-3 gap-page">
        <div
          class="col-span-2 h-[200px] flex flex-col items-center justify-center text-center p-3 rounded-xl bg-gradient-to-br from-yellow-300 via-yellow-400 to-yellow-500 shadow-2xl relative overflow-hidden ring-1 ring-black/5 group"
        >
          <div class="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div
            class="absolute -right-10 -top-10 sm:-right-20 sm:-top-20 h-32 w-32 sm:h-64 sm:w-64 rounded-full bg-white/20 blur-2xl sm:blur-3xl"
          ></div>
          <div
            class="absolute -left-10 -bottom-10 sm:-left-20 sm:-bottom-20 h-32 w-32 sm:h-64 sm:w-64 rounded-full bg-black/5 blur-2xl sm:blur-3xl"
          ></div>
          <div class="relative z-10 space-y-0">
            <p class="text-[28px] text-black leading-none">{{ approved }}</p>
            <p class="text-black/60 text-xs">Bases publicadas</p>
          </div>
        </div>

        <Card
          v-for="type in BASE_TYPES"
          :key="type"
          class="group relative overflow-hidden border-none bg-card shadow-xl transition-all p-1 rounded-xl h-[200px]"
        >
          <div
            class="absolute right-0 top-0 h-24 w-24 sm:h-32 sm:w-32 bg-yellow-400/5 rounded-bl-[3rem] sm:rounded-bl-[4rem] translate-x-8 sm:translate-x-12 -translate-y-8 sm:-translate-y-12 transition-transform group-hover:scale-110"
          ></div>
          <CardContent class="h-full p-3 relative flex flex-col justify-center gap-page">
            <div
              class="h-12 w-12 rounded-xl bg-yellow-400/10 flex items-center justify-center group-hover:bg-yellow-400 transition-all duration-500 shadow-lg shadow-yellow-400/10"
            >
              <component
                :is="getBaseTypeIcon(type)"
                class="h-5 w-5 text-yellow-400 group-hover:text-black transition-colors"
              />
            </div>
            <div class="space-y-0">
              <h2 class="text-base text-white">{{ type }}</h2>
              <div class="text-[28px] mt-1 text-yellow-400">{{ byType[type] }}</div>
            </div>
          </CardContent>
        </Card>
      </div>

      <!-- Gestión -->
      <div class="space-y-3">
        <h2 class="text-base text-white">Gestión</h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-page">
          <button
            type="button"
            class="group flex cursor-pointer items-center gap-3 rounded-xl border border-border bg-card p-4 text-left transition-all hover:border-yellow-400/40 active:scale-[0.99]"
            @click="isNewBaseOpen = true"
          >
            <div
              class="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-yellow-400/10 text-yellow-400"
            >
              <IconPlus class="h-5 w-5" />
            </div>
            <div class="min-w-0 flex-1">
              <p class="text-sm text-white">Nueva base</p>
              <p class="truncate text-xs text-muted-foreground">Publicar directamente</p>
            </div>
            <IconCaret class="h-4 w-4 shrink-0 text-muted-foreground transition-colors group-hover:text-yellow-400" />
          </button>
          <router-link
            v-for="link in managementLinks"
            :key="link.name"
            :to="link.to"
            class="group flex items-center gap-3 rounded-xl border border-border bg-card p-4 transition-all hover:border-yellow-400/40 active:scale-[0.99]"
          >
            <div
              class="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-yellow-400/10 text-yellow-400"
            >
              <component :is="link.icon" class="h-5 w-5" />
            </div>
            <div class="min-w-0 flex-1">
              <p class="text-sm text-white">{{ link.name }}</p>
              <p class="truncate text-xs text-muted-foreground">{{ link.description }}</p>
            </div>
            <span
              v-if="link.to.path === '/comunidad' && pending > 0"
              :aria-label="`${pending} pendientes`"
              class="flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1.5 text-[11px] text-white"
            >
              {{ pending > 99 ? "99+" : pending }}
            </span>
            <IconCaret class="h-4 w-4 shrink-0 text-muted-foreground transition-colors group-hover:text-yellow-400" />
          </router-link>
        </div>
      </div>
    </template>

    <ModalShell
      :open="isNewBaseOpen"
      title="Nueva Base"
      max-width-class="max-w-2xl"
      scrollable
      @close="isNewBaseOpen = false"
    >
      <BaseForm @success="handleNewBaseSuccess" />
    </ModalShell>
  </div>
</template>
