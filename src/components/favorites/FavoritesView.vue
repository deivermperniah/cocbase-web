<script setup lang="ts">
import { ref } from "vue";
import IconHeartFill from "~icons/ph/heart-fill";
import IconMore from "~icons/ph/dots-three-bold";
import AuthGate from "@/components/auth/AuthGate.vue";
import BaseGrid from "@/components/bases/BaseGrid.vue";
import AppButton from "@/components/ui/AppButton.vue";
import CopyBaseButton from "@/components/bases/CopyBaseButton.vue";
import CardSkeletonGrid from "@/components/ui/CardSkeletonGrid.vue";
import EmptyState from "@/components/ui/EmptyState.vue";
import IconButton from "@/components/ui/IconButton.vue";
import PageHeader from "@/components/ui/PageHeader.vue";
import { user } from "@/lib/auth";
import type { Base } from "@/lib/bases";
import { fetchFavoriteBases, removeFavorite } from "@/lib/favorites";
import { toast } from "@/lib/toast";

const bases = ref<Base[]>([]);
const loading = ref(true);
const loadError = ref(false);

async function load() {
  loading.value = true;
  loadError.value = false;
  try {
    bases.value = await fetchFavoriteBases(user.value!.id);
  } catch (error) {
    console.error("Error fetching favorites:", error);
    loadError.value = true;
  } finally {
    loading.value = false;
  }
}

async function unfavorite(id: string) {
  try {
    await removeFavorite(user.value!.id, id);
    bases.value = bases.value.filter((base) => base.id !== id);
    toast.success("Eliminada de favoritos");
  } catch {
    toast.error("No se pudo quitar de favoritos");
  }
}
</script>

<template>
  <div class="space-y-page">
    <PageHeader title="Favoritos" />

    <CardSkeletonGrid v-if="loading" />

    <AuthGate access="auth" @ready="load">
      <template v-if="!loading">
        <EmptyState v-if="loadError" message="No se pudieron cargar tus favoritos">
          <AppButton @click="load">Reintentar</AppButton>
        </EmptyState>

        <EmptyState v-else-if="bases.length === 0" message="Aún no tienes bases favoritas" />

        <BaseGrid v-else :bases="bases" @removed="(id) => (bases = bases.filter((b) => b.id !== id))">
          <template #actions="{ base, openDetails }">
            <div class="flex gap-2">
              <CopyBaseButton :link="base.link" />
              <IconButton :icon="IconHeartFill" tone="danger" @click="unfavorite(base.id)" />
              <IconButton :icon="IconMore" @click="openDetails" />
            </div>
          </template>
        </BaseGrid>
      </template>
    </AuthGate>
  </div>
</template>
