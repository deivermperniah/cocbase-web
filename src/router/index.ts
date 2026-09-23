import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'
import { initializeAuth, session, isAdmin } from '@/lib/auth'

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: '/',
            name: 'home',
            component: HomeView,
        },
        {
            path: '/bases',
            name: 'bases',
            component: () => import('@/views/BasesView.vue'),
        },
        {
            path: '/descargar',
            name: 'descargar',
            component: () => import('@/views/DescargarAppView.vue'),
        },
        {
            path: '/favoritos',
            name: 'favoritos',
            component: () => import('@/views/FavoritosView.vue'),
            meta: { requiresAuth: true, userOnly: true }
        },
        {
            path: '/contribuir',
            name: 'contribuir',
            component: () => import('@/views/ContribuirView.vue'),
            meta: { requiresAuth: true, userOnly: true }
        },
        {
            path: '/dashboard',
            name: 'dashboard',
            component: () => import('@/views/Dashboard.vue'),
            meta: { requiresAuth: true, requiresAdmin: true }
        },
        {
            path: '/revision',
            name: 'revision',
            component: () => import('@/views/RevisionView.vue'),
            meta: { requiresAuth: true, requiresAdmin: true }
        },
        {
            path: '/imagenes',
            name: 'imagenes',
            component: () => import('@/views/ImagesView.vue'),
            meta: { requiresAuth: true, requiresAdmin: true }
        },
        {
            path: '/login',
            name: 'login',
            component: () => import('@/views/LoginView.vue'),
        },
        {
            path: '/register',
            name: 'register',
            component: () => import('@/views/RegisterView.vue'),
        },
        {
            path: '/aviso-legal',
            name: 'aviso-legal',
            component: () => import('@/views/LegalView.vue'),
        },
        {
            path: '/privacidad',
            name: 'privacidad',
            component: () => import('@/views/PrivacidadView.vue'),
        },
        {
            path: '/:pathMatch(.*)*',
            name: 'not-found',
            component: () => import('@/views/NotFoundView.vue'),
        }
    ]
})

router.beforeEach(async (to) => {
    await initializeAuth()

    if (to.meta.requiresAuth && !session.value) {
        return { name: 'login', query: { redirect: to.fullPath } }
    }

    if (to.meta.requiresAdmin && !isAdmin.value) {
        return { name: 'home' }
    }

    if (to.meta.userOnly && isAdmin.value) {
        return { name: 'dashboard' }
    }

    if ((to.name === 'login' || to.name === 'register') && session.value) {
        return { name: 'home' }
    }
})

export default router
