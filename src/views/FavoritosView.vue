<script setup lang="ts">
import { ref, onMounted } from "vue";
import { supabase } from "@/lib/supabase";
import { user, isAdmin } from "@/lib/auth";
import { deleteBase } from "@/lib/admin";
import { toast } from "@/lib/toast";
import type { Base } from "@/lib/base";
import BaseCard from "@/components/BaseCard.vue";
import ImageViewer from "@/components/ImageViewer.vue";
import LoadingState from "@/components/ui/LoadingState.vue";
import PageHeader from "@/components/ui/PageHeader.vue";
import EmptyState from "@/components/ui/EmptyState.vue";
import ModalShell from "@/components/ui/ModalShell.vue";
import IconMore from "~icons/ph/dots-three-bold";
import BaseActionsModal, { type ActionsBase } from "@/components/BaseActionsModal.vue";
import IconHeartFill from "~icons/ph/heart-fill";
import IconCopy from "~icons/ph/copy";

const bases = ref<Base[]>([]);
const loading = ref(true);
const deleteTarget = ref<Base | null>(null);
const actionsBase = ref<ActionsBase | null>(null);
const isDeleting = ref(false);
const viewerBase = ref<Base | null>(null);

async function fetchFavorites() {
  if (!user.value) return;

  const { data, error } = await supabase
    .from("favorites")
    .select("bases(id, level_th, type, url_foto, link, created_at, profiles!bases_author_id_fkey(full_name))")
    .eq("user_id", user.value.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching favorites:", error);
    return;
  }

  bases.value = (data || []).map((row) => row.bases as unknown as Base | null).filter((b): b is Base => b !== null);
}

async function removeFavorite(baseId: string) {
  if (!user.value) return;

  const { error } = await supabase.from("favorites").delete().eq("user_id", user.value.id).eq("base_id", baseId);

  if (error) {
    toast.error("No se pudo quitar de favoritos");
    return;
  }

  bases.value = bases.value.filter((b) => b.id !== baseId);
  toast.success("Eliminada de favoritos");
}

async function confirmDelete() {
  const base = deleteTarget.value;
  if (!base || isDeleting.value) return;

  isDeleting.value = true;
  try {
    await deleteBase(base);
    bases.value = bases.value.filter((b) => b.id !== base.id);
    toast.success("Base eliminada");
    deleteTarget.value = null;
  } catch (error) {
    console.error("Error deleting base:", error);
    toast.error("No se pudo eliminar la base");
  } finally {
    isDeleting.value = false;
  }
}

onMounted(async () => {
  await fetchFavorites();
  loading.value = false;
});
</script>

<template>
  <LoadingState v-if="loading" />

  <div v-else class="space-y-page animate-in fade-in slide-in-from-bottom-2 duration-700 ease-out">
    <PageHeader title="Favoritos" />

    <div v-if="bases.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-page">
      <BaseCard v-for="base in bases" :key="base.id" :base="base" @open-image="viewerBase = base">
        <div class="flex w-full gap-2">
          <a
            v-if="base.link"
            :href="base.link"
            target="_blank"
            rel="noopener noreferrer"
            class="flex flex-1 cursor-pointer items-center justify-center gap-2 px-3 py-2.5 rounded-lg bg-secondary text-muted-foreground hover:bg-yellow-400/10 hover:text-yellow-400 transition-all border border-border text-xs"
          >
            <IconCopy class="w-4 h-4" />
            Copiar Base
          </a>
          <button
            type="button"
            aria-label="Quitar de favoritos"
            class="cursor-pointer p-2.5 rounded-lg bg-secondary text-red-500 hover:bg-red-600 hover:text-white transition-all border border-border"
            title="Quitar de favoritos"
            @click="removeFavorite(base.id)"
          >
            <IconHeartFill class="w-4 h-4" />
          </button>
          <button
            type="button"
            class="cursor-pointer p-2.5 rounded-lg bg-secondary text-muted-foreground hover:bg-yellow-400/10 hover:text-yellow-400 transition-all border border-border"
            title="Más opciones"
            aria-label="Más opciones"
            @click="actionsBase = base"
          >
            <IconMore class="w-4 h-4" />
          </button>
        </div>
      </BaseCard>
    </div>

    <EmptyState v-else message="Aún no tienes bases favoritas" />

    <BaseActionsModal
      :base="actionsBase"
      :can-delete="isAdmin"
      @close="actionsBase = null"
      @delete="(base) => (deleteTarget = base as Base)"
    />

    <ModalShell
      :open="deleteTarget !== null"
      title="Eliminar"
      border-class="border-red-500/20"
      @close="deleteTarget = null"
    >
      <div class="bg-secondary rounded-xl p-page border border-border">
        <p class="text-muted-foreground text-xs mb-1">Se eliminará la base para todos los usuarios:</p>
        <p class="text-white truncate text-sm">{{ deleteTarget?.type }} · Nivel {{ deleteTarget?.level_th }}</p>
      </div>

      <div class="flex gap-page pt-2">
        <button
          class="flex-1 cursor-pointer h-[44px] rounded-full bg-secondary border border-border text-muted-foreground text-xs hover:text-white transition-all active:scale-95"
          @click="deleteTarget = null"
        >
          Cancelar
        </button>
        <button
          :disabled="isDeleting"
          class="flex-1 cursor-pointer h-[44px] rounded-full bg-red-600 text-white text-xs hover:bg-red-500 transition-all active:scale-95 shadow-xl shadow-red-600/20 disabled:opacity-50 disabled:cursor-not-allowed"
          @click="confirmDelete"
        >
          Confirmar
        </button>
      </div>
    </ModalShell>

    <ImageViewer
      :open="viewerBase !== null"
      :url="viewerBase?.url_foto ?? ''"
      :title="viewerBase ? `Nivel ${viewerBase.level_th} - ${viewerBase.type}` : ''"
      @close="viewerBase = null"
    />
  </div>
</template>
