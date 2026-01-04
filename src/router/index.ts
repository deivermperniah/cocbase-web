import { createRouter, createWebHistory } from 'vue-router'
import Dashboard from '@/views/Dashboard.vue'

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: '/',
            name: 'dashboard',
            component: Dashboard
        },
        {
            path: '/bases',
            name: 'bases',
            component: () => import('@/views/BasesView.vue')
        },
        {
            path: '/imagenes',
            name: 'imagenes',
            component: () => import('@/views/ImagesView.vue')
        }
    ]
})

export default router
