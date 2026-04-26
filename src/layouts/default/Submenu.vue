<template>
  <div>
    <v-list density="compact" nav>
      <v-list-group>
        <template v-slot:activator="{ props }">
          <v-list-item v-bind="props" class="hv settitlefont">
            <v-list-item-title>
              <v-icon icon="mdi-home-city" class="mr-8"> </v-icon>
              Home
            </v-list-item-title>
          </v-list-item>
        </template>
        <v-list-item :to="{ name: 'home' }" prepend-icon="mdi-human-greeting" title="Welcome"
          value="home">




        </v-list-item>
        <v-divider></v-divider>
        <!--  start of dashboards -->
        <v-list-item title="Dashboard" :to="{name: 'dashboard'}" value="dashboard" rounded="lg">
          <template v-slot:prepend>
            <v-icon class="mr-n3" icon="mdi-apps" color="teal-darken-3"></v-icon>
          </template>
          </v-list-item>
          <v-divider></v-divider>      
      </v-list-group>

      <v-list>
        <v-list-item title="Students" :to="{name: 'students'}" value="students" rounded="lg">
          <template v-slot:prepend>
            <v-icon class="mr-n3" icon="mdi-account-group" color="teal-darken-3"></v-icon>
          </template>
          </v-list-item>
          <v-divider></v-divider>
      </v-list>

      <v-list>
        <v-list-item title="Routes" :to="{name: 'routes'}" value="routes" rounded="lg">
          <template v-slot:prepend>
            <v-icon class="mr-n3" icon="mdi-map-marker-path" color="teal-darken-3"></v-icon>
          </template>
        </v-list-item>
          <v-divider></v-divider>
      </v-list>
      
      <v-list>
        <v-list-item title="Trips" :to="{name: 'trips'}" value="trips" rounded="lg">
          <template v-slot:prepend>
            <v-icon class="mr-n3" icon="mdi-bus-multiple" color="teal-darken-3"></v-icon>
          </template>
        </v-list-item>
          <v-divider></v-divider>
      </v-list>

      <v-list>
        <v-list-item title="Payment" :to="{name: 'payment'}" value="payment" rounded="lg">
          <template v-slot:prepend>
            <v-icon class="mr-n3" icon="mdi-account-credit-card-outline" color="teal-darken-3"></v-icon>
          </template>
        </v-list-item>
          <v-divider></v-divider>
      </v-list> 

      <v-list>
        <v-list-item title="Reports" :to="{name: 'reports'}" value="reports" rounded="lg">
          <template v-slot:prepend>
            <v-icon class="mr-n3" icon="mdi-chart-box-multiple" color="teal-darken-3"></v-icon>
          </template>
        </v-list-item>
          <v-divider></v-divider>
      </v-list>   
      
      <v-list-item @click="triggerLogout()" prepend-icon="mdi-power" title="Sign Out" value="sign-out"></v-list-item>
      <v-divider></v-divider>
      

    </v-list>
  </div>
  
</template>
<script setup>
import { useAuthStore } from "@/stores/authStore"
import { useRouter } from "vue-router"

const store  = useAuthStore()
const router = useRouter()

function triggerLogout() {
  store.logout()
  router.push({ name: 'login' })  // ✅ removed the trailing slash
}


</script>
