<script setup lang="ts">
import { ref, onMounted } from "vue";
import BaseForm from "@/components/BaseForm.vue";
import { supabase } from "@/lib/supabase";
import { user } from "@/lib/auth";
import { toast } from "@/lib/toast";
import { STATUS_LABEL, type BaseStatus } from "@/lib/constants";
import IconInfo from "~icons/ph/info";
import LoadingSpinner from "@/components/LoadingSpinner.vue";

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

function statusClass(status: BaseStatus) {
  if (status === "approved") return "bg-yellow-400 text-black";
  if (status === "rejected") return "bg-red-500/90 text-white";
  return "bg-secondary text-muted-foreground border border-border";
}

async function fetchMyBases() {
  if (!user.value) return;

  const { data, error } = await supabase
    .from("bases")
    .select("id, code, level_th, type, status, review_note, created_at")
    .eq("author_id", user.value.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching my bases:", error);
    return;
  }

  myBases.value = (data || []) as MyBase[];
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
  <div class="space-y-[15px] animate-in fade-in slide-in-from-bottom-2 duration-700 ease-out">
    <div>
      <h2 class="text-[28px] text-yellow-400">Contribuir</h2>
      <p class="mt-1 text-sm text-muted-foreground">
        Comparte tu diseño con la comunidad. Quedará en revisión antes de publicarse.
      </p>
    </div>

    <div class="flex items-start gap-3 rounded-xl bg-secondary border border-yellow-400/20 p-4">
      <IconInfo class="mt-0.5 h-5 w-5 shrink-0 text-yellow-400" />
      <p class="font-body text-xs text-muted-foreground leading-relaxed">
        Revisa que la base no esté repetida y que la captura sea clara. Las bases aprobadas aparecen en el explorador para todos.
      </p>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-[15px]">
      <div class="bg-card rounded-xl border border-border p-[15px]">
        <h3 class="text-base text-white mb-[15px]">Nueva base</h3>
        <BaseForm @success="handleSuccess" />
      </div>

      <div class="flex flex-col bg-card rounded-xl border border-border p-[15px]">
        <h3 class="text-base text-white mb-[15px]">Mis envíos</h3>

        <div v-if="loadingBases" class="flex flex-1 items-center justify-center py-8">
          <LoadingSpinner size="sm" />
        </div>

        <div v-else-if="myBases.length > 0" class="space-y-[10px]">
          <div
            v-for="base in myBases"
            :key="base.id"
            class="flex items-center justify-between gap-3 rounded-lg bg-secondary border border-border p-3"
          >
            <div class="min-w-0">
              <p class="text-sm text-white truncate">{{ base.code }}</p>
              <p class="text-xs text-muted-foreground">Nivel {{ base.level_th }} · {{ base.type }}</p>
              <p v-if="base.review_note" class="mt-1 text-xs text-red-400 truncate">{{ base.review_note }}</p>
            </div>
            <span class="flex h-6 shrink-0 items-center rounded-md px-3 text-xs" :class="statusClass(base.status)">
              {{ STATUS_LABEL[base.status] }}
            </span>
          </div>
        </div>

        <div v-else class="flex flex-1 flex-col items-center justify-center py-8 text-center">
          <p class="text-sm text-muted-foreground">Aún no has enviado bases</p>
        </div>
      </div>
    </div>
  </div>
</template>
