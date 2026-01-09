<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { supabase } from '@/lib/supabase'
import { Plus, ExternalLink, Trash2, LayoutGrid, List as ListIcon } from 'lucide-vue-next'
import BaseForm from '@/components/BaseForm.vue'
import LoadingSpinner from '@/components/LoadingSpinner.vue'

const bases = ref<any[]>([])
const loading = ref(true)
const isModalOpen = ref(false)
const viewMode = ref<'grid' | 'list'>('grid')

async function fetchBases() {
    loading.value = true
    try {
        const { data, error } = await supabase
            .from('bases')
            .select('*')
            .order('created_at', { ascending: false })

        if (error) throw error
        bases.value = data || []
    } catch (error) {
        console.error('Error fetching bases:', error)
    } finally {
        loading.value = false
    }
}

async function deleteBase(id: number) {
    if (!confirm('¿Estás seguro de que quieres eliminar esta base?')) return

    try {
        const { error } = await supabase.from('bases').delete().eq('id', id)
        if (error) throw error
        bases.value = bases.value.filter(b => b.id !== id)
    } catch (error) {
        console.error('Error deleting base:', error)
    }
}

function handleSuccess() {
    isModalOpen.value = false
    fetchBases()
}

onMounted(() => {
    fetchBases()
})
</script>

