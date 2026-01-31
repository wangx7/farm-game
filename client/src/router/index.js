import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '../stores/user'

const routes = [
    {
        path: '/login',
        name: 'Login',
        component: () => import('../views/LoginView.vue')
    },
    {
        path: '/',
        name: 'Farm',
        component: () => import('../views/FarmView.vue'),
        meta: { requiresAuth: true }
    },
    {
        path: '/friends',
        name: 'Friends',
        component: () => import('../views/FriendsView.vue'),
        meta: { requiresAuth: true }
    },
    {
        path: '/visit/:userId',
        name: 'VisitFarm',
        component: () => import('../views/VisitFarmView.vue'),
        meta: { requiresAuth: true }
    },
    {
        path: '/shop',
        name: 'Shop',
        component: () => import('../views/ShopView.vue'),
        meta: { requiresAuth: true }
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

// 路由守卫
router.beforeEach((to, from, next) => {
    const userStore = useUserStore()

    if (to.meta.requiresAuth && !userStore.isLoggedIn) {
        next('/login')
    } else if (to.path === '/login' && userStore.isLoggedIn) {
        next('/')
    } else {
        next()
    }
})

export default router
