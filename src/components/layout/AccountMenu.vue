<script setup lang="ts">
import { ref } from "vue";
import IconLogOut from "~icons/ph/sign-out";
import AppButton from "@/components/ui/AppButton.vue";
import Badge from "@/components/ui/Badge.vue";
import { isAdmin, profile, signOut, user } from "@/lib/auth";

const avatars = Object.values(
  import.meta.glob<{ src: string }>("@/assets/images/avatars/*.webp", { eager: true, import: "default" }),
);
const avatar = avatars[Math.floor(Math.random() * avatars.length)]?.src;

const isOpen = ref(false);
const isSigningOut = ref(false);

async function handleSignOut() {
  isSigningOut.value = true;
  await signOut();
  window.location.href = "/";
}
</script>

<template>
  <div class="relative flex items-center">
    <button
      type="button"
      class="h-9 w-9 cursor-pointer overflow-hidden rounded-full border border-muted-foreground/40 bg-secondary hover:border-muted-foreground"
      @click="isOpen = !isOpen"
    >
      <img :src="avatar" alt="" width="36" height="36" class="h-full w-full object-cover" />
    </button>

    <template v-if="isOpen">
      <div class="fixed inset-0 z-40" @click="isOpen = false"></div>
      <div
        class="absolute right-0 top-[54px] z-50 w-64 space-y-3 rounded-xl border border-border bg-chrome p-4 shadow-2xl shadow-black/50"
      >
        <div>
          <p class="text-[11px] uppercase tracking-wide text-muted-foreground">Nombre</p>
          <div class="flex items-center gap-2">
            <p class="truncate text-sm text-white">{{ profile?.full_name || "Usuario" }}</p>
            <Badge v-if="isAdmin">Admin</Badge>
          </div>
        </div>
        <div>
          <p class="text-[11px] uppercase tracking-wide text-muted-foreground">Correo electrónico</p>
          <p class="truncate text-sm text-white">{{ user?.email }}</p>
        </div>
        <div class="border-t border-border pt-3">
          <AppButton variant="secondary" :icon="IconLogOut" :loading="isSigningOut" class="w-full" @click="handleSignOut">
            Cerrar sesión
          </AppButton>
        </div>
      </div>
    </template>
  </div>
</template>
