<script setup lang="ts">
import { ref, onMounted } from "vue";
import { supabase } from "@/lib/supabase";
import { toast } from "@/lib/toast";
import { formatRelativeDate, getBaseTypeIcon } from "@/lib/base";
import { REVIEW_COLUMNS, pendingCount, reviewBase } from "@/lib/admin";
import LoadingState from "@/components/ui/LoadingState.vue";
import PageHeader from "@/components/ui/PageHeader.vue";
import BaseBadge from "@/components/ui/BaseBadge.vue";
import EmptyState from "@/components/ui/EmptyState.vue";
import ModalShell from "@/components/ui/ModalShell.vue";
import IconCheck from "~icons/ph/check";
import IconX from "~icons/ph/x";
import IconBusiness from "~icons/ph/buildings";
import IconUser from "~icons/ph/user";
import IconOpen from "~icons/ph/arrow-square-out";
import IconSync from "~icons/ph/arrows-clockwise";
import IconImage from "~icons/ph/image";

interface PendingBase {
  id: string;
  code: string;
  level_th: number;
  type: string;
  url_foto: string | null;
  link: string | null;
  created_at: string;
  profiles: { full_name: string | null } | null;
}

const pending = ref<PendingBase[]>([]);
const loading = ref(true);
const loadError = ref(false);
const busyId = ref<string | null>(null);
const rejectModal = ref<{ isOpen: boolean; base: PendingBase | null; note: string }>({
  isOpen: false,
  base: null,
  note: "",
});

async function fetchPending() {
  loading.value = true;
  loadError.value = false;

  try {
    const { data, error } = await supabase
      .from("bases")
      .select(REVIEW_COLUMNS)
      .eq("status", "pending")
      .order("created_at", { ascending: false });

    if (error) throw error;

    pending.value = (data || []) as unknown as PendingBase[];
    pendingCount.value = pending.value.length;
  } catch (error) {
    console.error("Error fetching pending bases:", error);
    loadError.value = true;
  } finally {
    loading.value = false;
  }
}

async function review(base: PendingBase, status: "approved" | "rejected", note: string | null = null) {
  if (busyId.value) return false;
  busyId.value = base.id;

  try {
    await reviewBase(base.id, status, note);
    pending.value = pending.value.filter((b) => b.id !== base.id);
    toast.success(status === "approved" ? "Base aprobada." : "Base rechazada.");
    return true;
  } catch (error) {
    console.error("Error reviewing base:", error);
    toast.error(status === "approved" ? "No se pudo aprobar la base." : "No se pudo rechazar la base.");
    return false;
  } finally {
    busyId.value = null;
  }
}

function approve(base: PendingBase) {
  review(base, "approved");
}

function openReject(base: PendingBase) {
  rejectModal.value = { isOpen: true, base, note: "" };
}

function closeReject() {
  if (busyId.value) return;
  rejectModal.value = { isOpen: false, base: null, note: "" };
}

async function confirmReject() {
  const base = rejectModal.value.base;
  if (!base) return;

  const ok = await review(base, "rejected", rejectModal.value.note.trim() || null);
  if (ok) closeReject();
}

onMounted(fetchPending);
</script>