<template>
    <!-- Loading State Centralizado -->
    <div v-if="loading" class="fixed inset-0 z-[100] flex items-center justify-center bg-zinc-950/80 backdrop-blur-sm md:pl-20">
      <LoadingSpinner size="lg" />
    </div>

    <div v-else class="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <!-- Premium Header -->
        <div class="flex flex-row items-center justify-between gap-4 mb-4">
            <!-- Título -->
            <div class="space-y-1">
                <h2 class="text-xl font-black italic tracking-tighter uppercase text-zinc-950 dark:text-white">
                    Bases
                </h2>
            </div>

            <!-- Botones -->
            <div class="flex flex-row items-center gap-4">
                <!-- View Toggle -->
                <div class="order-1">
                    <div class="bg-zinc-950 p-1.5 rounded-full flex gap-1 border border-zinc-800 shadow-2xl h-[44px]">
                        <button class="px-4 rounded-full transition-all duration-300 flex items-center justify-center"
                            :class="viewMode === 'grid' ? 'bg-yellow-500 text-zinc-950 shadow-[0_0_15px_rgba(234,179,8,0.3)]' : 'text-zinc-500 hover:text-yellow-500 hover:bg-zinc-900'"
                            @click="viewMode = 'grid'">
                            <LayoutGrid class="w-4 h-4 stroke-[2.5px]" />
                        </button>
                        <button class="px-4 rounded-full transition-all duration-300 flex items-center justify-center"
                            :class="viewMode === 'list' ? 'bg-yellow-500 text-zinc-950 shadow-[0_0_15px_rgba(234,179,8,0.3)]' : 'text-zinc-500 hover:text-yellow-500 hover:bg-zinc-900'"
                            @click="viewMode = 'list'">
                            <ListIcon class="w-4 h-4 stroke-[2.5px]" />
                        </button>
                    </div>
                </div>

                <div class="order-2 ml-auto">
                    <button @click="isModalOpen = true"
                        class="group flex items-center justify-center gap-3 w-[44px] sm:w-auto px-0 sm:px-4 h-[44px] rounded-full bg-zinc-950 border-2 border-yellow-500 text-yellow-500 font-black uppercase tracking-[0.15em] text-[10px] sm:text-[10px] hover:bg-yellow-500 hover:text-zinc-950 transition-all duration-300 shadow-xl shadow-yellow-500/10 active:scale-95">
                        <Plus class="w-4 h-4 stroke-[3px]" />
                        <span class="hidden sm:inline text-[10px] sm:text-xs">Nueva Base</span>
                    </button>
                </div>
            </div>
        </div>

        <div>
            <!-- Grid View -->
            <div v-if="viewMode === 'grid'" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div v-for="base in bases" :key="base.id"
                    class="group relative overflow-hidden bg-zinc-950 shadow-2xl transition-all hover:ring-2 hover:ring-yellow-500/50 rounded-[2.5rem]">

                    <!-- Image Container -->
                    <div class="aspect-video relative overflow-hidden bg-zinc-900">
                        <img :src="base.url_foto"
                            class="block w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />

                        <!-- Overlay Táctico -->
                        <div
                            class="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent opacity-60 group-hover:opacity-40 transition-opacity">
                        </div>

                        <!-- Badge Inferior (Izquierda) -->
                        <div class="absolute bottom-4 left-4">
                            <span
                                class="px-3 py-1.5 rounded-lg text-[10px] font-black bg-yellow-500 text-zinc-950 uppercase tracking-widest shadow-lg">
                                NIVEL {{ base.level_th }} <span class="text-white">➖</span> {{ base.type }}
                            </span>
                        </div>

                        <!-- Fecha (Abajo Derecha) -->
                        <div class="absolute bottom-4 right-4">
                            <span
                                class="px-3 py-1.5 rounded-lg text-[10px] font-black bg-zinc-950 text-yellow-500 uppercase tracking-widest shadow-lg border border-yellow-500/20">
                                {{ new Date(base.created_at).toLocaleDateString('es-ES') }}
                            </span>
                        </div>
                    </div>

                    <div class="p-4">
                        <div class="flex items-center justify-between">
                            <h3
                                class="text-lg font-black italic tracking-tighter text-white uppercase group-hover:text-yellow-500 transition-colors leading-none">
                                {{ base.id }}
                            </h3>

                            <div class="flex gap-2">
                                <a :href="base.link" target="_blank"
                                    class="p-2.5 rounded-xl bg-zinc-900 text-zinc-400 hover:bg-yellow-500 hover:text-zinc-950 transition-all border border-zinc-800">
                                    <ExternalLink class="w-4 h-4" />
                                </a>
                                <button @click="deleteBase(base.id)"
                                    class="p-2.5 rounded-xl bg-zinc-900 text-zinc-400 hover:bg-red-600 hover:text-white transition-all border border-zinc-800">
                                    <Trash2 class="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- List View (Versión Táctica) -->
            <div v-else class="rounded-[2.5rem] border border-zinc-800 bg-zinc-950 overflow-hidden shadow-2xl">
                <div class="overflow-x-auto w-full custom-scrollbar">
                    <table class="w-full text-left min-w-[900px]">
                        <thead class="bg-zinc-900/50 border-b border-zinc-800">
                            <tr>
                                <th class="p-4 text-[11px] font-black uppercase tracking-[0.2em] text-zinc-500">
                                    Fotografía</th>
                                <th class="p-4 text-[11px] font-black uppercase tracking-[0.2em] text-zinc-500">Nivel - Categoría</th>
                                <th class="p-4 text-[11px] font-black uppercase tracking-[0.2em] text-zinc-500 text-center">
                                    ID</th>
                                <th class="p-4 text-[11px] font-black uppercase tracking-[0.2em] text-zinc-500 text-center">
                                    Publicado</th>
                                <th class="p-4 text-[11px] font-black uppercase tracking-[0.2em] text-zinc-500 text-right">
                                    Acciones</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-zinc-800/50">
                            <tr v-for="base in bases" :key="base.id" class="group hover:bg-zinc-900/40 transition-colors">
                                <td class="p-4">
                                    <div
                                        class="w-24 h-14 rounded-xl bg-zinc-900 overflow-hidden ring-1 ring-zinc-800 group-hover:ring-yellow-500/50 transition-all">
                                        <img :src="base.url_foto"
                                            class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                    </div>
                                </td>
                                <td class="p-4">
                                    <span
                                        class="px-3 py-1.5 rounded-lg text-[10px] font-black bg-yellow-500 text-zinc-950 uppercase tracking-widest shadow-lg">
                                        NIVEL {{ base.level_th }} <span class="text-white">➖</span> {{ base.type }}
                                    </span>
                                </td>
                                <td class="p-4 text-center">
                                    <span
                                        class="text-sm font-black italic tracking-tighter text-white uppercase group-hover:text-yellow-500 transition-colors">
                                        {{ base.id }}
                                    </span>
                                </td>
                                <td class="p-4 text-center">
                                    <span
                                        class="px-3 py-1.5 rounded-lg text-[10px] font-black bg-zinc-950 text-yellow-500 uppercase tracking-widest shadow-lg border border-yellow-500/20">
                                        {{ new Date(base.created_at).toLocaleDateString('es-ES') }}
                                    </span>
                                </td>
                                <td class="p-4">
                                    <div class="flex gap-3 justify-end items-center">
                                        <a :href="base.link" target="_blank"
                                            class="p-2.5 rounded-xl bg-zinc-900 text-zinc-400 hover:bg-yellow-500 hover:text-zinc-950 transition-all">
                                            <ExternalLink class="w-4 h-4" />
                                        </a>
                                        <button @click="deleteBase(base.id)"
                                            class="p-2.5 rounded-xl bg-zinc-900 text-zinc-400 hover:bg-red-600 hover:text-white transition-all">
                                            <Trash2 class="w-4 h-4" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- Empty State Simplificado -->
            <div v-if="bases.length === 0" class="flex items-center justify-center min-h-[400px] text-center">
                <p class="text-zinc-500 text-sm font-bold uppercase tracking-widest">
                    Sin bases registradas
                </p>
            </div>
        </div>

        <!-- Premium Modal Wrapper -->
        <Teleport to="body">
            <div v-if="isModalOpen" class="fixed inset-0 z-[100] flex items-center justify-center p-4">
                <div class="absolute inset-0 bg-zinc-950/90 backdrop-blur-xl" @click="isModalOpen = false"></div>

                <div
                    class="relative bg-zinc-950 w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-[2.5rem] shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-yellow-500/20 animate-in zoom-in-95 duration-300 custom-scrollbar">
                    <div
                        class="sticky top-0 right-0 p-4 flex justify-end items-center bg-zinc-950/80 backdrop-blur-md z-10 border-zinc-900">
                        <button @click="isModalOpen = false"
                            class="p-2 rounded-xl bg-zinc-900 text-zinc-500 hover:bg-yellow-500 hover:text-zinc-950 transition-all">
                            <Plus class="w-6 h-6 rotate-45 stroke-[3px]" />
                        </button>
                    </div>

                    <div class="px-4 pb-4">
                        <BaseForm @success="handleSuccess" />
                    </div>
                </div>
            </div>
        </Teleport>
    </div>
</template>



<style scoped>
/* No additional styles needed as we removed the custom scrollbar CSS to use the global one or just classes */
</style>
