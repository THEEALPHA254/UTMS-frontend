import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

export const useAuthStore = defineStore('auth', () => {

  // ── State ──────────────────────────────────────────────
  const user        = ref(JSON.parse(localStorage.getItem('userData')) || null)
  const accessToken = ref(localStorage.getItem('access_token') || null)

  // ── Getters ────────────────────────────────────────────
  const isAuthenticated = computed(() => !!accessToken.value)
  const userRole        = computed(() => user.value?.role || null)
  const userFullName    = computed(() =>
    user.value ? `${user.value.first_name} ${user.value.last_name}` : ''
  )

  // ── Actions ────────────────────────────────────────────
  function setUser(userData) {
    user.value = userData
  }

  function setToken(token) {
    accessToken.value = token
    localStorage.setItem('access_token', token)
  }

  function logout() {
    user.value        = null
    accessToken.value = null
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    localStorage.removeItem('userData')
  }

  return {
    user,
    accessToken,
    isAuthenticated,
    userRole,
    userFullName,
    setUser,
    setToken,
    logout,
  }
})