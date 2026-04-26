<template>
  <v-app>
    <v-navigation-drawer
      v-model="drawer"
      color="background"
      permanent
    >
      <v-list-item title="UTMS Frontend" subtitle="Project Navigation" />
      <v-divider class="my-2" />
      <Submenu />
    </v-navigation-drawer>

    <v-app-bar color="primary">
      <v-app-bar-nav-icon @click="drawer = !drawer" />
      <v-app-bar-title>UTMS</v-app-bar-title>
    </v-app-bar>

    <v-main class="bg-background">
      <v-container class="py-6">
        <router-view />
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup>
  import { ref } from 'vue'
  import Submenu from './Submenu.vue'

  const drawer = ref(true)
</script>
