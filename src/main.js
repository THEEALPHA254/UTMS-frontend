/**
 * main.js
 *
 * Bootstraps Vuetify and other plugins then mounts the App`
 */

// Composables
import { createApp } from 'vue'

// Plugins
import { registerPlugins } from '@/plugins'

// Components
import App from './App.vue'

// Styles
import 'unfonts.css'
import 'virtual:uno.css'
import './styles/main.css'
import { defineRule } from 'vee-validate'
import { required, email, min, max } from '@vee-validate/rules'
import Vue3Toastify from 'vue3-toastify'
import 'vue3-toastify/dist/index.css'



// Register rules globally
defineRule('required', required)
defineRule('email', email)
defineRule('min', min)
defineRule('max', max)


const app = createApp(App)
app.use(Vue3Toastify, { autoClose: 3000 })

registerPlugins(app)

app.mount('#app')
