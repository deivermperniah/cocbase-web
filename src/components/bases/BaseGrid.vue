<script setup lang="ts">
import { ref } from "vue";
import BaseCard from "@/components/bases/BaseCard.vue";
import BaseDetailsModal from "@/components/bases/BaseDetailsModal.vue";
import ImageViewer from "@/components/bases/ImageViewer.vue";
import type { Base } from "@/lib/bases";

defineProps<{ bases: Base[] }>();
defineSlots<{ actions(props: { base: Base; openDetails: () => void }): unknown }>();

const viewerUrl = ref<string | null>(null);
const detailsBase = ref<Base | null>(null);
</script>

<template>
  <div class="card-grid">
    <BaseCard v-for="base in bases" :key="base.id" :base="base" @open-image="viewerUrl = base.url_foto">
      <slot name="actions" :base="base" :open-details="() => (detailsBase = base)" />
    </BaseCard>
  </div>

  <BaseDetailsModal :base="detailsBase" @close="detailsBase = null" />
  <ImageViewer :url="viewerUrl" @close="viewerUrl = null" />
</template>
