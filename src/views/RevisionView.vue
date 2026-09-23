<script setup lang="ts">
import { ref, onMounted } from "vue";
import { supabase } from "@/lib/supabase";
import { toast } from "@/lib/toast";
import LoadingSpinner from "@/components/LoadingSpinner.vue";
import IconCheck from "~icons/ph/check";
import IconX from "~icons/ph/x";
import IconBusiness from "~icons/ph/buildings";
import IconUser from "~icons/ph/user";
import IconOpen from "~icons/ph/arrow-square-out";

interface PendingBase {
  id: string;
  code: string;
  level_th: number;
  type: string;
  url_foto: string;
  link: string | null;
  created_at: string;
  profiles: { full_name: string | null } | null;
}

const pending = ref<PendingBase[]>([]);
const loading = ref(true);
const rejectModal = ref<{ isOpen: boolean; base: PendingBase | null; note: string }>({
  isOpen: false,
  base: null,
  note: "",
});

async function fetchPending() {
  const { data, error } = await supabase
    .from("bases")
    .select("*, profiles(full_name)")
    .eq("status", "pending")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching pending bases:", error);
    return;
  }

  pending.value = (data || []) as PendingBase[];
}

async function approve(base: PendingBase) {
  const { error } = await supabase
    .from("bases")
    .update({ status: "approved", reviewed_at: new Date().toISOString(), review_note: null })
    .eq("id", base.id);

  if (error) {
    toast.error("No se pudo aprobar la base.");
    return;
  }

  toast.success("Base aprobada.");
  pending.value = pending.value.filter((b) => b.id !== base.id);
}

function openReject(base: PendingBase) {
  rejectModal.value = { isOpen: true, base, note: "" };
}

function closeReject() {
  rejectModal.value = { isOpen: false, base: null, note: "" };
}

async function confirmReject() {
  const base = rejectModal.value.base;
  if (!base) return;

  const { error } = await supabase
    .from("bases")
    .update({
      status: "rejected",
      reviewed_at: new Date().toISOString(),
      review_note: rejectModal.value.note.trim() || null,
    })
    .eq("id", base.id);

  if (error) {
    toast.error("No se pudo rechazar la base.");
    return;
  }

  toast.success("Base rechazada.");
  pending.value = pending.value.filter((b) => b.id !== base.id);
  closeReject();
}

onMounted(async () => {
  await fetchPending();
  loading.value = false;
});
</script>

<template>
  <div v-if="loading" class="flex flex-col items-center justify-center min-h-[50vh]">
    <LoadingSpinner size="lg" />
  </div>

  <div v-else class="space-y-[15px] animate-in fade-in slide-in-from-bottom-2 duration-700 ease-out">
    <div class="flex items-center justify-between">
      <div>
        <h2 class="text-[28px] text-yellow-400">Revisión</h2>
      </div>
    </div>

    <div v-if="pending.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[15px]">
      <div
        v-for="base in pending"
        :key="base.id"
        class="group relative overflow-hidden bg-card shadow-2xl transition-all rounded-xl"
      >
        <div class="aspect-video relative overflow-hidden bg-secondary">
          <img :src="base.url_foto" class="block w-full h-full object-cover" loading="lazy" />
          <div class="pointer-events-none absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-60"></div>

          <div class="pointer-events-none absolute bottom-4 left-4 z-20 flex items-center gap-2">
            <span class="flex h-6 items-center gap-2 rounded-md bg-yellow-400 px-3 text-xs text-black shadow-lg">
              <IconBusiness class="h-3.5 w-3.5" />
              {{ base.level_th }}
            </span>
            <span class="flex h-6 items-center gap-2 rounded-md bg-yellow-400 px-3 text-xs text-black shadow-lg">
              {{ base.type }}
            </span>
          </div>
        </div>

        <div class="p-[15px] space-y-[15px]">
          <div class="flex items-center justify-between gap-2">
            <div class="min-w-0">
              <h3 class="text-sm text-white leading-none truncate">{{ base.code }}</h3>
              <p class="mt-1 flex items-center gap-1 text-xs text-muted-foreground truncate">
                <IconUser class="h-3 w-3" />
                {{ base.profiles?.full_name || "Sin nombre" }}
              </p>
            </div>
            <a
              v-if="base.link"
              :href="base.link"
              target="_blank"
              class="cursor-pointer shrink-0 p-2.5 rounded-lg bg-secondary text-muted-foreground hover:bg-yellow-400/10 hover:text-yellow-400 transition-all border border-border"
            >
              <IconOpen class="w-4 h-4" />
            </a>
          </div>

          <div class="flex gap-[15px]">
            <button
              @click="approve(base)"
              class="flex-1 flex cursor-pointer items-center justify-center gap-2 h-[44px] rounded-full bg-yellow-400 text-black text-xs hover:bg-yellow-300 transition-all active:scale-95 shadow-xl shadow-yellow-400/10"
            >
              <IconCheck class="w-4 h-4" />
              Aprobar
            </button>
            <button
              @click="openReject(base)"
              class="flex-1 flex cursor-pointer items-center justify-center gap-2 h-[44px] rounded-full bg-secondary border border-border text-red-500 text-xs hover:bg-red-600 hover:text-white transition-all active:scale-95"
            >
              <IconX class="w-4 h-4" />
              Rechazar
            </button>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="text-center">
      <p class="text-muted-foreground text-sm">No hay bases pendientes de revisión</p>
    </div>

    <Teleport to="body">
      <div v-if="rejectModal.isOpen" class="fixed inset-0 z-[100] flex items-center justify-center p-[15px]">
        <div class="absolute inset-0 bg-card/90 backdrop-blur-xl" @click="closeReject"></div>

        <div class="relative bg-card w-full max-w-md rounded-[1.25rem] shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-red-500/20 animate-in zoom-in-95 duration-300 overflow-hidden">
          <div class="p-[15px] space-y-[15px]">
            <div class="flex items-center justify-between">
              <h3 class="text-lg text-yellow-400">Rechazar base</h3>
              <button @click="closeReject" class="cursor-pointer p-2 rounded-lg bg-secondary text-muted-foreground hover:text-white transition-all">
                <IconX class="w-5 h-5" />
              </button>
            </div>

            <div class="flex flex-col">
              <label class="text-xs text-muted-foreground mb-2">Motivo (opcional)</label>
              <textarea
                v-model="rejectModal.note"
                rows="3"
                class="w-full rounded-lg bg-secondary border border-border text-white text-sm p-3 focus-visible:outline-none focus-visible:border-yellow-400 resize-none"
                placeholder="Ej: la captura no corresponde a la base"
              ></textarea>
            </div>

            <div class="flex gap-[15px] pt-2">
              <button @click="closeReject" class="flex-1 cursor-pointer h-[44px] rounded-full bg-secondary border border-border text-muted-foreground text-xs hover:text-white transition-all active:scale-95">
                Cancelar
              </button>
              <button @click="confirmReject" class="flex-1 cursor-pointer h-[44px] rounded-full bg-red-600 text-white text-xs hover:bg-red-500 transition-all active:scale-95 shadow-xl shadow-red-600/20">
                Rechazar
              </button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>
