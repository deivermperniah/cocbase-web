<script setup lang="ts">
import { ref } from "vue";
import IconCheck from "~icons/ph/check";
import IconUser from "~icons/ph/user";
import IconOpen from "~icons/ph/arrow-square-out";
import AuthGate from "@/components/auth/AuthGate.vue";
import BaseGrid from "@/components/bases/BaseGrid.vue";
import AppButton from "@/components/ui/AppButton.vue";
import CardSkeletonGrid from "@/components/ui/CardSkeletonGrid.vue";
import EmptyState from "@/components/ui/EmptyState.vue";
import IconButton from "@/components/ui/IconButton.vue";
import PageHeader from "@/components/ui/PageHeader.vue";
import { pendingCount, reviewBase } from "@/lib/admin";
import { fetchPendingBases, formatRelativeDate, type Base } from "@/lib/bases";
import { toast } from "@/lib/toast";

const pending = ref<Base[]>([]);
const loading = ref(true);
const loadError = ref(false);
const busyId = ref<string | null>(null);

async function load() {
  loading.value = true;
  loadError.value = false;
  try {
    pending.value = await fetchPendingBases();
    pendingCount.value = pending.value.length;
  } catch (error) {
    console.error("Error fetching pending bases:", error);
    loadError.value = true;
  } finally {
    loading.value = false;
  }
}

async function approve(base: Base) {
  busyId.value = base.id;
  try {
    await reviewBase(base.id, "approved");
    pending.value = pending.value.filter((b) => b.id !== base.id);
    toast.success("Base aprobada");
  } catch (error) {
    console.error("Error approving base:", error);
    toast.error("No se pudo aprobar la base");
  } finally {
    busyId.value = null;
  }
}
</script>

<template>
  <AuthGate access="admin" @ready="load">
    <div class="space-y-page">
      <PageHeader
        title="Comunidad"
        :subtitle="pending.length ? `${pending.length} ${pending.length === 1 ? 'base pendiente' : 'bases pendientes'}` : ''"
      />

      <CardSkeletonGrid v-if="loading" />

      <EmptyState v-else-if="loadError" message="No se pudieron cargar las bases pendientes">
        <AppButton @click="load">Reintentar</AppButton>
      </EmptyState>

      <EmptyState v-else-if="pending.length === 0" message="No hay bases pendientes de revisión" />

      <BaseGrid v-else :bases="pending">
        <template #actions="{ base }">
          <div class="space-y-page">
            <div class="flex min-h-[38px] items-center justify-between gap-2">
              <p class="flex min-w-0 items-center gap-1 text-xs text-muted-foreground">
                <IconUser class="h-3 w-3 shrink-0" />
                <span class="truncate">{{ base.profiles?.full_name || "Sin nombre" }}</span>
                <span class="shrink-0">· {{ formatRelativeDate(base.created_at) }}</span>
              </p>
              <IconButton v-if="base.link" :icon="IconOpen" :href="base.link" />
            </div>
            <AppButton
              :icon="IconCheck"
              :loading="busyId === base.id"
              :disabled="busyId !== null"
              class="w-full"
              @click="approve(base)"
            >
              Aprobar
            </AppButton>
          </div>
        </template>
      </BaseGrid>
    </div>
  </AuthGate>
</template>
