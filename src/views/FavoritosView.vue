<script setup lang="ts">
import { ref, onMounted } from "vue";
import { supabase } from "@/lib/supabase";
import { user } from "@/lib/auth";
import { toast } from "@/lib/toast";
import LoadingSpinner from "@/components/LoadingSpinner.vue";
import IconHeartFill from "~icons/ph/heart-fill";
import IconOpen from "~icons/ph/arrow-square-out";
import IconBusiness from "~icons/ph/buildings";
import IconSword from "~icons/ph/sword";
import IconTrophy from "~icons/ph/trophy";
import IconHammer from "~icons/ph/hammer";
import IconShield from "~icons/ph/shield";

interface FavBase {
  id: string;
  code: string;
  level_th: number;
  type: string;
  url_foto: string;
  link: string | null;
  created_at: string;
}

const bases = ref<FavBase[]>([]);
const loading = ref(true);

function getTypeIcon(type: string) {
  if (type === "Guerra") return IconSword;
  if (type === "Liga") return IconTrophy;
  if (type === "Mejora") return IconHammer;
  return IconShield;
}

async function fetchFavorites() {
  if (!user.value) return;

  const { data, error } = await supabase
    .from("favorites")
    .select("base_id, bases(id, code, level_th, type, url_foto, link, created_at)")
    .eq("user_id", user.value.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching favorites:", error);
    return;
  }

  bases.value = (data || [])
    .map((row: any) => row.bases)
    .filter((b: any) => b) as FavBase[];
}

async function removeFavorite(baseId: string) {
  if (!user.value) return;

  const { error } = await supabase
    .from("favorites")
    .delete()
    .eq("user_id", user.value.id)
    .eq("base_id", baseId);

  if (error) {
    toast.error("No se pudo quitar de favoritos.");
    return;
  }

  bases.value = bases.value.filter((b) => b.id !== baseId);
  toast.success("Eliminada de favoritos.");
}

onMounted(async () => {
  loading.value = true;
  await fetchFavorites();
  loading.value = false;
});
</script>

<template>
  <div v-if="loading" class="flex flex-col items-center justify-center min-h-[50vh]">
    <LoadingSpinner size="lg" />
  </div>

  <div v-else class="space-y-[15px] animate-in fade-in slide-in-from-bottom-2 duration-700 ease-out">
    <div class="flex items-center justify-between">
      <h2 class="text-[28px] text-yellow-400">Favoritos</h2>
    </div>

    <div v-if="bases.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[15px]">
      <div
        v-for="base in bases"
        :key="base.id"
        class="group relative overflow-hidden bg-card shadow-2xl transition-all rounded-xl"
      >
        <div class="aspect-video relative overflow-hidden bg-secondary">
          <img :src="base.url_foto" class="block w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" loading="lazy" />
          <div class="pointer-events-none absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-60"></div>

          <div class="pointer-events-none absolute bottom-4 left-4 z-20 flex items-center gap-2">
            <span class="flex h-6 items-center gap-2 rounded-md bg-yellow-400 px-3 text-xs text-black shadow-lg">
              <IconBusiness class="h-3.5 w-3.5" />
              {{ base.level_th }}
            </span>
            <span class="flex h-6 items-center gap-2 rounded-md bg-yellow-400 px-3 text-xs text-black shadow-lg">
              <component :is="getTypeIcon(base.type)" class="h-3.5 w-3.5" />
              {{ base.type }}
            </span>
          </div>
        </div>

        <div class="p-[15px]">
          <div class="flex items-center justify-between">
            <h3 class="text-sm text-white group-hover:text-yellow-400 transition-colors leading-none truncate flex-1">
              {{ base.code }}
            </h3>

            <div class="flex gap-2">
              <a
                v-if="base.link"
                :href="base.link"
                target="_blank"
                class="cursor-pointer p-2.5 rounded-lg bg-secondary text-muted-foreground hover:bg-yellow-400/10 hover:text-yellow-400 transition-all border border-border"
              >
                <IconOpen class="w-4 h-4" />
              </a>
              <button
                @click="removeFavorite(base.id)"
                class="cursor-pointer p-2.5 rounded-lg bg-secondary text-red-500 hover:bg-red-600 hover:text-white transition-all border border-border"
                title="Quitar de favoritos"
              >
                <IconHeartFill class="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="text-center">
      <p class="text-muted-foreground text-sm">Aún no tienes bases favoritas</p>
    </div>
  </div>
</template>
