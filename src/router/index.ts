import { createRouter, createWebHistory } from 'vue-router'
import Dashboard from '@/views/Dashboard.vue'
import { initializeAuth, session } from '@/lib/auth'

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: '/',
            name: 'dashboard',
            component: Dashboard,
            meta: { requiresAuth: true }
        },
        {
            path: '/bases',
            name: 'bases',
            component: () => import('@/views/BasesView.vue'),
            meta: { requiresAuth: true }
        },
        {
            path: '/imagenes',
            name: 'imagenes',
            component: () => import('@/views/ImagesView.vue'),
            meta: { requiresAuth: true }
        },
        {
            path: '/login',
            name: 'login',
            component: () => import('@/views/LoginView.vue')
        }
    ]
})

router.beforeEach(async (to) => {
    await initializeAuth()

    if (to.meta.requiresAuth && !session.value) {
        return { name: 'login', query: { redirect: to.fullPath } }
    }

    if (to.name === 'login' && session.value) {
        return { name: 'dashboard' }
    }
})

export default router
