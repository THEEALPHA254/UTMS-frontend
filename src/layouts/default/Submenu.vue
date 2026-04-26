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
      
      <v-list-item @click="triggerLogout" prepend-icon="mdi-power" title="Sign Out" value="sign-out"></v-list-item>
      <v-divider></v-divider>
      

    </v-list>
  </div>
  
</template>
<script setup>
import { useAuthStore } from "@/stores/authStore";
// import { globalStore } from "@/stores/globalStore";
import { onMounted } from "vue";

const store = useAuthStore();
// const g_Store = globalStore();

function triggerLogout() {
  // if (store.isClockedIn() == true) {
  //   g_Store.showLogoutModal();
  // } else {
  store.logout();
  // }
}

//

// onMounted(() => {
//   g_Store.fetchMakes();
//   g_Store.fetchSpareWheels();
//   g_Store.fetchRegions();
//   g_Store.fetchWheels();
//   g_Store.fetchRoutes();
//   g_Store.fetchTrailerTypes();
//   g_Store.fetchTrailerAxles();
//   g_Store.fetchTrailerNumberofWheels();
//   g_Store.fetchTrailerNumberofWheelsPerAxle();
//   g_Store.fetchTrailerSpareWheels();
//   g_Store.fetchassignTrailers();
//   g_Store.fetchUnassignTrailers();
//   g_Store.fetchVehicles();
//   g_Store.isAdmin();
//   g_Store.isSuperAdmin();
//   g_Store.fetchBrands();
//   g_Store.fetchSize();
//   g_Store.fetchPattern();
//   g_Store.fetchTyres();
//   g_Store.fetchTyrePurchase();
//   g_Store.fetchTyrePurchaseFitted();
//   g_Store.fetchWheelPosition();
//   g_Store.fetchVehicleTrailer();
//   g_Store.fetchSendForRetreads();
//   g_Store.fetchTreadDepth();
//   g_Store.fetchScrapReasons();
//   g_Store.fetchDisposedScrappedTyres();
//   g_Store.fetchReturnFromRetread();
//   g_Store.fetchTyreFitments();
//   g_Store.fetchRubbers();
//   g_Store.sendNewForRetread();
//   g_Store.fetchMyTrailers();
//   g_Store.fetchMyVehicles();
// });
</script>
