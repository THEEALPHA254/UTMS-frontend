/**
 * plugins/vuetify.js
 *
 * Framework documentation: https://vuetifyjs.com`
 */

// Composables
import { createVuetify } from 'vuetify'
// Styles
import '@mdi/font/css/materialdesignicons.css'

import '../styles/layers.css'
import 'vuetify/styles'

// https://vuetifyjs.com/en/introduction/why-vuetify/#feature-guides
// export default createVuetify({
//   theme: {
//     defaultTheme: 'system',
//   },
// })

export default createVuetify({
  theme: {
    defaultTheme: 'light',
    themes: {
      light: {
        colors: {
          primary: '#7A0019',
          secondary: '#F57C00',
          error: '#C62828',
          background: '#FFFFFF',
          surface: '#FFFFFF',
        },
      },
    },
  },
  defaults: {
    VTextField: {
      variant: 'outlined',
      density: 'compact',
      color: 'primary',
    },
    VBtn: {
      color: 'primary',
      variant: 'flat',
    },
  },
})
