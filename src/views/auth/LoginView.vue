<template>
  <!-- Full-screen auth background -->
  <v-container fluid class="auth-root pa-0">
    <div class="auth-card-wrapper">

      <!-- ── Left: Form Panel ── -->
      <v-card flat class="auth-panel-form" rounded="0">

        <!-- Brand -->
        <div class="auth-brand">
          <span class="auth-brand-name">UNIVERSITY TRANSPORT MANAGEMENT SYSTEM</span>
        </div>

        <!-- Form Body -->
        <div class="auth-form-body">
          <div>
            <h1 class="auth-title">Welcome back</h1>
            <p class="auth-subtitle">Welcome back! Please enter your details.</p>
          </div>

          <div class="auth-login-fields">
            <!-- Email -->
            <v-text-field
              v-model="email"
              class="auth-field"
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
              class="auth-field"
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
          </div>

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
            <a href="#" class="link-primary" @click.prevent="forgotDialog = true">Forgot password</a>
          </div>

          <!-- Sign In -->
          <v-btn
            class="btn-auth-primary"
            :loading="loading"
            block
            density="default"
            height="38"
            @click="onLogin"
          >
            Sign in
          </v-btn>
        </div>

        <!-- Footer -->
        <p class="auth-footer-copy">© UTMS-University Transport Management System 2027</p>
      </v-card>

      <!-- ── Right: Visual Panel ── -->
      <div class="auth-panel-visual">
      </div>

    </div>
  </v-container>

  <!-- Forgot Password Dialog -->
  <v-dialog v-model="forgotDialog" max-width="440" persistent>
    <v-card rounded="xl">
      <v-card-title class="pa-5 pb-2">
        {{ forgotStep === 1 ? 'Reset Password' : 'Set New Password' }}
      </v-card-title>
      <v-card-text class="pa-5 pt-2">

        <!-- Step 1: enter email -->
        <template v-if="forgotStep === 1">
          <p class="text-body-2 text-medium-emphasis mb-4">
            Enter your registered email address and we'll send you a 6-digit reset code.
          </p>
          <v-text-field
            v-model="forgotEmail"
            label="Email Address"
            type="email"
            variant="outlined"
            density="compact"
            rounded="lg"
            hide-details="auto"
            :error-messages="forgotError"
            class="auth-field"
          />
        </template>

        <!-- Step 2: enter OTP + new password -->
        <template v-else>
          <p class="text-body-2 text-medium-emphasis mb-4">
            Enter the 6-digit code sent to <strong>{{ forgotEmail }}</strong> and your new password.
          </p>
          <v-text-field
            v-model="forgotOtp"
            label="Reset Code"
            type="text"
            variant="outlined"
            density="compact"
            rounded="lg"
            hide-details="auto"
            :error-messages="forgotError"
            class="auth-field mb-3"
            maxlength="6"
          />
          <v-text-field
            v-model="forgotNewPassword"
            label="New Password"
            :type="forgotShowPw ? 'text' : 'password'"
            variant="outlined"
            density="compact"
            rounded="lg"
            hide-details="auto"
            class="auth-field"
            :append-inner-icon="forgotShowPw ? 'mdi-eye-off-outline' : 'mdi-eye-outline'"
            @click:append-inner="forgotShowPw = !forgotShowPw"
          />
        </template>

      </v-card-text>
      <v-card-actions class="pa-5 pt-0">
        <v-btn variant="text" @click="closeForgot">Cancel</v-btn>
        <v-spacer />
        <v-btn
          v-if="forgotStep === 2"
          variant="text"
          @click="forgotStep = 1; forgotError = ''"
        >
          Back
        </v-btn>
        <v-btn
          color="primary"
          variant="flat"
          rounded="lg"
          :loading="forgotLoading"
          @click="forgotStep === 1 ? requestOtp() : confirmReset()"
        >
          {{ forgotStep === 1 ? 'Send Code' : 'Reset Password' }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <v-snackbar v-model="forgotSnack.show" :color="forgotSnack.color" rounded="lg">
    {{ forgotSnack.text }}
  </v-snackbar>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import axiosInst from '@/services/api'
import { useGlobalStore } from '@/stores/globalstore'

const globalStore = useGlobalStore()
const router      = useRouter()
const authStore   = useAuthStore()

const email        = ref('')
const password     = ref('')
const remember     = ref(false)
const loading      = ref(false)
const showPassword = ref(false)

const errors = reactive({ email: '', password: '' })

function validate() {
  errors.email    = email.value    ? '' : 'Email is required.'
  errors.password = password.value ? '' : 'Password is required.'
  return !errors.email && !errors.password
}

// ── Forgot password ────────────────────────────────────────────────────────
const forgotDialog      = ref(false)
const forgotStep        = ref(1)
const forgotEmail       = ref('')
const forgotOtp         = ref('')
const forgotNewPassword = ref('')
const forgotShowPw      = ref(false)
const forgotLoading     = ref(false)
const forgotError       = ref('')
const forgotSnack       = ref({ show: false, text: '', color: 'success' })

function closeForgot() {
  forgotDialog.value = false
  forgotStep.value = 1
  forgotEmail.value = ''
  forgotOtp.value = ''
  forgotNewPassword.value = ''
  forgotError.value = ''
}

async function requestOtp() {
  forgotError.value = ''
  if (!forgotEmail.value) { forgotError.value = 'Email is required.'; return }
  forgotLoading.value = true
  try {
    await axiosInst.post('/auth/forgot-password/', { email: forgotEmail.value })
    forgotStep.value = 2
  } catch (e) {
    forgotError.value = e?.response?.data?.message || 'Failed to send code.'
  } finally {
    forgotLoading.value = false
  }
}

async function confirmReset() {
  forgotError.value = ''
  if (!forgotOtp.value) { forgotError.value = 'Reset code is required.'; return }
  if (forgotNewPassword.value.length < 8) { forgotError.value = 'Password must be at least 8 characters.'; return }
  forgotLoading.value = true
  try {
    await axiosInst.post('/auth/reset-password/', {
      email:        forgotEmail.value,
      otp:          forgotOtp.value,
      new_password: forgotNewPassword.value,
    })
    forgotSnack.value = { show: true, text: 'Password reset successfully. Please log in.', color: 'success' }
    closeForgot()
  } catch (e) {
    forgotError.value = e?.response?.data?.message || 'Failed to reset password.'
  } finally {
    forgotLoading.value = false
  }
}

// ── Login ──────────────────────────────────────────────────────────────────
const onLogin = async () => {
  if (!validate()) return

  loading.value = true
  try {
    const res = await axiosInst.post('/auth/login/', {
      email:    email.value,
      password: password.value,
    })

    const { access, refresh, ...userData } = res.data.data

    localStorage.setItem('access_token', access)
    localStorage.setItem('refresh_token', refresh)
    localStorage.setItem('userData', JSON.stringify(userData))

    authStore.setToken(access)
    authStore.setUser(userData)
    globalStore.setUser(userData)

    router.push({ name: 'home' })

  } catch (err) {
    console.error('Login error:', err.response?.data)
    errors.email = err?.response?.data?.message || 'Invalid email or password.'
  } finally {
    loading.value = false
  }
}
</script>