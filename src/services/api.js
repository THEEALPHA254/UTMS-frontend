import axios from "axios"

const axiosInst = axios.create({
  baseURL: import.meta.env.VITE_BASE_API_URL || 'http://127.0.0.1:8000/api',
  headers: {
    "Content-Type": "application/json",
  },
})

// Auto-attach token to every request
axiosInst.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

export default axiosInst