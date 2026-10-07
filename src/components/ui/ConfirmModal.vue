<script setup lang="ts">
import AppButton from "@/components/ui/AppButton.vue";
import Modal from "@/components/ui/Modal.vue";

withDefaults(
  defineProps<{ open: boolean; title: string; label?: string; detail?: string; confirmText?: string; loading?: boolean }>(),
  { confirmText: "Confirmar" },
);

const emit = defineEmits<{ close: []; confirm: [] }>();
</script>

<template>
  <Modal :open="open" :title="title" danger @close="!loading && emit('close')">
    <div v-if="detail" class="rounded-xl border border-border bg-secondary p-page">
      <p v-if="label" class="mb-1 text-xs text-muted-foreground">{{ label }}</p>
      <p class="truncate text-sm text-white">{{ detail }}</p>
    </div>

    <slot />

    <div class="flex gap-page">
      <AppButton variant="secondary" class="flex-1" :disabled="loading" @click="emit('close')">Cancelar</AppButton>
      <AppButton variant="danger" class="flex-1" :loading="loading" @click="emit('confirm')">{{ confirmText }}</AppButton>
    </div>
  </Modal>
</template>
