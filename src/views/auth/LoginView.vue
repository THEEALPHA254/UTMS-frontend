<template>
  <!-- Full-screen auth background -->
  <v-container fluid class="auth-root pa-0">
    <div class="auth-card-wrapper">

      <!-- ── Left: Form Panel ── -->
      <v-card flat class="auth-panel-form" rounded="0">

        <!-- Brand -->
        <div class="auth-brand">
          <span class="auth-brand-dot"></span>
          <span class="auth-brand-name">SchoolBus</span>
        </div>

        <!-- Form Body -->
        <div class="auth-form-body">
          <div>
            <h1 class="auth-title">Welcome back</h1>
            <p class="auth-subtitle mt-1">Welcome back! Please enter your details.</p>
          </div>

          <!-- Email -->
          <v-text-field
            v-model="email"
            class="app-field"
            label="Email"
            type="email"
            placeholder="Enter your email"
            variant="outlined"
            density="compact"
            hide-details="auto"
            :error-messages="errors.email"
          />

          <!-- Password -->
          <v-text-field
            v-model="password"
            class="app-field"
            label="Password"
            :type="showPassword ? 'text' : 'password'"
            placeholder="••••••••"
            variant="outlined"
            density="compact"
            hide-details="auto"
            :error-messages="errors.password"
            :append-inner-icon="showPassword ? 'mdi-eye-off-outline' : 'mdi-eye-outline'"
            @click:append-inner="showPassword = !showPassword"
          />

          <!-- Remember + Forgot -->
          <div class="d-flex align-center justify-between">
            <v-checkbox
              v-model="remember"
              class="auth-checkbox"
              label="Remember for 30 days"
              density="compact"
              hide-details
              color="primary"
            />
            <a href="#" class="link-primary">Forgot password</a>
          </div>

          <!-- Sign In -->
          <v-btn
            class="btn-auth-primary w-full"
            :loading="loading"
            block
            @click="onLogin"
          >
            Sign in
          </v-btn>

          <!-- Google -->
          <v-btn
            class="btn-auth-google w-full"
            block
            prepend-icon="mdi-google"
          >
            Sign in with Google
          </v-btn>

          <!-- Sign up link -->
          <p class="text-center text-muted" style="font-size: var(--text-sm);">
            Don't have an account?
            <a href="#" class="link-primary">Sign up</a>
          </p>
        </div>

        <!-- Footer -->
        <p class="auth-footer-copy">© SchoolBus 2027</p>
      </v-card>

      <!-- ── Right: Visual Panel ── -->
      <div class="auth-panel-visual">
        <div class="auth-orb"></div>
        <div class="auth-orb-shadow"></div>

        <!-- Arrow nav -->
        <div class="auth-nav-arrow">
          <v-icon size="18" color="grey-darken-1">mdi-chevron-right</v-icon>
        </div>
      </div>

    </div>
  </v-container>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import axiosInst from '@/services/api'

const router    = useRouter()
const authStore = useAuthStore()

const email = ref('')
const password = ref('')
const remember = ref(false)
const loading = ref(false)

let state = ref({
  is_loading: false,
});

const showPassword = ref(false)

const errors = reactive({ email: '', password: '' })

function validate() {
  errors.email    = email.value    ? '' : 'Email is required.'
  errors.password = password.value ? '' : 'Password is required.'
  return !errors.email && !errors.password
}


const onLogin = async () => {
  if (!validate()) return

  loading.value = true
  try {
    const res = await axiosInst.post('/auth/login/', {
      email:    email.value,
      password: password.value,
    })

    console.log('Response:', res.data)

    // ✅ tokens are inside res.data.data
    const { access, refresh, ...userData } = res.data.data

    console.log('access:', access)      // should now show the token
    console.log('refresh:', refresh)    // should now show the token

    // Save to localStorage
    localStorage.setItem('access_token', access)
    localStorage.setItem('refresh_token', refresh)
    localStorage.setItem('userData', JSON.stringify(userData))

    // Update store
    authStore.setToken(access)
    authStore.setUser(userData)

    console.log('isAuthenticated:', authStore.isAuthenticated) // should be true

    router.push({ name: 'home' })

  } catch (err) {
    console.error('Login error:', err.response?.data)
    errors.email = err?.response?.data?.message || 'Invalid email or password.'
  } finally {
    loading.value = false
  }
}
</script>