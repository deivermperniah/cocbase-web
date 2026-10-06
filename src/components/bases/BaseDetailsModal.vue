<script setup lang="ts">
import { computed } from "vue";
import IconBuildings from "~icons/ph/buildings";
import IconShare from "~icons/ph/share-network";
import AppButton from "@/components/ui/AppButton.vue";
import Badge from "@/components/ui/Badge.vue";
import Modal from "@/components/ui/Modal.vue";
import { baseLabel, formatDate, getBaseTypeIcon, type Base } from "@/lib/bases";
import { toast } from "@/lib/toast";

const DEFAULT_DESIGNER = "Deiver Pernia";

const props = defineProps<{ base: Base | null }>();
const emit = defineEmits<{ close: [] }>();

const shareUrl = computed(() => props.base?.link || props.base?.url_foto || "");

async function share() {
  if (!props.base) return;
  const text = baseLabel(props.base);
  emit("close");
  try {
    if (navigator.share) {
      await navigator.share({ title: text, text, url: shareUrl.value });
      return;
    }
    await navigator.clipboard.writeText(shareUrl.value);
    toast.success("Enlace copiado al portapapeles");
  } catch (error) {
    if ((error as DOMException).name !== "AbortError") toast.error("No se pudo compartir la base");
  }
}

const rowClass = "flex w-full items-center gap-3 px-4 py-3";
</script>

<template>
  <Modal :open="base !== null" title="Detalles" @close="emit('close')">
    <template v-if="base">
      <div class="flex justify-center gap-2">
        <Badge :icon="IconBuildings">{{ base.level_th }}</Badge>
        <Badge :icon="getBaseTypeIcon(base.type)">{{ base.type }}</Badge>
      </div>

      <div class="divide-y divide-border overflow-hidden rounded-xl border border-border bg-secondary text-sm">
        <div :class="rowClass" class="justify-between">
          <span class="text-muted-foreground">Diseñador</span>
          <span class="truncate text-white">{{ base.profiles?.full_name || DEFAULT_DESIGNER }}</span>
        </div>
        <div :class="rowClass" class="justify-between">
          <span class="text-muted-foreground">Publicado</span>
          <span class="text-white">{{ formatDate(base.created_at) }}</span>
        </div>
      </div>

      <div v-if="shareUrl" class="overflow-hidden rounded-xl border border-border bg-secondary text-sm">
        <button type="button" :class="rowClass" class="cursor-pointer text-white hover:bg-card" @click="share">
          <IconShare class="h-5 w-5 text-primary" />
          Compartir
        </button>
      </div>

      <AppButton class="w-full" @click="emit('close')">Cerrar</AppButton>
    </template>
  </Modal>
</template>
