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
    <div v-if="loading" class="fixed inset-0 z-[100] flex items-center justify-center bg-zinc-950/80 backdrop-blur-sm md:pl-20">
      <LoadingSpinner size="lg" />
    </div>

    <div v-else class="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700">

        <!-- Header Actions -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h2 class="text-xl font-black italic tracking-tighter uppercase text-zinc-950 dark:text-white">
                Dashboard
            </h2>
            <router-link to="/bases"
                class="hidden sm:flex items-center gap-3 px-4 h-[36px] sm:h-[44px] rounded-full bg-zinc-950 border-2 border-yellow-500 text-yellow-500 font-black uppercase tracking-[0.15em] text-[8px] sm:text-[10px] hover:bg-yellow-500 hover:text-zinc-950 transition-all duration-300 shadow-xl shadow-yellow-500/10 active:scale-95">
                <span class="text-[10px] sm:text-xs">Ver Bases</span>
                <ChevronRight class="h-3 w-3 sm:h-4 sm:w-4 stroke-[3px] group-hover:translate-x-1 transition-transform" />
            </router-link>
        </div>

        <!-- Hero Row: Total Bases (Full width en tablets) -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
            <!-- Total Bases (Full width en tablets, 2/3 en desktop) -->
            <div class="lg:col-span-2">
                <div
                    class="h-[200px] flex flex-col items-center justify-center text-center p-3 rounded-[2.5rem] bg-gradient-to-br from-yellow-400 via-yellow-500 to-yellow-600 shadow-2xl relative overflow-hidden ring-1 ring-black/5 group">
                    <div class="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity">
                    </div>
                    <div class="absolute -right-10 -top-10 sm:-right-20 sm:-top-20 h-32 w-32 sm:h-64 sm:w-64 rounded-full bg-white/20 blur-2xl sm:blur-3xl"></div>
                    <div class="absolute -left-10 -bottom-10 sm:-left-20 sm:-bottom-20 h-32 w-32 sm:h-64 sm:w-64 rounded-full bg-black/5 blur-2xl sm:blur-3xl"></div>
                    <div class="relative z-10 space-y-0">
                        <h1
                            class="text-5xl font-black italic tracking-tighter text-zinc-950 leading-none">
                            {{ totalBases }}
                        </h1>
                        <p class="text-zinc-950/60 font-bold uppercase tracking-[0.2em] text-[10px]">Bases Totales</p>
                    </div>
                </div>
            </div>

            <!-- Guerra (Oculta en tablets, visible en desktop) -->
            <div class="hidden lg:block lg:col-span-1">
                <Card
                    class="h-[200px] group relative overflow-hidden border-none bg-zinc-950 shadow-xl transition-all p-1 rounded-[2.5rem]">
                    <div
                        class="absolute right-0 top-0 h-24 w-24 sm:h-32 sm:w-32 bg-yellow-500/5 rounded-bl-[3rem] sm:rounded-bl-[4rem] translate-x-8 sm:translate-x-12 -translate-y-8 sm:-translate-y-12 transition-transform group-hover:scale-110">
                    </div>
                    <CardContent class="h-full p-3 relative flex flex-col justify-center gap-4">
                        <div
                            class="h-12 w-12 rounded-[1.2rem] bg-yellow-500/10 flex items-center justify-center group-hover:bg-yellow-500 transition-all duration-500 shadow-lg shadow-yellow-500/10">
                            <Sword class="h-5 w-5 text-yellow-500 group-hover:text-zinc-950 transition-colors" />
                        </div>
                        <div class="space-y-0">
                            <h3 class="text-lg font-bold tracking-tight text-white">Guerra</h3>
                            <div class="text-3xl font-black italic tracking-tighter mt-1 text-yellow-500">{{ warBases }}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>

        <!-- Bottom Row: Guerra + Liga + Mejora + Recursos (2 por línea en tablets) -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <!-- Guerra (Visible solo en tablets, oculta en desktop) -->
            <Card
                class="sm:block hidden lg:hidden group relative overflow-hidden border-none bg-zinc-950 shadow-xl transition-all p-1 rounded-[2.5rem] h-[200px]">
                <div
                    class="absolute right-0 top-0 h-24 w-24 sm:h-32 sm:w-32 bg-yellow-500/5 rounded-bl-[3rem] sm:rounded-bl-[4rem] translate-x-8 sm:translate-x-12 -translate-y-8 sm:-translate-y-12 transition-transform group-hover:scale-110">
                </div>
                <CardContent class="h-full p-3 relative flex flex-col justify-center gap-4">
                    <div
                        class="h-12 w-12 rounded-[1.2rem] bg-yellow-500/10 flex items-center justify-center group-hover:bg-yellow-500 transition-all duration-500 shadow-lg shadow-yellow-500/10">
                        <Sword class="h-5 w-5 text-yellow-500 group-hover:text-zinc-950 transition-colors" />
                    </div>
                    <div class="space-y-0 text-white">
                        <h3 class="text-lg font-bold tracking-tight">Guerra</h3>
                        <div class="text-3xl font-black italic tracking-tighter mt-1 text-yellow-500">{{ warBases }}
                        </div>
                    </div>
                </CardContent>
            </Card>
            <!-- Liga Card -->
            <Card
                class="group relative overflow-hidden border-none bg-zinc-950 shadow-xl transition-all p-1 rounded-[2.5rem] h-[200px]">
                <div
                    class="absolute right-0 top-0 h-24 w-24 sm:h-32 sm:w-32 bg-yellow-500/5 rounded-bl-[3rem] sm:rounded-bl-[4rem] translate-x-8 sm:translate-x-12 -translate-y-8 sm:-translate-y-12 transition-transform group-hover:scale-110">
                </div>
                <CardContent class="h-full p-3 relative flex flex-col justify-center gap-4">
                    <div
                        class="h-12 w-12 rounded-[1.2rem] bg-yellow-500/10 flex items-center justify-center group-hover:bg-yellow-500 transition-all duration-500 shadow-lg shadow-yellow-500/10">
                        <Trophy class="h-5 w-5 text-yellow-500 group-hover:text-zinc-950 transition-colors" />
                    </div>
                    <div class="space-y-0 text-white">
                        <h3 class="text-lg font-bold tracking-tight">Liga</h3>
                        <div class="text-3xl font-black italic tracking-tighter mt-1 text-yellow-500">{{ leagueBases }}
                        </div>
                    </div>
                </CardContent>
            </Card>

            <!-- Mejora Card -->
            <Card
                class="group relative overflow-hidden border-none bg-zinc-950 shadow-xl transition-all p-1 rounded-[2.5rem] h-[200px]">
                <div
                    class="absolute right-0 top-0 h-24 w-24 sm:h-32 sm:w-32 bg-yellow-500/5 rounded-bl-[3rem] sm:rounded-bl-[4rem] translate-x-8 sm:translate-x-12 -translate-y-8 sm:-translate-y-12 transition-transform group-hover:scale-110">
                </div>
                <CardContent class="h-full p-3 relative flex flex-col justify-center gap-4">
                    <div
                        class="h-12 w-12 rounded-[1.2rem] bg-yellow-500/10 flex items-center justify-center group-hover:bg-yellow-500 transition-all duration-500 shadow-lg shadow-yellow-500/10">
                        <Hammer class="h-5 w-5 text-yellow-500 group-hover:text-zinc-950 transition-colors" />
                    </div>
                    <div class="space-y-0 text-white">
                        <h3 class="text-lg font-bold tracking-tight">Mejora</h3>
                        <div class="text-3xl font-black italic tracking-tighter mt-1 text-yellow-500">{{ upgradeBases }}
                        </div>
                    </div>
                </CardContent>
            </Card>

            <!-- Recursos Card -->
            <Card
                class="group relative overflow-hidden border-none bg-zinc-950 shadow-xl transition-all p-1 rounded-[2.5rem] h-[200px]">
                <div
                    class="absolute right-0 top-0 h-24 w-24 sm:h-32 sm:w-32 bg-yellow-500/5 rounded-bl-[3rem] sm:rounded-bl-[4rem] translate-x-8 sm:translate-x-12 -translate-y-8 sm:-translate-y-12 transition-transform group-hover:scale-110">
                </div>
                <CardContent class="h-full p-3 relative flex flex-col justify-center gap-4">
                    <div
                        class="h-12 w-12 rounded-[1.2rem] bg-yellow-500/10 flex items-center justify-center group-hover:bg-yellow-500 transition-all duration-500 shadow-lg shadow-yellow-500/10">
                        <Shield class="h-5 w-5 text-yellow-500 group-hover:text-zinc-950 transition-colors" />
                    </div>
                    <div class="space-y-0 text-white">
                        <h3 class="text-lg font-bold tracking-tight">Recursos</h3>
                        <div class="text-3xl font-black italic tracking-tighter mt-1 text-yellow-500">{{ resourceBases}}
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    </div>
</template>

<style scoped></style>
