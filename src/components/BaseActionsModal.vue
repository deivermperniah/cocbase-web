<script setup lang="ts">
import { computed } from "vue";
import { toast } from "@/lib/toast";
import { getBaseTypeIcon } from "@/lib/base";
import ModalShell from "@/components/ui/ModalShell.vue";
import BaseBadge from "@/components/ui/BaseBadge.vue";
import IconBusiness from "~icons/ph/buildings";
import IconShare from "~icons/ph/share-network";
import IconTrash from "~icons/ph/trash";

export interface ActionsBase {
  id: string;
  level_th: number;
  type: string;
  url_foto?: string | null;
  link?: string | null;
  created_at?: string | null;
  profiles?: { full_name: string | null } | null;
}

const DEFAULT_DESIGNER = "Deiver Pernia";

const props = withDefaults(defineProps<{ base: ActionsBase | null; canDelete?: boolean }>(), {
  canDelete: false,
});

const emit = defineEmits<{
  (e: "close"): void;
  (e: "delete", base: ActionsBase): void;
}>();

const shareUrl = computed(() => props.base?.link || props.base?.url_foto || "");

const publishedAt = computed(() => {
  if (!props.base?.created_at) return "—";
  return new Date(props.base.created_at).toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
});

async function share() {
  const base = props.base;
  if (!base || !shareUrl.value) return;
  emit("close");

  const text = `Base de ${base.type} · Nivel ${base.level_th}`;
  try {
    if (navigator.share) {
      await navigator.share({ title: text, text, url: shareUrl.value });
      return;
    }
    await navigator.clipboard.writeText(shareUrl.value);
    toast.success("Enlace copiado al portapapeles");
  } catch (error) {
    if ((error as DOMException)?.name !== "AbortError") {
      toast.error("No se pudo compartir la base");
    }
  }
}

function remove() {
  const base = props.base;
  if (!base) return;
  emit("close");
  emit("delete", base);
}
</script>

<template>
  <ModalShell :open="base !== null" title="Detalles" @close="emit('close')">
    <template v-if="base">
      <div class="flex items-center justify-center gap-2">
        <BaseBadge variant="accent" :icon="IconBusiness">{{ base.level_th }}</BaseBadge>
        <BaseBadge variant="accent" :icon="getBaseTypeIcon(base.type)">{{ base.type }}</BaseBadge>
      </div>

      <div class="overflow-hidden rounded-xl border border-border bg-secondary text-sm">
        <div class="flex items-center justify-between gap-3 px-4 py-3">
          <span class="text-muted-foreground">Diseñador</span>
          <span class="truncate text-white">{{ base.profiles?.full_name || DEFAULT_DESIGNER }}</span>
        </div>
        <div class="flex items-center justify-between gap-3 border-t border-border px-4 py-3">
          <span class="text-muted-foreground">Publicado</span>
          <span class="text-white">{{ publishedAt }}</span>
        </div>
      </div>

      <div v-if="shareUrl || canDelete" class="overflow-hidden rounded-xl border border-border bg-secondary text-sm">
        <button
          v-if="shareUrl"
          type="button"
          class="flex w-full cursor-pointer items-center gap-3 px-4 py-3 text-white transition-colors hover:bg-card"
          @click="share"
        >
          <IconShare class="h-5 w-5 text-yellow-400" />
          Compartir
        </button>
        <button
          v-if="canDelete"
          type="button"
          class="flex w-full cursor-pointer items-center gap-3 px-4 py-3 text-red-400 transition-colors hover:bg-red-500/10"
          :class="shareUrl && 'border-t border-border'"
          @click="remove"
        >
          <IconTrash class="h-5 w-5" />
          Eliminar base
        </button>
      </div>

      <button
        type="button"
        class="h-[44px] w-full cursor-pointer rounded-full bg-yellow-400 text-xs text-black transition-all hover:bg-yellow-300 active:scale-95"
        @click="emit('close')"
      >
        Cerrar
      </button>
    </template>
  </ModalShell>
</template>
