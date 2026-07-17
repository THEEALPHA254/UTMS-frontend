<!-- DriverPerformanceReport.vue -->
<template>
  <div>
    <div class="d-flex align-center mb-6">
      <div>
        <h1 class="text-h5 font-weight-bold">Driver Performance Report</h1>
        <p class="text-body-2 text-medium-emphasis">Trips, passengers, and averages per driver</p>
      </div>
      <v-spacer />
      <v-btn color="primary" prepend-icon="mdi-download" variant="tonal" @click="exportCSV">Export CSV</v-btn>
    </div>

    <!-- Filters -->
    <v-card rounded="xl" variant="outlined" class="mb-4">
      <v-card-text>
        <v-row dense align="center">
          <v-col cols="6" md="3">
            <v-text-field v-model="dateFrom" label="From Date" type="date" variant="outlined" density="compact" rounded="lg" hide-details />
          </v-col>
          <v-col cols="6" md="3">
            <v-text-field v-model="dateTo" label="To Date" type="date" variant="outlined" density="compact" rounded="lg" hide-details />
          </v-col>
          <v-col cols="auto">
            <v-btn color="primary" rounded="lg" :loading="loading" @click="load">Apply</v-btn>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <v-card rounded="xl">
      <v-data-table
        :headers="headers"
        :items="rows"
        :loading="loading"
        density="compact"
      >
        <template #item.name="{ item }">
          <div class="d-flex align-center py-1">
            <v-avatar color="primary" size="32" class="mr-2">
              <span class="text-caption text-white">{{ item.name?.[0] }}</span>
            </v-avatar>
            {{ item.name }}
          </div>
        </template>
      </v-data-table>
    </v-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axiosInst from '@/services/api'

const loading = ref(false)
const rows = ref([])
const dateFrom = ref('')
const dateTo = ref('')

const headers = [
  { title: 'Driver',               key: 'name' },
  { title: 'License No.',          key: 'license_number' },
  { title: 'Assigned Vehicle',     key: 'assigned_vehicle' },
  { title: 'Total Trips',          key: 'total_trips' },
  { title: 'Completed Trips',      key: 'completed_trips' },
  { title: 'Total Passengers',     key: 'total_passengers' },
  { title: 'Avg Passengers/Trip',  key: 'avg_passengers_per_trip' },
]

async function load() {
  loading.value = true
  try {
    const { data } = await axiosInst.get('/reports/driver-performance/', {
      params: { date_from: dateFrom.value || undefined, date_to: dateTo.value || undefined },
    })
    rows.value = data.results || []
  } finally { loading.value = false }
}

async function exportCSV() {
  try {
    const resp = await axiosInst.get('/reports/driver-performance/', {
      params: { export: 'csv', date_from: dateFrom.value || undefined, date_to: dateTo.value || undefined },
      responseType: 'blob',
    })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(new Blob([resp.data], { type: 'text/csv' }))
    a.download = 'driver_performance.csv'
    a.click()
    URL.revokeObjectURL(a.href)
  } catch { console.error('Export failed') }
}

onMounted(load)
</script>
