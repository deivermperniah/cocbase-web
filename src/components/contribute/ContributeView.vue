<script setup lang="ts">
import { ref } from "vue";
import IconInfo from "~icons/ph/info";
import IconTrash from "~icons/ph/trash";
import AuthGate from "@/components/auth/AuthGate.vue";
import BaseForm from "@/components/bases/BaseForm.vue";
import MySubmissions from "@/components/contribute/MySubmissions.vue";
import AppButton from "@/components/ui/AppButton.vue";
import ConfirmModal from "@/components/ui/ConfirmModal.vue";
import EmptyState from "@/components/ui/EmptyState.vue";
import LoadingState from "@/components/ui/LoadingState.vue";
import PageHeader from "@/components/ui/PageHeader.vue";
import { user } from "@/lib/auth";
import { baseLabel, deleteRejectedBase, fetchMyBases, type MyBase } from "@/lib/bases";
import { toast } from "@/lib/toast";

const myBases = ref<MyBase[]>([]);
const loading = ref(true);
const loadError = ref(false);
const deleteTarget = ref<MyBase | null>(null);
const isDeleting = ref(false);

async function load() {
  loading.value = true;
  loadError.value = false;
  try {
    myBases.value = await fetchMyBases(user.value!.id);
  } catch (error) {
    console.error("Error fetching my bases:", error);
    loadError.value = true;
  } finally {
    loading.value = false;
  }
}

async function confirmDelete() {
  const base = deleteTarget.value;
  if (!base) return;

  isDeleting.value = true;
  try {
    await deleteRejectedBase(base.id);
    myBases.value = myBases.value.filter((b) => b.id !== base.id);
    deleteTarget.value = null;
    toast.success("Envío eliminado");
  } catch (error) {
    console.error("Error deleting submission:", error);
    toast.error("No se pudo eliminar el envío");
  } finally {
    isDeleting.value = false;
  }
}
</script>

<template>
  <AuthGate access="user" @ready="load">
    <div class="space-y-page">
      <PageHeader title="Contribuir" />

      <div class="flex items-start gap-3 rounded-xl border border-primary/20 bg-secondary p-page">
        <IconInfo class="mt-0.5 h-5 w-5 shrink-0 text-primary" />
        <p class="font-body text-xs leading-relaxed text-muted-foreground">
          Revisa que la base no esté repetida y que la captura sea clara. Las bases aprobadas aparecen en el explorador
          para todos.
        </p>
      </div>

      <div class="grid grid-cols-1 gap-page lg:grid-cols-2">
        <section class="rounded-xl border border-border bg-card p-page">
          <h2 class="mb-page text-base text-white">Nueva base</h2>
          <BaseForm @success="load" />
        </section>

        <section class="rounded-xl border border-border bg-card p-page">
          <h2 class="mb-page text-base text-white">Mis envíos</h2>

          <LoadingState v-if="loading" size="sm" />

          <EmptyState v-else-if="loadError" message="No se pudieron cargar tus envíos">
            <AppButton @click="load">Reintentar</AppButton>
          </EmptyState>

          <EmptyState v-else-if="myBases.length === 0" message="Aún no has enviado bases" />

          <MySubmissions v-else :bases="myBases">
            <template #rejected-actions="{ base }">
              <button
                type="button"
                class="flex h-9 shrink-0 cursor-pointer items-center gap-1.5 rounded-lg bg-card px-3 text-xs text-red-400 hover:bg-red-600 hover:text-white"
                @click="deleteTarget = base"
              >
                <IconTrash class="h-4 w-4" />
                Eliminar
              </button>
            </template>
          </MySubmissions>
        </section>
      </div>

      <ConfirmModal
        :open="deleteTarget !== null"
        title="Eliminar envío"
        label="Envío rechazado:"
        :detail="deleteTarget ? baseLabel(deleteTarget) : ''"
        confirm-text="Eliminar"
        :loading="isDeleting"
        @close="deleteTarget = null"
        @confirm="confirmDelete"
      />
    </div>
  </AuthGate>
</template>
