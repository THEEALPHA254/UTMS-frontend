<!-- VehicleOccupancyReport.vue -->
<template>
  <div>
    <div class="d-flex align-center mb-6">
      <div>
        <h1 class="text-h5 font-weight-bold">Vehicle Occupancy Report</h1>
        <p class="text-body-2 text-medium-emphasis">Per-trip occupancy for all vehicles</p>
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
      <v-data-table-server
        v-model:items-per-page="perPage"
        :headers="headers"
        :items="rows"
        :items-length="total"
        :loading="loading"
        :page="page"
        density="compact"
        @update:options="onOptions"
      >
        <template #item.occupancy_pct="{ item }">
          <v-chip
            :color="item.occupancy_pct >= 80 ? 'success' : item.occupancy_pct >= 50 ? 'warning' : 'error'"
            size="small" variant="tonal"
          >
            {{ item.occupancy_pct }}%
          </v-chip>
        </template>
      </v-data-table-server>
    </v-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axiosInst from '@/services/api'

const loading = ref(false)
const rows = ref([])
const total = ref(0)
const page = ref(1)
const perPage = ref(20)
const dateFrom = ref('')
const dateTo = ref('')

const headers = [
  { title: 'Date',         key: 'date' },
  { title: 'Route',        key: 'route' },
  { title: 'Vehicle',      key: 'plate_number' },
  { title: 'Driver',       key: 'driver' },
  { title: 'Booked',       key: 'seats_booked' },
  { title: 'Boarded',      key: 'boarded' },
  { title: 'Capacity',     key: 'capacity' },
  { title: 'Occupancy %',  key: 'occupancy_pct' },
]

function buildParams() {
  return { page: page.value, page_size: perPage.value, date_from: dateFrom.value || undefined, date_to: dateTo.value || undefined }
}

async function load() {
  loading.value = true
  try {
    const { data } = await axiosInst.get('/reports/vehicle-occupancy/', { params: buildParams() })
    rows.value  = data.results || []
    total.value = data.count   || rows.value.length
  } finally { loading.value = false }
}

function onOptions({ page: p, itemsPerPage: pp }) { page.value = p; perPage.value = pp; load() }

async function exportCSV() {
  try {
    const resp = await axiosInst.get('/reports/vehicle-occupancy/', {
      params: { ...buildParams(), export: 'csv', page_size: 10000 },
      responseType: 'blob',
    })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(new Blob([resp.data], { type: 'text/csv' }))
    a.download = 'vehicle_occupancy.csv'
    a.click()
    URL.revokeObjectURL(a.href)
  } catch { console.error('Export failed') }
}

onMounted(load)
</script>
