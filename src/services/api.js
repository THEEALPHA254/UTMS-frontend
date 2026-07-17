import axios from "axios"

const axiosInst = axios.create({
  baseURL: import.meta.env.VITE_BASE_API_URL || 'http://127.0.0.1:8000/api',
  headers: {
    "Content-Type": "application/json",
  },
})

axiosInst.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

let isRefreshing = false
let failedQueue = []

function processQueue(error, token = null) {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error)
    else resolve(token)
  })
  failedQueue = []
}

axiosInst.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config

    const isExpired =
      error.response?.status === 401 &&
      error.response?.data?.code === 'token_not_valid' &&
      !original._retry

    if (!isExpired) return Promise.reject(error)

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject })
      }).then((token) => {
        original.headers.Authorization = `Bearer ${token}`
        return axiosInst(original)
      })
    }

    original._retry = true
    isRefreshing = true

    const refresh = localStorage.getItem('refresh_token')
    if (!refresh) {
      isRefreshing = false
      redirectToLogin()
      return Promise.reject(error)
    }

    try {
      const { data } = await axios.post(
        `${axiosInst.defaults.baseURL}/auth/token/refresh/`,
        { refresh }
      )
      const newAccess = data.access
      localStorage.setItem('access_token', newAccess)
      axiosInst.defaults.headers.common.Authorization = `Bearer ${newAccess}`
      processQueue(null, newAccess)
      original.headers.Authorization = `Bearer ${newAccess}`
      return axiosInst(original)
    } catch (refreshError) {
      processQueue(refreshError, null)
      redirectToLogin()
      return Promise.reject(refreshError)
    } finally {
      isRefreshing = false
    }
  }
)

function redirectToLogin() {
  localStorage.removeItem('access_token')
  localStorage.removeItem('refresh_token')
  localStorage.removeItem('userData')
  window.location.href = '/login'
}

export default axiosInst
