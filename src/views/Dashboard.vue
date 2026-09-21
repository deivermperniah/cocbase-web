<script setup lang="ts">
import { ref, onMounted } from "vue";
import { supabase } from "@/lib/supabase";
import { Card, CardContent } from "@/components/ui/card";
import { Sword, Trophy, Hammer, Shield, Layers } from "lucide-vue-next";
import LoadingSpinner from "@/components/LoadingSpinner.vue";

const totalBases = ref(0);
const warBases = ref(0);
const leagueBases = ref(0);
const upgradeBases = ref(0);
const resourceBases = ref(0);
const loading = ref(true);

async function fetchStats() {
  try {
    const { count: basesCount } = await supabase
      .from("bases")
      .select("*", { count: "exact", head: true });
    totalBases.value = basesCount || 0;

    const types = ["Guerra", "Liga", "Mejora", "Recursos"];
    const counts = await Promise.all(
      types.map((type) =>
        supabase
          .from("bases")
          .select("*", { count: "exact", head: true })
          .eq("type", type)
      )
    );

    warBases.value = counts[0]?.count || 0;
    leagueBases.value = counts[1]?.count || 0;
    upgradeBases.value = counts[2]?.count || 0;
    resourceBases.value = counts[3]?.count || 0;
  } catch (error) {
    console.error("Error fetching stats:", error);
  } finally {
    loading.value = false;
  }
}

onMounted(() => fetchStats());
</script>

