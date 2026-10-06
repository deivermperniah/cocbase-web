<script setup lang="ts">
import { ref } from "vue";
import BaseCard from "@/components/bases/BaseCard.vue";
import ImageViewer from "@/components/bases/ImageViewer.vue";
import type { Base } from "@/lib/bases";

defineProps<{ bases: Base[] }>();
defineSlots<{ actions(props: { base: Base }): unknown }>();

const viewerUrl = ref<string | null>(null);
</script>

<template>
  <div class="card-grid">
    <BaseCard v-for="base in bases" :key="base.id" :base="base" @open-image="viewerUrl = base.url_foto">
      <slot name="actions" :base="base" />
    </BaseCard>
  </div>

  <ImageViewer :url="viewerUrl" @close="viewerUrl = null" />
</template>
