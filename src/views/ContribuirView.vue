<script setup lang="ts">
import { ref, onMounted } from "vue";
import BaseForm from "@/components/BaseForm.vue";
import { supabase } from "@/lib/supabase";
import { user } from "@/lib/auth";
import { toast } from "@/lib/toast";
import type { BaseStatus } from "@/lib/constants";
import IconInfo from "~icons/ph/info";
import LoadingSpinner from "@/components/LoadingSpinner.vue";
import PageHeader from "@/components/ui/PageHeader.vue";
import ModalShell from "@/components/ui/ModalShell.vue";
import IconTrash from "~icons/ph/trash";
import IconClock from "~icons/ph/clock";
import IconCheckCircle from "~icons/ph/check-circle";
import IconXCircle from "~icons/ph/x-circle";
import IconBusiness from "~icons/ph/buildings";
import BaseBadge from "@/components/ui/BaseBadge.vue";
import { formatRelativeDate, getBaseTypeIcon } from "@/lib/base";

interface MyBase {
  id: string;
  code: string;
  level_th: number;
  type: string;
  status: BaseStatus;
  review_note: string | null;
  created_at: string;
}

const myBases = ref<MyBase[]>([]);
const loadingBases = ref(true);
const loadError = ref(false);
const deleteTarget = ref<MyBase | null>(null);
const isDeleting = ref(false);

const STATUS_GROUPS = [
  { status: "pending", title: "En revisión", icon: IconClock, colorClass: "text-muted-foreground" },
  { status: "approved", title: "Aprobadas", icon: IconCheckCircle, colorClass: "text-yellow-400" },
  { status: "rejected", title: "Rechazadas", icon: IconXCircle, colorClass: "text-red-400" },
] as const satisfies readonly { status: BaseStatus; [key: string]: unknown }[];

function basesByStatus(status: BaseStatus) {
  return myBases.value.filter((base) => base.status === status);
}

async function fetchMyBases() {
  if (!user.value) return;
  loadError.value = false;

  const { data, error } = await supabase
    .from("bases")
    .select("id, code, level_th, type, status, review_note, created_at")
    .eq("author_id", user.value.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching my bases:", error);
    loadError.value = true;
    return;
  }

  myBases.value = (data || []) as MyBase[];
}

async function retryFetch() {
  loadingBases.value = true;
  await fetchMyBases();
  loadingBases.value = false;
}

async function confirmDelete() {
  const base = deleteTarget.value;
  if (!base || isDeleting.value) return;

  isDeleting.value = true;
  const { data, error } = await supabase
    .from("bases")
    .delete()
    .eq("id", base.id)
    .eq("status", "rejected")
    .select("id");
  isDeleting.value = false;

  if (error || !data?.length) {
    console.error("Error deleting submission:", error);
    toast.error("No se pudo eliminar el envío.");
    return;
  }

  myBases.value = myBases.value.filter((b) => b.id !== base.id);
  deleteTarget.value = null;
  toast.success("Envío eliminado.");
}

function handleSuccess() {
  toast.info("Gracias por contribuir", "Un administrador revisará tu base pronto.");
  fetchMyBases();
}

onMounted(async () => {
  await fetchMyBases();
  loadingBases.value = false;
});
</script>

