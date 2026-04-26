import { createRouter, createWebHistory } from 'vue-router'
import { nextTick } from 'vue'
import authRoutes from './routes/auth'
import coreRoutes from './routes/core'
import { useAuthStore } from '@/stores/authStore'  // ✅ normal import at top

import dashboardRoutes from './routes/dashboard'
import studentRoutes from './routes/students'
import tripRoutes from './routes/trips'
import reportRoutes from './routes/reports'
import paymentRoutes from './routes/payment'

const routes = [
  {
    path: '/',
    component: () => import('@/layouts/default/DefaultLayout.vue'),
    children: [
      {
        path: '',
        name: 'home',
        meta: { requiresAuth: true, title: 'Dashboard' },
        component: () => import('@/views/HomeView.vue'),
      },
      ...dashboardRoutes,
      ...studentRoutes,
      ...tripRoutes,
      ...reportRoutes,
      ...paymentRoutes,
    ],
  },
  ...coreRoutes,
  ...authRoutes,
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

router.beforeEach((to) => {
  const authStore = useAuthStore()  // ✅ called inside beforeEach — this is correct

  if (to.meta.requiresAuth && !authStore.isAuthenticated)
    return { name: 'login', query: { redirect: to.fullPath } }

  if (to.meta.redirectIfAuthenticated && authStore.isAuthenticated)
    return { name: 'home' }
})

router.afterEach((to) => {
  nextTick(() => {
    document.title = to.meta.title ? `${to.meta.title} — UTMS` : 'UTMS'
  })
})

export default router