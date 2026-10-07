<script setup lang="ts">
import IconInfo from "~icons/ph/info";
import AuthGate from "@/components/auth/AuthGate.vue";
import BaseForm from "@/components/bases/BaseForm.vue";
import PageHeader from "@/components/ui/PageHeader.vue";
</script>

<template>
  <AuthGate access="user">
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
          <BaseForm />
        </section>
      </div>
    </div>
  </AuthGate>
</template>
