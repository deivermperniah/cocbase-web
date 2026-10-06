<script setup lang="ts">
import { onMounted, ref } from "vue";
import IconFunnel from "~icons/ph/funnel";
import IconMore from "~icons/ph/dots-three-bold";
import AppButton from "@/components/ui/AppButton.vue";
import BaseGrid from "@/components/bases/BaseGrid.vue";
import CopyBaseButton from "@/components/bases/CopyBaseButton.vue";
import CardSkeletonGrid from "@/components/ui/CardSkeletonGrid.vue";
import EmptyState from "@/components/ui/EmptyState.vue";
import FormSelect from "@/components/ui/FormSelect.vue";
import IconButton from "@/components/ui/IconButton.vue";
import Modal from "@/components/ui/Modal.vue";
import PageHeader from "@/components/ui/PageHeader.vue";
import { fetchApprovedBases, type Base } from "@/lib/bases";
import { BASE_LEVELS, BASE_TYPES } from "@/lib/constants";

const PAGE_SIZE = 12;

const props = defineProps<{ level: number | null }>();

const levelOptions = [{ value: "", label: "Todos" }, ...BASE_LEVELS.map((n) => ({ value: String(n), label: `Nivel ${n}` }))];
const typeOptions = [{ value: "", label: "Todos" }, ...BASE_TYPES.map((t) => ({ value: t, label: t }))];
const currentLevel = props.level ? String(props.level) : "";

const bases = ref<Base[]>([]);
const total = ref(0);
const loading = ref(true);
const loadingMore = ref(false);
const loadError = ref(false);
const selectedType = ref("");
const isFilterOpen = ref(false);
const draft = ref({ level: "", type: "" });

async function loadBases(reset: boolean) {
  if (reset) loading.value = true;
  else loadingMore.value = true;
  loadError.value = false;

  try {
    const from = reset ? 0 : bases.value.length;
    const result = await fetchApprovedBases({ level: props.level, type: selectedType.value || null }, from, PAGE_SIZE);
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

function openFilters() {
  draft.value = { level: currentLevel, type: selectedType.value };
  isFilterOpen.value = true;
}

function applyFilters(level: string, type: string) {
  isFilterOpen.value = false;
  if (level !== currentLevel) {
    window.location.href = level ? `/bases/th-${level}` : "/bases";
    return;
  }
  selectedType.value = type;
  loadBases(true);
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
    >
      <template #actions>
        <button
          type="button"
          class="flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border-2 shadow-xl transition-all active:scale-95"
          :class="
            level || selectedType
              ? 'border-primary bg-primary text-black'
              : 'border-border bg-secondary text-muted-foreground hover:border-primary hover:text-primary'
          "
          @click="openFilters"
        >
          <IconFunnel class="h-4 w-4" />
        </button>
      </template>
    </PageHeader>

    <CardSkeletonGrid v-if="loading" />

    <EmptyState v-else-if="loadError" message="No se pudieron cargar las bases" />

    <EmptyState
      v-else-if="bases.length === 0"
      :message="level || selectedType ? 'Sin bases para este filtro' : 'Sin bases'"
    />

    <template v-else>
      <BaseGrid :bases="bases">
        <template #actions="{ base, openDetails }">
          <div class="flex gap-2">
            <CopyBaseButton :link="base.link" />
            <IconButton :icon="IconMore" @click="openDetails" />
          </div>
        </template>
      </BaseGrid>

      <div v-if="bases.length < total" class="flex justify-center pt-6">
        <AppButton variant="outline" :loading="loadingMore" @click="loadBases(false)">Mostrar más</AppButton>
      </div>
    </template>

    <Modal :open="isFilterOpen" title="Filtro" size="lg" @close="isFilterOpen = false">
      <div class="grid grid-cols-2 gap-page">
        <FormSelect v-model="draft.level" label="Nivel" :options="levelOptions" />
        <FormSelect v-model="draft.type" label="Categoría" :options="typeOptions" />
      </div>
      <div class="flex gap-page">
        <AppButton variant="secondary" class="flex-1" @click="applyFilters('', '')">Limpiar</AppButton>
        <AppButton class="flex-1" @click="applyFilters(draft.level, draft.type)">Aplicar filtros</AppButton>
      </div>
    </Modal>
  </div>
</template>
