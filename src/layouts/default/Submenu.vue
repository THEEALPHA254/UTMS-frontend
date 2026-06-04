<template>
  <div>
    <v-list density="compact" nav>

      <v-list-group>
        <template v-slot:activator="{ props }">
          <v-list-item v-bind="props" class="hv settitlefont">
            <v-list-item-title>
              <v-icon icon="mdi-home-city" class="mr-8" />
              Home
            </v-list-item-title>
          </v-list-item>
        </template>

        <v-list-item :to="{ name: 'home' }" prepend-icon="mdi-human-greeting" title="Welcome" value="home" />
        <v-divider />

        <v-list-item title="Dashboard" :to="{ name: 'dashboard' }" value="dashboard" rounded="lg">
          <template v-slot:prepend>
            <v-icon class="mr-n3" icon="mdi-apps"  />
          </template>
        </v-list-item>
        <v-divider />
      </v-list-group>

      <!-- Students — staff + admin -->
      <v-list>
        <v-list-item title="Students" :to="{ name: 'students' }" value="students" rounded="lg">
          <template v-slot:prepend>
            <v-icon class="mr-n3" icon="mdi-account-group"  />
          </template>
        </v-list-item>
        <v-divider />
      </v-list>

      <!-- Drivers — staff + admin -->
      <v-list>
        <v-list-item title="Drivers" :to="{ name: 'drivers' }" value="drivers" rounded="lg">
          <template v-slot:prepend>
            <v-icon class="mr-n3" icon="mdi-steering"  />
          </template>
        </v-list-item>
        <v-divider />
      </v-list>

      <!-- Staff — admin only -->
      <v-list v-if="globalStore.isAdmin">
        <v-list-item title="Staff" :to="{ name: 'staff' }" value="staff" rounded="lg">
          <template v-slot:prepend>
            <v-icon class="mr-n3" icon="mdi-shield-account"  />
          </template>
        </v-list-item>
        <v-divider />
      </v-list>

      <v-list>
        <v-list-item title="Buses" :to="{ name: 'buses' }" value="buses" rounded="lg">
          <template v-slot:prepend>
            <v-icon class="mr-n3" icon="mdi-bus" />
          </template>
        </v-list-item>
        <v-divider />
      </v-list>

      <v-list>
        <v-list-item title="Routes" :to="{ name: 'routes' }" value="routes" rounded="lg">
          <template v-slot:prepend>
            <v-icon class="mr-n3" icon="mdi-map-marker-path"  />
          </template>
        </v-list-item>
        <v-divider />
      </v-list>

      <v-list>
        <v-list-item title="Schedules" :to="{ name: 'schedules' }" value="schedules" rounded="lg">
          <template v-slot:prepend>
            <v-icon class="mr-n3" icon="mdi-calendar-clock" />
          </template>
        </v-list-item>
        <v-divider />
      </v-list>

      <v-list>
        <v-list-item title="Trips" :to="{ name: 'trips' }" value="trips" rounded="lg">
          <template v-slot:prepend>
            <v-icon class="mr-n3" icon="mdi-bus-multiple"  />
          </template>
        </v-list-item>
        <v-divider />
      </v-list>

      <v-list>
        <v-list-item title="Payment" :to="{ name: 'payment' }" value="payment" rounded="lg">
          <template v-slot:prepend>
            <v-icon class="mr-n3" icon="mdi-account-credit-card-outline"  />
          </template>
        </v-list-item>
        <v-divider />
      </v-list>

      <!-- Reports — expandable group -->
      <v-list-group value="reports">
        <template v-slot:activator="{ props }">
          <v-list-item v-bind="props" rounded="lg">
            <template v-slot:prepend>
              <v-icon class="mr-n3" icon="mdi-chart-box-multiple" />
            </template>
            <v-list-item-title>Reports</v-list-item-title>
          </v-list-item>
        </template>
        <v-list-item title="Custom Reports"     :to="{ name: 'reports-custom' }"           value="reports-custom"           rounded="lg" prepend-icon="mdi-file-chart-outline" />
        <v-list-item title="Monthly Trips"      :to="{ name: 'reports-monthly-trips' }"    value="reports-monthly-trips"    rounded="lg" prepend-icon="mdi-calendar-month" />
        <v-list-item title="Bookings"           :to="{ name: 'reports-bookings' }"         value="reports-bookings"         rounded="lg" prepend-icon="mdi-ticket-confirmation" />
        <v-list-item title="Vehicle Occupancy"  :to="{ name: 'reports-vehicle-occupancy' }" value="reports-vehicle-occupancy" rounded="lg" prepend-icon="mdi-bus-clock" />
        <v-list-item title="Driver Performance" :to="{ name: 'reports-driver-performance' }" value="reports-driver-performance" rounded="lg" prepend-icon="mdi-steering" />
      </v-list-group>
      <v-divider />

      <v-list-item @click="triggerLogout" prepend-icon="mdi-power" title="Sign Out" value="sign-out" />
      <v-divider />

    </v-list>
  </div>
</template>

<script setup>
import { useAuthStore }   from '@/stores/authStore'
import { useGlobalStore } from '@/stores/globalstore'
import { useRouter }      from 'vue-router'

const authStore   = useAuthStore()
const globalStore = useGlobalStore()
const router      = useRouter()

function triggerLogout() {
  authStore.logout()
  globalStore.clearUser()
  router.push({ name: 'login' })
}
</script>