<template>
  <div v-if="loading" class="flex flex-col items-center justify-center min-h-[50vh]">
    <LoadingSpinner size="lg" />
  </div>

  <div v-else class="space-y-[15px] animate-in fade-in slide-in-from-bottom-2 duration-700 ease-out">
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-[15px]">
      <h2 class="text-[28px] text-yellow-400">
        Dashboard
      </h2>
      <router-link
        to="/bases"
        class="hidden sm:flex cursor-pointer items-center gap-3 px-[15px] h-[36px] sm:h-[44px] rounded-full bg-card border-2 border-yellow-400 text-yellow-400 text-xs sm:text-xs hover:bg-yellow-400 hover:text-black transition-all duration-300 shadow-xl shadow-yellow-400/10 active:scale-95"
      >
        <Layers class="h-3 w-3 sm:h-4 sm:w-4 stroke-[3px]" />
        <span class="text-xs sm:text-xs">Ver Bases</span>
      </router-link>
    </div>

    <!-- Hero Section -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-[15px] mb-[15px]">
      <div class="lg:col-span-2">
        <div class="h-[200px] flex flex-col items-center justify-center text-center p-3 rounded-xl bg-gradient-to-br from-yellow-300 via-yellow-400 to-yellow-500 shadow-2xl relative overflow-hidden ring-1 ring-black/5 group">
          <div class="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div class="absolute -right-10 -top-10 sm:-right-20 sm:-top-20 h-32 w-32 sm:h-64 sm:w-64 rounded-full bg-white/20 blur-2xl sm:blur-3xl"></div>
          <div class="absolute -left-10 -bottom-10 sm:-left-20 sm:-bottom-20 h-32 w-32 sm:h-64 sm:w-64 rounded-full bg-black/5 blur-2xl sm:blur-3xl"></div>
          <div class="relative z-10 space-y-0">
            <h1 class="text-5xl text-black leading-none">
              {{ totalBases }}
            </h1>
            <p class="text-black/60 text-xs">
              Bases Totales
            </p>
          </div>
        </div>
      </div>

      <div class="hidden lg:block lg:col-span-1">
        <Card class="h-[200px] group relative overflow-hidden border-none bg-card shadow-xl transition-all p-1 rounded-xl">
          <div class="absolute right-0 top-0 h-24 w-24 sm:h-32 sm:w-32 bg-yellow-400/5 rounded-bl-[3rem] sm:rounded-bl-[4rem] translate-x-8 sm:translate-x-12 -translate-y-8 sm:-translate-y-12 transition-transform group-hover:scale-110"></div>
          <CardContent class="h-full p-3 relative flex flex-col justify-center gap-[15px]">
            <div class="h-12 w-12 rounded-xl bg-yellow-400/10 flex items-center justify-center group-hover:bg-yellow-400 transition-all duration-500 shadow-lg shadow-yellow-400/10">
              <Sword class="h-5 w-5 text-yellow-400 group-hover:text-black transition-colors" />
            </div>
            <div class="space-y-0">
              <h3 class="text-base text-white">Guerra</h3>
              <div class="text-[28px] mt-1 text-yellow-400">
                {{ warBases }}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>

    <!-- Stats Grid -->
    <div class="grid grid-cols-2 lg:grid-cols-3 gap-[15px]">
      <Card class="block lg:hidden group relative overflow-hidden border-none bg-card shadow-xl transition-all p-1 rounded-xl h-[200px]">
        <div class="absolute right-0 top-0 h-24 w-24 sm:h-32 sm:w-32 bg-yellow-400/5 rounded-bl-[3rem] sm:rounded-bl-[4rem] translate-x-8 sm:translate-x-12 -translate-y-8 sm:-translate-y-12 transition-transform group-hover:scale-110"></div>
        <CardContent class="h-full p-3 relative flex flex-col justify-center gap-[15px]">
          <div class="h-12 w-12 rounded-xl bg-yellow-400/10 flex items-center justify-center group-hover:bg-yellow-400 transition-all duration-500 shadow-lg shadow-yellow-400/10">
            <Sword class="h-5 w-5 text-yellow-400 group-hover:text-black transition-colors" />
          </div>
          <div class="space-y-0 text-white">
            <h3 class="text-base ">Guerra</h3>
            <div class="text-[28px] mt-1 text-yellow-400">
              {{ warBases }}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card class="group relative overflow-hidden border-none bg-card shadow-xl transition-all p-1 rounded-xl h-[200px]">
        <div class="absolute right-0 top-0 h-24 w-24 sm:h-32 sm:w-32 bg-yellow-400/5 rounded-bl-[3rem] sm:rounded-bl-[4rem] translate-x-8 sm:translate-x-12 -translate-y-8 sm:-translate-y-12 transition-transform group-hover:scale-110"></div>
        <CardContent class="h-full p-3 relative flex flex-col justify-center gap-[15px]">
          <div class="h-12 w-12 rounded-xl bg-yellow-400/10 flex items-center justify-center group-hover:bg-yellow-400 transition-all duration-500 shadow-lg shadow-yellow-400/10">
            <Trophy class="h-5 w-5 text-yellow-400 group-hover:text-black transition-colors" />
          </div>
          <div class="space-y-0 text-white">
            <h3 class="text-base ">Liga</h3>
            <div class="text-[28px] mt-1 text-yellow-400">
              {{ leagueBases }}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card class="group relative overflow-hidden border-none bg-card shadow-xl transition-all p-1 rounded-xl h-[200px]">
        <div class="absolute right-0 top-0 h-24 w-24 sm:h-32 sm:w-32 bg-yellow-400/5 rounded-bl-[3rem] sm:rounded-bl-[4rem] translate-x-8 sm:translate-x-12 -translate-y-8 sm:-translate-y-12 transition-transform group-hover:scale-110"></div>
        <CardContent class="h-full p-3 relative flex flex-col justify-center gap-[15px]">
          <div class="h-12 w-12 rounded-xl bg-yellow-400/10 flex items-center justify-center group-hover:bg-yellow-400 transition-all duration-500 shadow-lg shadow-yellow-400/10">
            <Hammer class="h-5 w-5 text-yellow-400 group-hover:text-black transition-colors" />
          </div>
          <div class="space-y-0 text-white">
            <h3 class="text-base ">Mejora</h3>
            <div class="text-[28px] mt-1 text-yellow-400">
              {{ upgradeBases }}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card class="group relative overflow-hidden border-none bg-card shadow-xl transition-all p-1 rounded-xl h-[200px]">
        <div class="absolute right-0 top-0 h-24 w-24 sm:h-32 sm:w-32 bg-yellow-400/5 rounded-bl-[3rem] sm:rounded-bl-[4rem] translate-x-8 sm:translate-x-12 -translate-y-8 sm:-translate-y-12 transition-transform group-hover:scale-110"></div>
        <CardContent class="h-full p-3 relative flex flex-col justify-center gap-[15px]">
          <div class="h-12 w-12 rounded-xl bg-yellow-400/10 flex items-center justify-center group-hover:bg-yellow-400 transition-all duration-500 shadow-lg shadow-yellow-400/10">
            <Shield class="h-5 w-5 text-yellow-400 group-hover:text-black transition-colors" />
          </div>
          <div class="space-y-0 text-white">
            <h3 class="text-base ">Recursos</h3>
            <div class="text-[28px] mt-1 text-yellow-400">
              {{ resourceBases }}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
</template>
