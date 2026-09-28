<script lang="ts">
import { ref, watch } from "vue";
import { user } from "@/lib/auth";

const avatars = Object.values(
  import.meta.glob<string>("../assets/images/avatars/*.webp", { eager: true, import: "default" })
);

function pickAvatar() {
  return avatars[Math.floor(Math.random() * avatars.length)];
}

const avatar = ref(pickAvatar());
watch(() => user.value?.id, (id, previousId) => {
  if (id && id !== previousId) avatar.value = pickAvatar();
});
</script>

<script setup lang="ts">
import { onClickOutside } from "@vueuse/core";
import IconSync from "~icons/ph/arrows-clockwise";
import IconLogOut from "~icons/ph/sign-out";
import { profile, isAdmin } from "@/lib/auth";
import { useNavigation } from "@/lib/navigation";

const { handleSignOut, isSigningOut } = useNavigation();

const isAccountOpen = ref(false);
const accountRef = ref<HTMLElement | null>(null);
onClickOutside(accountRef, () => (isAccountOpen.value = false));
</script>

<template>
  <div ref="accountRef" class="relative flex items-center">
    <button
      type="button"
      class="flex h-9 w-9 cursor-pointer items-center justify-center overflow-hidden rounded-full border border-muted-foreground/40 bg-secondary transition-colors hover:border-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      :aria-expanded="isAccountOpen"
      aria-label="Cuenta"
      @click="isAccountOpen = !isAccountOpen"
    >
      <img :src="avatar" alt="" class="h-full w-full object-cover" />
    </button>

    <div
      v-if="isAccountOpen"
      class="absolute right-0 top-[58px] lg:top-[54px] z-50 w-64 rounded-xl border border-border bg-chrome p-4 shadow-2xl shadow-black/50"
    >
      <div class="space-y-3">
        <div>
          <p class="text-[10px] uppercase tracking-wide text-muted-foreground">Nombre</p>
          <div class="flex items-center gap-2">
            <p class="truncate text-sm text-white">{{ profile?.full_name || 'Usuario' }}</p>
            <span v-if="isAdmin" class="shrink-0 rounded-md bg-yellow-400 px-2 py-0.5 text-[10px] text-black">Admin</span>
          </div>
        </div>
        <div>
          <p class="text-[10px] uppercase tracking-wide text-muted-foreground">Correo Electrónico</p>
          <p class="truncate text-sm text-white">{{ user?.email }}</p>
        </div>
      </div>

      <div class="my-3 border-t border-border"></div>

      <button
        type="button"
        class="flex w-full cursor-pointer items-center gap-2 rounded-lg px-2 py-2 text-xs text-red-500 transition-colors hover:bg-red-500/10 hover:text-red-400 disabled:cursor-not-allowed disabled:opacity-50"
        :disabled="isSigningOut"
        @click="handleSignOut"
      >
        <IconSync v-if="isSigningOut" class="h-4 w-4 shrink-0 animate-spin" />
        <IconLogOut v-else class="h-4 w-4 shrink-0" />
        <span>{{ isSigningOut ? 'Cerrando...' : 'Cerrar sesión' }}</span>
      </button>
    </div>
  </div>
</template>
