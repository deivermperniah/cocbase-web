<script setup lang="ts">
import { ref } from "vue";
import IconLogOut from "~icons/ph/sign-out";
import IconUser from "~icons/ph/user";
import AppButton from "@/components/ui/AppButton.vue";
import Badge from "@/components/ui/Badge.vue";
import { isAdmin, profile, signOut, user } from "@/lib/auth";

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
      class="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-muted-foreground/40 bg-secondary text-muted-foreground hover:border-primary hover:text-primary"
      @click="isOpen = !isOpen"
    >
      <IconUser class="h-5 w-5" />
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
          <AppButton variant="danger" :icon="IconLogOut" :loading="isSigningOut" class="w-full" @click="handleSignOut">
            Cerrar sesión
          </AppButton>
        </div>
      </div>
    </template>
  </div>
</template>
