<script setup lang="ts">
import { ref, onMounted } from "vue";
import { supabase } from "@/lib/supabase";
import { user, isAdmin } from "@/lib/auth";
import { deleteBase } from "@/lib/admin";
import { toast } from "@/lib/toast";
import { getBaseTypeIcon } from "@/lib/base";
import LoadingState from "@/components/ui/LoadingState.vue";
import PageHeader from "@/components/ui/PageHeader.vue";
import BaseBadge from "@/components/ui/BaseBadge.vue";
import EmptyState from "@/components/ui/EmptyState.vue";
import ModalShell from "@/components/ui/ModalShell.vue";
import IconMore from "~icons/ph/dots-three-bold";
import BaseActionsModal, { type ActionsBase } from "@/components/BaseActionsModal.vue";
import IconHeartFill from "~icons/ph/heart-fill";
import IconCopy from "~icons/ph/copy";
import IconBusiness from "~icons/ph/buildings";

interface FavBase {
  id: string;
  level_th: number;
  type: string;
  url_foto: string;
  link: string | null;
  created_at: string;
  profiles: { full_name: string | null } | null;
}

const bases = ref<FavBase[]>([]);
const loading = ref(true);
const deleteTarget = ref<FavBase | null>(null);
const actionsBase = ref<ActionsBase | null>(null);
const isDeleting = ref(false);

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

  bases.value = (data || [])
    .map((row: any) => row.bases)
    .filter((b: any) => b) as FavBase[];
}

async function removeFavorite(baseId: string) {
  if (!user.value) return;

  const { error } = await supabase
    .from("favorites")
    .delete()
    .eq("user_id", user.value.id)
    .eq("base_id", baseId);

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
      <div
        v-for="base in bases"
        :key="base.id"
        class="group relative overflow-hidden bg-card border border-border shadow-2xl transition-all rounded-xl"
      >
        <div class="aspect-video relative overflow-hidden bg-secondary">
          <img :src="base.url_foto" alt="" width="1280" height="720" decoding="async" class="block w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" loading="lazy" />
          <div class="pointer-events-none absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-60"></div>

          <div class="pointer-events-none absolute bottom-4 left-4 z-20 flex items-center gap-2">
            <BaseBadge variant="accent" :icon="IconBusiness" shadow>{{ base.level_th }}</BaseBadge>
            <BaseBadge variant="accent" :icon="getBaseTypeIcon(base.type)" shadow>{{ base.type }}</BaseBadge>
          </div>
        </div>

        <div class="p-page">
          <div class="flex items-center justify-between">
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
                @click="removeFavorite(base.id)"
                class="cursor-pointer p-2.5 rounded-lg bg-secondary text-red-500 hover:bg-red-600 hover:text-white transition-all border border-border"
                title="Quitar de favoritos"
              >
                <IconHeartFill class="w-4 h-4" />
              </button>
              <button
                @click="actionsBase = base"
                class="cursor-pointer p-2.5 rounded-lg bg-secondary text-muted-foreground hover:bg-yellow-400/10 hover:text-yellow-400 transition-all border border-border"
                title="Más opciones"
                aria-label="Más opciones"
              >
                <IconMore class="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <EmptyState v-else message="Aún no tienes bases favoritas" />

    <BaseActionsModal
      :base="actionsBase"
      :can-delete="isAdmin"
      @close="actionsBase = null"
      @delete="(base) => (deleteTarget = base as FavBase)"
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
        <button @click="deleteTarget = null" class="flex-1 cursor-pointer h-[44px] rounded-full bg-secondary border border-border text-muted-foreground text-xs hover:text-white transition-all active:scale-95">
          Cancelar
        </button>
        <button @click="confirmDelete" :disabled="isDeleting" class="flex-1 cursor-pointer h-[44px] rounded-full bg-red-600 text-white text-xs hover:bg-red-500 transition-all active:scale-95 shadow-xl shadow-red-600/20 disabled:opacity-50 disabled:cursor-not-allowed">
          Confirmar
        </button>
      </div>
    </ModalShell>
  </div>
</template>
