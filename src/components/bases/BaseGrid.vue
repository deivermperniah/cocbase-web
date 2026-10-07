<script setup lang="ts">
import { ref } from "vue";
import BaseCard from "@/components/bases/BaseCard.vue";
import BaseDetailsModal from "@/components/bases/BaseDetailsModal.vue";
import ImageViewer from "@/components/bases/ImageViewer.vue";
import ConfirmModal from "@/components/ui/ConfirmModal.vue";
import { deleteBase } from "@/lib/admin";
import { isAdmin } from "@/lib/auth";
import { baseLabel, type Base } from "@/lib/bases";
import { toast } from "@/lib/toast";

defineProps<{ bases: Base[] }>();
const emit = defineEmits<{ removed: [id: string] }>();
defineSlots<{ actions(props: { base: Base; openDetails: () => void }): unknown }>();

const viewerUrl = ref<string | null>(null);
const detailsBase = ref<Base | null>(null);
const deleteTarget = ref<Base | null>(null);
const isDeleting = ref(false);

async function confirmDelete() {
  const base = deleteTarget.value;
  if (!base) return;

  isDeleting.value = true;
  try {
    await deleteBase(base);
    emit("removed", base.id);
    deleteTarget.value = null;
    toast.success("Base eliminada");
  } catch (error) {
    console.error("Error deleting base:", error);
    toast.error("No se pudo eliminar la base");
  } finally {
    isDeleting.value = false;
  }
}
</script>

<template>
  <div class="card-grid">
    <BaseCard v-for="base in bases" :key="base.id" :base="base" @open-image="viewerUrl = base.url_foto">
      <slot name="actions" :base="base" :open-details="() => (detailsBase = base)" />
    </BaseCard>
  </div>

  <BaseDetailsModal
    :base="detailsBase"
    :can-delete="isAdmin"
    @close="detailsBase = null"
    @delete="(base) => (deleteTarget = base)"
  />
  <ConfirmModal
    :open="deleteTarget !== null"
    title="Eliminar"
    label="Se eliminará la base para todos los usuarios:"
    :detail="deleteTarget ? baseLabel(deleteTarget) : ''"
    :loading="isDeleting"
    @close="deleteTarget = null"
    @confirm="confirmDelete"
  />
  <ImageViewer :url="viewerUrl" @close="viewerUrl = null" />
</template>
