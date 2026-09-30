<script setup lang="ts">
defineProps<{
  title: string;
  sections: { title: string; body: string }[];
}>();
</script>

<template>
  <div class="space-y-page animate-in fade-in slide-in-from-bottom-2 duration-700 ease-out">
    <h1 class="text-[28px] text-yellow-400">{{ title }}</h1>
    <p class="text-xs text-muted-foreground">Última actualización: septiembre de 2026.</p>

    <div class="space-y-page">
      <section v-for="section in sections" :key="section.title" class="space-y-2">
        <h2 class="text-base text-white">{{ section.title }}</h2>
        <p class="font-body text-sm text-muted-foreground leading-relaxed">{{ section.body }}</p>
      </section>
    </div>
  </div>
</template>
