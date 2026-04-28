<template>
  <v-app>
    <v-navigation-drawer
      v-model="drawer"
      color="background"
      permanent
    >
    <template v-slot:prepend>
        <div class="mt-2 d-flex align-center justify-center">
          <v-img inline src="../../assets/logo-405.png" :width="80" style="border-radius: 50px"></v-img>
        </div>
      </template>

      <v-divider class="my-5" />
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
