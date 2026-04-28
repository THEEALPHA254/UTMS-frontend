import { createRouter, createWebHistory } from 'vue-router'
import { nextTick } from 'vue'
import authRoutes from './routes/auth'
import coreRoutes from './routes/core'
import { useAuthStore } from '@/stores/authStore'
import { useGlobalStore } from '@/stores/globalstore'

import dashboardRoutes from './routes/dashboard'
import studentRoutes from './routes/students'
import tripRoutes from './routes/trips'
import reportRoutes from './routes/reports'
import paymentRoutes from './routes/payment'
import driverRoutes from './routes/driver'
import staffRoutes from './routes/staff'

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
      ...driverRoutes,
      ...staffRoutes,       // meta: { requiresAuth: true, requiresAdmin: true }
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
  const authStore   = useAuthStore()
  const globalStore = useGlobalStore()

  // ── 1. Not logged in → go to login ──────────────────────────────────────
  if (to.meta.requiresAuth && !authStore.isAuthenticated)
    return { name: 'login', query: { redirect: to.fullPath } }

  // ── 2. Logged in but not staff/admin → block web access ─────────────────
  //    Students and drivers logging in via the web get kicked out immediately
  if (to.meta.requiresAuth && authStore.isAuthenticated && !globalStore.isWebUser) {
    globalStore.clearUser()
    authStore.logout()
    return { name: 'login' }
  }

  // ── 3. Admin-only routes (e.g. /staff) ───────────────────────────────────
  if (to.meta.requiresAdmin && !globalStore.isAdmin)
    return { name: 'home' }

  // ── 4. Already authenticated → skip login page ───────────────────────────
  if (to.meta.redirectIfAuthenticated && authStore.isAuthenticated)
    return { name: 'home' }
})

router.afterEach((to) => {
  nextTick(() => {
    document.title = to.meta.title ? `${to.meta.title} — UTMS` : 'UTMS'
  })
})

export default router