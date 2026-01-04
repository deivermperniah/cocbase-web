<script setup lang="ts">
import {
    LayoutDashboard,
    Layers,
    Image
} from 'lucide-vue-next'
import logo from '@/assets/logo.png'

const navItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/' },
    { name: 'Bases', icon: Layers, path: '/bases' },
    { name: 'Imagenes', icon: Image, path: '/imagenes' },
]
</script>

<template>
    <aside class="bg-card border-r flex flex-col w-20 h-screen">
        <!-- Logo / Header -->
        <div class="h-16 flex flex-col">
            <div class="flex-1 flex items-center justify-center">
                <div class="flex items-center shrink-0">
                    <div class="w-10 h-10 flex items-center justify-center shrink-0">
                        <img :src="logo" alt="Logo" class="w-full h-full object-contain" />
                    </div>
                </div>
            </div>
            <div class="border-b mx-2"></div>
        </div>

        <!-- Navigation -->
        <nav class="flex-1 p-4 space-y-2">
            <router-link v-for="item in navItems" :key="item.name" :to="item.path"
                class="flex items-center rounded-lg hover:bg-muted group relative py-2 justify-center">
                <!-- Only icon for collapsed state -->
                <component :is="item.icon" class="w-5 h-5 text-muted-foreground group-hover:text-primary shrink-0" />
            </router-link>
        </nav>

    </aside>
</template>
