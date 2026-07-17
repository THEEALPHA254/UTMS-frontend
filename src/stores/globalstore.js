// stores/globalStore.js
import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

export const useGlobalStore = defineStore('globalStore', () => {
  // ── State ──────────────────────────────────────────────────────────────────
  const userData = ref(JSON.parse(localStorage.getItem('userData')) || null)

  // ── Computed role helpers ──────────────────────────────────────────────────
  const role = computed(() => userData.value?.role || null)

  /** staff OR admin — can access the web system */
  const isWebUser   = computed(() => ['staff', 'admin'].includes(role.value))

  /** admin only — can manage staff accounts */
  const isAdmin     = computed(() => role.value === 'admin')

  /** staff (non-admin) */
  const isStaff     = computed(() => role.value === 'staff')

  const isStudent   = computed(() => role.value === 'student')
  const isDriver    = computed(() => role.value === 'driver')

  // ── Actions ────────────────────────────────────────────────────────────────
  function setUser(data) {
    userData.value = data
    localStorage.setItem('userData', JSON.stringify(data))
  }

  function clearUser() {
    userData.value = null
    localStorage.removeItem('userData')
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
  }

  function getUser() {
    return userData.value
  }

  return {
    userData,
    role,
    isWebUser,
    isAdmin,
    isStaff,
    isStudent,
    isDriver,
    setUser,
    clearUser,
    getUser,
  }
})