<template>
  <LoadingState v-if="loading" />

  <div v-else class="space-y-page animate-in fade-in slide-in-from-bottom-2 duration-700 ease-out">
    <PageHeader
      title="Comunidad"
      :subtitle="loadError || pending.length === 0 ? '' : pending.length === 1 ? '1 base pendiente' : `${pending.length} bases pendientes`"
    >
      <template v-if="!loadError && pending.length > 0" #actions>
        <button
          type="button"
          class="flex cursor-pointer items-center justify-center w-[44px] h-[44px] rounded-full bg-secondary border-2 border-border text-muted-foreground hover:text-yellow-400 hover:border-yellow-400 transition-all active:scale-95"
          aria-label="Recargar"
          @click="fetchPending"
        >
          <IconSync class="w-4 h-4" />
        </button>
      </template>
    </PageHeader>

    <div v-if="loadError" class="flex flex-col items-center gap-page text-center">
      <EmptyState message="No se pudieron cargar las bases pendientes." />
      <button
        type="button"
        class="cursor-pointer h-[44px] px-page rounded-full bg-yellow-400 text-black text-xs hover:bg-yellow-300 transition-all active:scale-95"
        @click="fetchPending"
      >
        Reintentar
      </button>
    </div>

    <div v-else-if="pending.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-page">
      <div
        v-for="base in pending"
        :key="base.id"
        class="group relative overflow-hidden bg-card border border-border shadow-2xl transition-all rounded-xl"
        :class="busyId === base.id && 'opacity-60'"
      >
        <div class="aspect-video relative overflow-hidden bg-secondary">
          <a
            v-if="base.url_foto"
            :href="base.url_foto"
            target="_blank"
            rel="noopener noreferrer"
            class="block w-full h-full cursor-zoom-in"
            aria-label="Ver imagen completa"
          >
            <img :src="base.url_foto" :alt="`${base.type} · Nivel ${base.level_th}`" class="block w-full h-full object-cover" loading="lazy" />
          </a>
          <div v-else class="flex h-full w-full flex-col items-center justify-center gap-2 text-muted-foreground">
            <IconImage class="h-8 w-8" />
            <span class="text-xs">Sin imagen</span>
          </div>
          <div class="pointer-events-none absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-60"></div>

          <div class="pointer-events-none absolute bottom-4 left-4 z-20 flex items-center gap-2">
            <BaseBadge variant="accent" :icon="IconBusiness" shadow>{{ base.level_th }}</BaseBadge>
            <BaseBadge variant="accent" :icon="getBaseTypeIcon(base.type)" shadow>{{ base.type }}</BaseBadge>
          </div>
        </div>

        <div class="p-page space-y-page">
          <div class="flex items-center justify-between gap-2">
            <div class="min-w-0">
              <p class="flex items-center gap-1 text-xs text-muted-foreground truncate">
                <IconUser class="h-3 w-3 shrink-0" />
                <span class="truncate">{{ base.profiles?.full_name || "Sin nombre" }}</span>
                <span class="shrink-0">· {{ formatRelativeDate(base.created_at) }}</span>
              </p>
            </div>
            <a
              v-if="base.link"
              :href="base.link"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Abrir enlace de la base"
              class="cursor-pointer shrink-0 p-2.5 rounded-lg bg-secondary text-muted-foreground hover:bg-yellow-400/10 hover:text-yellow-400 transition-all border border-border"
            >
              <IconOpen class="w-4 h-4" />
            </a>
          </div>

          <div class="flex gap-page">
            <button
              :disabled="busyId !== null"
              @click="approve(base)"
              class="flex-1 flex cursor-pointer items-center justify-center gap-2 h-[44px] rounded-full bg-yellow-400 text-black text-xs hover:bg-yellow-300 transition-all active:scale-95 shadow-xl shadow-yellow-400/10 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <IconSync v-if="busyId === base.id && !rejectModal.isOpen" class="w-4 h-4 animate-spin" />
              <IconCheck v-else class="w-4 h-4" />
              Aprobar
            </button>
            <button
              :disabled="busyId !== null"
              @click="openReject(base)"
              class="flex-1 flex cursor-pointer items-center justify-center gap-2 h-[44px] rounded-full bg-secondary border border-border text-red-500 text-xs hover:bg-red-600 hover:text-white transition-all active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <IconX class="w-4 h-4" />
              Rechazar
            </button>
          </div>
        </div>
      </div>
    </div>

    <EmptyState v-else message="No hay bases pendientes de revisión" />

    <ModalShell
      :open="rejectModal.isOpen"
      title="Rechazar base"
      border-class="border-red-500/20"
      @close="closeReject"
    >
      <div class="flex flex-col">
        <label for="reject-note" class="text-xs text-muted-foreground mb-2">Motivo (opcional)</label>
        <textarea
          id="reject-note"
          v-model="rejectModal.note"
          rows="3"
          maxlength="200"
          class="w-full rounded-lg bg-secondary border border-border text-white text-sm p-3 focus-visible:outline-none focus-visible:border-yellow-400 resize-none"
          placeholder="Ej: la captura no corresponde a la base"
        ></textarea>
        <span class="mt-1 self-end text-[10px] text-muted-foreground">{{ rejectModal.note.length }}/200</span>
      </div>

      <div class="flex gap-page pt-2">
        <button
          :disabled="busyId !== null"
          @click="closeReject"
          class="flex-1 cursor-pointer h-[44px] rounded-full bg-secondary border border-border text-muted-foreground text-xs hover:text-white transition-all active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Cancelar
        </button>
        <button
          :disabled="busyId !== null"
          @click="confirmReject"
          class="flex-1 flex cursor-pointer items-center justify-center gap-2 h-[44px] rounded-full bg-red-600 text-white text-xs hover:bg-red-500 transition-all active:scale-95 shadow-xl shadow-red-600/20 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <IconSync v-if="busyId !== null" class="w-4 h-4 animate-spin" />
          Rechazar
        </button>
      </div>
    </ModalShell>
  </div>
</template>
