<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { supabase } from '@/lib/supabase'
import { Card, CardContent } from '@/components/ui/card'
import {
    Sword,
    Trophy,
    Hammer,
    Shield,
    ChevronRight
} from 'lucide-vue-next'
import LoadingSpinner from '@/components/LoadingSpinner.vue'

const totalBases = ref(0)
const warBases = ref(0)
const leagueBases = ref(0)
const upgradeBases = ref(0)
const resourceBases = ref(0)
const loading = ref(true)

async function fetchStats() {
    loading.value = true
    try {
        const { count: basesCount } = await supabase
            .from('bases')
            .select('*', { count: 'exact', head: true })
        totalBases.value = basesCount || 0

        const types = ['Guerra', 'Liga', 'Mejora', 'Recursos']
        const counts = await Promise.all(types.map(type =>
            supabase.from('bases').select('*', { count: 'exact', head: true }).eq('type', type)
        ))

        warBases.value = counts[0]?.count || 0
        leagueBases.value = counts[1]?.count || 0
        upgradeBases.value = counts[2]?.count || 0
        resourceBases.value = counts[3]?.count || 0

    } catch (error) {
        console.error('Error fetching stats:', error)
    } finally {
        loading.value = false
    }
}

onMounted(() => fetchStats())
</script>

