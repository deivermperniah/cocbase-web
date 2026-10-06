<script setup lang="ts">
import { onMounted, ref } from "vue";
import AppButton from "@/components/ui/AppButton.vue";
import BaseCard from "@/components/bases/BaseCard.vue";
import CopyBaseButton from "@/components/bases/CopyBaseButton.vue";
import CardSkeletonGrid from "@/components/ui/CardSkeletonGrid.vue";
import EmptyState from "@/components/ui/EmptyState.vue";
import PageHeader from "@/components/ui/PageHeader.vue";
import { fetchApprovedBases, type Base } from "@/lib/bases";

const PAGE_SIZE = 12;

const props = defineProps<{ level: number | null }>();

const bases = ref<Base[]>([]);
const total = ref(0);
const loading = ref(true);
const loadingMore = ref(false);
const loadError = ref(false);

async function loadBases(reset: boolean) {
  if (reset) loading.value = true;
  else loadingMore.value = true;
  loadError.value = false;

  try {
    const from = reset ? 0 : bases.value.length;
    const result = await fetchApprovedBases({ level: props.level, type: null }, from, PAGE_SIZE);
    bases.value = reset ? result.bases : bases.value.concat(result.bases);
    total.value = result.total;
  } catch (error) {
    console.error("Error fetching bases:", error);
    loadError.value = true;
  } finally {
    loading.value = false;
    loadingMore.value = false;
  }
}

onMounted(() => loadBases(true));
</script>

<template>
  <div class="space-y-page">
    <PageHeader
      :title="level ? `Bases para Ayuntamiento ${level}` : 'Bases de Clash of Clans'"
      :subtitle="
        level
          ? `Bases de guerra, liga, competitivo y mejora para TH${level}, listas para copiar en el juego.`
          : 'Bases de guerra, liga, competitivo y mejora para todos los niveles de ayuntamiento.'
      "
    />

    <CardSkeletonGrid v-if="loading" />

    <EmptyState v-else-if="loadError" message="No se pudieron cargar las bases" />

    <EmptyState v-else-if="bases.length === 0" message="Sin bases" />

    <template v-else>
      <div class="card-grid">
        <BaseCard v-for="base in bases" :key="base.id" :base="base">
          <div class="flex gap-2">
            <CopyBaseButton :link="base.link" />
          </div>
        </BaseCard>
      </div>

      <div v-if="bases.length < total" class="flex justify-center pt-6">
        <AppButton variant="outline" :loading="loadingMore" @click="loadBases(false)">Mostrar más</AppButton>
      </div>
    </template>
  </div>
</template>