<template>
  <div class="space-y-page animate-in fade-in slide-in-from-bottom-2 duration-700 ease-out">
    <PageHeader title="Contribuir" />

    <div class="flex items-start gap-3 rounded-xl bg-secondary border border-yellow-400/20 p-page">
      <IconInfo class="mt-0.5 h-5 w-5 shrink-0 text-yellow-400" />
      <p class="font-body text-xs text-muted-foreground leading-relaxed">
        Revisa que la base no esté repetida y que la captura sea clara. Las bases aprobadas aparecen en el explorador para todos.
      </p>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-page">
      <div class="bg-card rounded-xl border border-border p-page">
        <h3 class="text-base text-white mb-page">Nueva base</h3>
        <BaseForm @success="handleSuccess" />
      </div>

      <div class="flex flex-col bg-card rounded-xl border border-border p-page">
        <h3 class="text-base text-white mb-page">Mis envíos</h3>

        <div v-if="loadingBases" class="flex flex-1 items-center justify-center py-8">
          <LoadingSpinner size="sm" />
        </div>

        <div v-else-if="loadError" class="flex flex-1 flex-col items-center justify-center gap-3 py-8 text-center">
          <p class="text-sm text-muted-foreground">No se pudieron cargar tus envíos</p>
          <button
            type="button"
            class="cursor-pointer h-9 px-4 rounded-full bg-yellow-400 text-black text-xs hover:bg-yellow-300 transition-all active:scale-95"
            @click="retryFetch"
          >
            Reintentar
          </button>
        </div>

        <div v-else-if="myBases.length > 0" class="space-y-5">
          <template v-for="group in STATUS_GROUPS" :key="group.status">
            <div v-if="basesByStatus(group.status).length > 0" class="space-y-2.5">
              <div class="flex items-center gap-1.5" :class="group.colorClass">
                <component :is="group.icon" class="h-4 w-4" />
                <h4 class="text-xs uppercase tracking-wide">{{ group.title }}</h4>
              </div>

              <div
                v-for="base in basesByStatus(group.status)"
                :key="base.id"
                class="overflow-hidden rounded-xl bg-secondary"
                :class="base.status === 'rejected' && 'border border-red-500/30'"
              >
                <div class="flex items-center gap-2 p-2.5">
                  <BaseBadge variant="accent" :icon="IconBusiness" shadow>{{ base.level_th }}</BaseBadge>
                  <BaseBadge variant="accent" :icon="getBaseTypeIcon(base.type)" shadow>{{ base.type }}</BaseBadge>
                  <span class="min-w-0 flex-1 truncate text-right text-xs text-muted-foreground">
                    {{ formatRelativeDate(base.created_at) }}
                  </span>
                </div>

                <div
                  v-if="base.status === 'rejected'"
                  class="flex items-center gap-3 border-t border-red-500/30 bg-red-500/10 px-2.5 py-2"
                >
                  <p class="min-w-0 flex-1 whitespace-pre-line break-words text-xs leading-4 text-red-300">
                    <template v-if="base.review_note"><span class="text-red-400">Motivo:</span> {{ base.review_note }}</template>
                    <template v-else>Rechazada sin motivo.</template>
                  </p>
                  <button
                    type="button"
                    class="flex h-9 shrink-0 cursor-pointer items-center gap-1.5 rounded-lg bg-card px-3 text-xs text-red-400 transition-all hover:bg-red-600 hover:text-white active:scale-95"
                    aria-label="Eliminar envío rechazado"
                    @click="deleteTarget = base"
                  >
                    <IconTrash class="h-4 w-4" />
                    Eliminar
                  </button>
                </div>
              </div>
            </div>
          </template>
        </div>

        <div v-else class="flex flex-1 flex-col items-center justify-center py-8 text-center">
          <p class="text-sm text-muted-foreground">Aún no has enviado bases</p>
        </div>
      </div>
    </div>

    <ModalShell
      :open="deleteTarget !== null"
      title="Eliminar envío"
      border-class="border-red-500/20"
      @close="deleteTarget = null"
    >
      <div class="bg-secondary rounded-xl p-page border border-border">
        <p class="text-muted-foreground text-xs mb-1">Envío rechazado:</p>
        <p class="text-white truncate text-sm">{{ deleteTarget?.type }} · Nivel {{ deleteTarget?.level_th }}</p>
      </div>

      <div class="flex gap-page pt-2">
        <button @click="deleteTarget = null" class="flex-1 cursor-pointer h-[44px] rounded-full bg-secondary border border-border text-muted-foreground text-xs hover:text-white transition-all active:scale-95">
          Cancelar
        </button>
        <button @click="confirmDelete" :disabled="isDeleting" class="flex-1 cursor-pointer h-[44px] rounded-full bg-red-600 text-white text-xs hover:bg-red-500 transition-all active:scale-95 shadow-xl shadow-red-600/20 disabled:opacity-50 disabled:cursor-not-allowed">
          Eliminar
        </button>
      </div>
    </ModalShell>
  </div>
</template>