<template>
    <!-- Loading State Centralizado -->
    <div v-if="loading" class="flex items-center justify-center min-h-screen">
      <LoadingSpinner size="lg" />
    </div>

    <div v-else class="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">

        <!-- Header Actions -->
        <div class="flex items-center justify-between">
            <h2 class="text-3xl font-black italic tracking-tighter uppercase text-zinc-950 dark:text-white">
                Dashboard
            </h2>
            <router-link to="/bases"
                class="group flex items-center gap-3 px-8 h-[52px] rounded-full bg-zinc-950 border-2 border-yellow-500 text-yellow-500 font-black uppercase tracking-[0.15em] text-[11px] hover:bg-yellow-500 hover:text-zinc-950 transition-all duration-300 shadow-xl shadow-yellow-500/10 active:scale-95">
                <span>Ver Bases</span>
                <ChevronRight class="h-4 w-4 stroke-[3px] group-hover:translate-x-1 transition-transform" />
            </router-link>
        </div>

        <!-- Hero Row: Total Bases (2/3) + Guerra (1/3) -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <!-- Total Bases (2/3) -->
            <div class="lg:col-span-2">
                <div
                    class="h-full flex flex-col items-center justify-center text-center p-12 rounded-[2.5rem] bg-gradient-to-br from-yellow-400 via-yellow-500 to-yellow-600 shadow-2xl relative overflow-hidden ring-1 ring-black/5 group">
                    <div class="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity">
                    </div>
                    <div class="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/20 blur-3xl"></div>
                    <div class="absolute -left-20 -bottom-20 h-64 w-64 rounded-full bg-black/5 blur-3xl"></div>
                    <div class="relative z-10 space-y-0">
                        <h1
                            class="text-8xl md:text-[10rem] font-black italic tracking-tighter text-zinc-950 leading-none">
                            {{ totalBases }}
                        </h1>
                        <p class="text-zinc-950/60 font-bold uppercase tracking-[0.4em] text-xs">Bases Totales</p>
                    </div>
                </div>
            </div>

            <!-- Guerra (1/3) -->
            <div class="lg:col-span-1">
                <Card
                    class="h-full group relative overflow-hidden border-none bg-zinc-950 shadow-xl transition-all p-1 rounded-[2.5rem]">
                    <div
                        class="absolute right-0 top-0 h-32 w-32 bg-yellow-500/5 rounded-bl-[4rem] translate-x-12 -translate-y-12 transition-transform group-hover:scale-110">
                    </div>
                    <CardContent class="h-full p-8 relative flex flex-col justify-center gap-6">
                        <div
                            class="h-16 w-16 rounded-[1.2rem] bg-yellow-500/10 flex items-center justify-center group-hover:bg-yellow-500 transition-all duration-500 shadow-lg shadow-yellow-500/10">
                            <Sword class="h-8 w-8 text-yellow-500 group-hover:text-zinc-950 transition-colors" />
                        </div>
                        <div class="space-y-0">
                            <h3 class="text-2xl font-bold tracking-tight text-white">Guerra</h3>
                            <div class="text-6xl font-black italic tracking-tighter mt-1 text-yellow-500">{{ warBases }}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>

        <!-- Bottom Row: Other 3 (Liga, Mejora, Recursos) with Yellow & Black Contrast -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <!-- Liga Card -->
            <Card
                class="group relative overflow-hidden border-none bg-zinc-950 shadow-xl transition-all p-1 rounded-[2.5rem]">
                <div
                    class="absolute right-0 top-0 h-32 w-32 bg-yellow-500/5 rounded-bl-[4rem] translate-x-12 -translate-y-12 transition-transform group-hover:scale-110">
                </div>
                <CardContent class="p-8 relative flex flex-col gap-6">
                    <div
                        class="h-16 w-16 rounded-[1.2rem] bg-yellow-500/10 flex items-center justify-center group-hover:bg-yellow-500 transition-all duration-500 shadow-lg shadow-yellow-500/10">
                        <Trophy class="h-8 w-8 text-yellow-500 group-hover:text-zinc-950 transition-colors" />
                    </div>
                    <div class="space-y-0 text-white">
                        <h3 class="text-2xl font-bold tracking-tight">Liga</h3>
                        <div class="text-5xl font-black italic tracking-tighter mt-1 text-yellow-500">{{ leagueBases }}
                        </div>
                    </div>
                </CardContent>
            </Card>

            <!-- Mejora Card -->
            <Card
                class="group relative overflow-hidden border-none bg-zinc-950 shadow-xl transition-all p-1 rounded-[2.5rem]">
                <div
                    class="absolute right-0 top-0 h-32 w-32 bg-yellow-500/5 rounded-bl-[4rem] translate-x-12 -translate-y-12 transition-transform group-hover:scale-110">
                </div>
                <CardContent class="p-8 relative flex flex-col gap-6">
                    <div
                        class="h-16 w-16 rounded-[1.2rem] bg-yellow-500/10 flex items-center justify-center group-hover:bg-yellow-500 transition-all duration-500 shadow-lg shadow-yellow-500/10">
                        <Hammer class="h-8 w-8 text-yellow-500 group-hover:text-zinc-950 transition-colors" />
                    </div>
                    <div class="space-y-0 text-white">
                        <h3 class="text-2xl font-bold tracking-tight">Mejora</h3>
                        <div class="text-5xl font-black italic tracking-tighter mt-1 text-yellow-500">{{ upgradeBases }}
                        </div>
                    </div>
                </CardContent>
            </Card>

            <!-- Recursos Card -->
            <Card
                class="group relative overflow-hidden border-none bg-zinc-950 shadow-xl transition-all p-1 rounded-[2.5rem]">
                <div
                    class="absolute right-0 top-0 h-32 w-32 bg-yellow-500/5 rounded-bl-[4rem] translate-x-12 -translate-y-12 transition-transform group-hover:scale-110">
                </div>
                <CardContent class="p-8 relative flex flex-col gap-6">
                    <div
                        class="h-16 w-16 rounded-[1.2rem] bg-yellow-500/10 flex items-center justify-center group-hover:bg-yellow-500 transition-all duration-500 shadow-lg shadow-yellow-500/10">
                        <Shield class="h-8 w-8 text-yellow-500 group-hover:text-zinc-950 transition-colors" />
                    </div>
                    <div class="space-y-0 text-white">
                        <h3 class="text-2xl font-bold tracking-tight">Recursos</h3>
                        <div class="text-5xl font-black italic tracking-tighter mt-1 text-yellow-500">{{ resourceBases}}
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    </div>
</template>

<style scoped></style>
