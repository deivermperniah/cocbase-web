<script setup lang="ts">
import { ref } from "vue";
import IconCheck from "~icons/ph/check";
import IconX from "~icons/ph/x";
import IconUser from "~icons/ph/user";
import IconOpen from "~icons/ph/arrow-square-out";
import AuthGate from "@/components/auth/AuthGate.vue";
import BaseGrid from "@/components/bases/BaseGrid.vue";
import AppButton from "@/components/ui/AppButton.vue";
import CardSkeletonGrid from "@/components/ui/CardSkeletonGrid.vue";
import ConfirmModal from "@/components/ui/ConfirmModal.vue";
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
const rejectTarget = ref<Base | null>(null);
const rejectNote = ref("");

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

async function review(base: Base, status: "approved" | "rejected", note: string | null = null) {
  busyId.value = base.id;
  try {
    await reviewBase(base.id, status, note);
    pending.value = pending.value.filter((b) => b.id !== base.id);
    rejectTarget.value = null;
    toast.success(status === "approved" ? "Base aprobada" : "Base rechazada");
  } catch (error) {
    console.error("Error reviewing base:", error);
    toast.error(status === "approved" ? "No se pudo aprobar la base" : "No se pudo rechazar la base");
  } finally {
    busyId.value = null;
  }
}

function openReject(base: Base) {
  rejectNote.value = "";
  rejectTarget.value = base;
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
            <div class="flex gap-page">
              <AppButton
                :icon="IconCheck"
                :loading="busyId === base.id && !rejectTarget"
                :disabled="busyId !== null"
                class="flex-1"
                @click="review(base, 'approved')"
              >
                Aprobar
              </AppButton>
              <AppButton variant="secondary" :icon="IconX" :disabled="busyId !== null" class="flex-1" @click="openReject(base)">
                Rechazar
              </AppButton>
            </div>
          </div>
        </template>
      </BaseGrid>

      <ConfirmModal
        :open="rejectTarget !== null"
        title="Rechazar base"
        confirm-text="Rechazar"
        :loading="busyId !== null"
        @close="rejectTarget = null"
        @confirm="rejectTarget && review(rejectTarget, 'rejected', rejectNote.trim() || null)"
      >
        <div class="flex flex-col gap-2">
          <label for="reject-note" class="text-xs text-muted-foreground">Motivo (opcional)</label>
          <textarea
            id="reject-note"
            v-model="rejectNote"
            rows="3"
            maxlength="200"
            placeholder="Ej: la captura no corresponde a la base"
            class="w-full resize-none rounded-lg border border-border bg-secondary p-3 text-sm text-white outline-none focus:border-primary"
          ></textarea>
          <span class="self-end text-[11px] text-muted-foreground">{{ rejectNote.length }}/200</span>
        </div>
      </ConfirmModal>
    </div>
  </AuthGate>
</template>
