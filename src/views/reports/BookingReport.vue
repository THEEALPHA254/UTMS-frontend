<!-- BookingReport.vue -->
<template>
  <div>
    <div class="d-flex align-center mb-6">
      <div>
        <h1 class="text-h5 font-weight-bold">Booking Reports</h1>
        <p class="text-body-2 text-medium-emphasis">All bookings with boarded/no-show breakdown</p>
      </div>
      <v-spacer />
      <v-btn color="primary" prepend-icon="mdi-download" variant="tonal" @click="exportCSV">Export CSV</v-btn>
    </div>

    <!-- Filters -->
    <v-card rounded="xl" variant="outlined" class="mb-4">
      <v-card-text>
        <v-row dense align="center">
          <v-col cols="6" md="2">
            <v-text-field v-model="dateFrom" label="From" type="date" variant="outlined" density="compact" rounded="lg" hide-details />
          </v-col>
          <v-col cols="6" md="2">
            <v-text-field v-model="dateTo" label="To" type="date" variant="outlined" density="compact" rounded="lg" hide-details />
          </v-col>
          <v-col cols="6" md="2">
            <v-select v-model="filterBoarded" :items="boardedOptions" item-title="title" item-value="value" label="Boarding" variant="outlined" density="compact" rounded="lg" hide-details />
          </v-col>
          <v-col cols="6" md="2">
            <v-select v-model="filterStatus" :items="statusOptions" item-title="title" item-value="value" label="Status" variant="outlined" density="compact" rounded="lg" hide-details />
          </v-col>
          <v-col cols="auto">
            <v-btn color="primary" rounded="lg" :loading="loading" @click="load">Apply</v-btn>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <!-- Summary chips -->
    <v-row class="mb-4" v-if="summary">
      <v-col cols="6" sm="3">
        <v-card rounded="xl" color="primary" variant="tonal">
          <v-card-text class="pa-4 text-center">
            <p class="text-caption mb-1">Total Bookings</p>
            <p class="text-h5 font-weight-bold">{{ summary.total_bookings }}</p>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="6" sm="3">
        <v-card rounded="xl" color="success" variant="tonal">
          <v-card-text class="pa-4 text-center">
            <p class="text-caption mb-1">Boarded</p>
            <p class="text-h5 font-weight-bold">{{ summary.boarded_count }}</p>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="6" sm="3">
        <v-card rounded="xl" color="warning" variant="tonal">
          <v-card-text class="pa-4 text-center">
            <p class="text-caption mb-1">No-Shows</p>
            <p class="text-h5 font-weight-bold">{{ summary.no_show_count }}</p>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="6" sm="3">
        <v-card rounded="xl" color="error" variant="tonal">
          <v-card-text class="pa-4 text-center">
            <p class="text-caption mb-1">No-Show Rate</p>
            <p class="text-h5 font-weight-bold">{{ summary.no_show_rate }}%</p>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Table -->
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
        <template #item.boarded="{ item }">
          <v-chip :color="item.boarded ? 'success' : 'warning'" size="x-small" variant="tonal">
            {{ item.boarded ? 'Boarded' : 'No-Show' }}
          </v-chip>
        </template>
        <template #item.status="{ item }">
          <v-chip
            :color="{ confirmed:'primary', completed:'success', cancelled:'error', pending:'warning', refunded:'grey' }[item.status] || 'grey'"
            size="x-small" variant="tonal"
          >{{ item.status }}</v-chip>
        </template>
        <template #item.amount_paid="{ item }">KES {{ Number(item.amount_paid).toLocaleString() }}</template>
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
const filterBoarded = ref('')
const filterStatus = ref('')
const summary = ref(null)

const boardedOptions = [
  { title: 'All',      value: '' },
  { title: 'Boarded',  value: 'true' },
  { title: 'No-Show',  value: 'false' },
]
const statusOptions = [
  { title: 'All',       value: '' },
  { title: 'Confirmed', value: 'confirmed' },
  { title: 'Completed', value: 'completed' },
  { title: 'Cancelled', value: 'cancelled' },
  { title: 'Refunded',  value: 'refunded' },
]

const headers = [
  { title: 'Admission No', key: 'admission_number' },
  { title: 'Student',      key: 'student_name' },
  { title: 'Route',        key: 'route' },
  { title: 'Date',         key: 'date' },
  { title: 'Time',         key: 'departure_time' },
  { title: 'Amount',       key: 'amount_paid' },
  { title: 'Status',       key: 'status' },
  { title: 'Boarded',      key: 'boarded' },
]

function buildParams() {
  return {
    page:      page.value,
    page_size: perPage.value,
    date_from: dateFrom.value || undefined,
    date_to:   dateTo.value   || undefined,
    boarded:   filterBoarded.value || undefined,
    status:    filterStatus.value  || undefined,
  }
}

async function load() {
  loading.value = true
  try {
    const { data } = await axiosInst.get('/reports/bookings/', { params: buildParams() })
    rows.value    = data.results || []
    total.value   = data.count   || rows.value.length
    summary.value = data.summary || null
  } finally { loading.value = false }
}

function onOptions({ page: p, itemsPerPage: pp }) { page.value = p; perPage.value = pp; load() }

async function exportCSV() {
  try {
    const resp = await axiosInst.get('/reports/bookings/', {
      params: { ...buildParams(), export: 'csv', page_size: 10000 },
      responseType: 'blob',
    })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(new Blob([resp.data], { type: 'text/csv' }))
    a.download = 'bookings.csv'
    a.click()
    URL.revokeObjectURL(a.href)
  } catch { console.error('Export failed') }
}

onMounted(load)
</script>
