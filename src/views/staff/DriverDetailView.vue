<!-- DriverDetailView.vue -->
<template>
  <div>
    <div class="d-flex align-center mb-6">
      <v-btn icon variant="text" :to="{ name: 'drivers' }" class="mr-2">
        <v-icon>mdi-arrow-left</v-icon>
      </v-btn>
      <div>
        <h1 class="text-h5 font-weight-bold">Driver Details</h1>
        <p class="text-body-2 text-medium-emphasis">Full profile and trip history</p>
      </div>
    </div>

    <div v-if="loading" class="d-flex justify-center pa-10">
      <v-progress-circular indeterminate color="primary" />
    </div>

    <div v-else-if="!driver" class="text-center pa-10">
      <v-icon size="64" color="grey">mdi-account-off-outline</v-icon>
      <p class="text-medium-emphasis mt-2">Driver not found.</p>
    </div>

    <template v-else>
      <v-row class="mb-4">
        <!-- Profile card -->
        <v-col cols="12" md="4">
          <v-card rounded="xl" height="100%">
            <v-card-text class="pa-6 text-center">
              <v-avatar color="primary" size="80" class="mb-4">
                <span class="text-h5 text-white font-weight-bold">
                  {{ driver.first_name?.[0] }}{{ driver.last_name?.[0] }}
                </span>
              </v-avatar>
              <h2 class="text-h6 font-weight-bold">{{ driver.first_name }} {{ driver.last_name }}</h2>
              <p class="text-caption text-medium-emphasis">{{ driver.email }}</p>
              <v-chip :color="driver.driver_profile?.is_on_duty ? 'teal' : 'grey'" size="small" variant="tonal" class="mt-2">
                {{ driver.driver_profile?.is_on_duty ? 'On Duty' : 'Off Duty' }}
              </v-chip>
            </v-card-text>
            <v-divider />
            <v-list density="compact" class="pa-2">
              <v-list-item prepend-icon="mdi-phone-outline" title="Phone">
                <template #subtitle>{{ driver.phone_number || '—' }}</template>
              </v-list-item>
              <v-list-item prepend-icon="mdi-card-account-details-outline" title="License No.">
                <template #subtitle><code>{{ driver.driver_profile?.license_number || '—' }}</code></template>
              </v-list-item>
              <v-list-item prepend-icon="mdi-calendar-outline" title="License Expiry">
                <template #subtitle>{{ driver.driver_profile?.license_expiry || '—' }}</template>
              </v-list-item>
              <v-list-item prepend-icon="mdi-bus" title="Assigned Vehicle">
                <template #subtitle>
                  <span v-if="vehicle">{{ vehicle.bus_number }} / {{ vehicle.plate_number }}</span>
                  <span v-else class="text-medium-emphasis">Unassigned</span>
                </template>
              </v-list-item>
              <v-list-item prepend-icon="mdi-account-check-outline" title="Account Status">
                <template #subtitle>
                  <v-chip :color="driver.is_active ? 'success' : 'error'" size="x-small" variant="tonal">
                    {{ driver.is_active ? 'Active' : 'Inactive' }}
                  </v-chip>
                </template>
              </v-list-item>
            </v-list>
          </v-card>
        </v-col>

        <!-- Stats -->
        <v-col cols="12" md="8">
          <v-row>
            <v-col cols="12" sm="4">
              <v-card rounded="xl" color="primary" variant="tonal">
                <v-card-text class="pa-5 text-center">
                  <p class="text-caption text-medium-emphasis mb-1">Total Trips</p>
                  <p class="text-h5 font-weight-bold">{{ stats.total_trips }}</p>
                </v-card-text>
              </v-card>
            </v-col>
            <v-col cols="12" sm="4">
              <v-card rounded="xl" color="success" variant="tonal">
                <v-card-text class="pa-5 text-center">
                  <p class="text-caption text-medium-emphasis mb-1">Total Passengers</p>
                  <p class="text-h5 font-weight-bold">{{ stats.total_passengers }}</p>
                </v-card-text>
              </v-card>
            </v-col>
            <v-col cols="12" sm="4">
              <v-card rounded="xl" color="info" variant="tonal">
                <v-card-text class="pa-5 text-center">
                  <p class="text-caption text-medium-emphasis mb-1">Avg Passengers/Trip</p>
                  <p class="text-h5 font-weight-bold">{{ stats.avg_passengers_per_trip }}</p>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>
        </v-col>
      </v-row>

      <!-- Trip History -->
      <v-card rounded="xl">
        <v-card-title class="pa-5 pb-2 d-flex align-center">
          <v-icon class="mr-2" color="primary">mdi-bus-clock</v-icon>
          Trip History
        </v-card-title>
        <v-data-table
          :headers="tripHeaders"
          :items="trips"
          :items-per-page="15"
          density="compact"
          class="mt-1"
        >
          <template #item.status="{ item }">
            <v-chip
              :color="{ completed: 'success', in_progress: 'primary', scheduled: 'info', cancelled: 'error' }[item.status] || 'grey'"
              size="x-small" variant="tonal"
            >
              {{ item.status?.replace('_', ' ') }}
            </v-chip>
          </template>
        </v-data-table>
      </v-card>
    </template>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import axiosInst from '@/services/api'

const route = useRoute()
const loading = ref(true)
const driver = ref(null)
const trips = ref([])
const stats = ref({ total_trips: 0, total_passengers: 0, avg_passengers_per_trip: 0 })
const vehicle = ref(null)

const tripHeaders = [
  { title: 'Route',         key: 'route' },
  { title: 'Date',          key: 'date' },
  { title: 'Departure',     key: 'departure_time' },
  { title: 'Arrival',       key: 'arrival_time' },
  { title: 'Passengers',    key: 'passengers' },
  { title: 'Status',        key: 'status' },
]

async function load() {
  loading.value = true
  try {
    const { data } = await axiosInst.get(`/auth/drivers/${route.params.id}/full/`)
    const payload = data.data || data
    driver.value = payload
    trips.value = payload.trips || []
    stats.value = payload.stats || {}
    vehicle.value = payload.vehicle || null
  } catch {
    driver.value = null
  } finally {
    loading.value = false
  }
}

onMounted(load)
</script>
