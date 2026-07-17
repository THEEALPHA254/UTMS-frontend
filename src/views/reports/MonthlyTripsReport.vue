<!-- MonthlyTripsReport.vue -->
<template>
  <div>
    <div class="d-flex align-center mb-6">
      <div>
        <h1 class="text-h5 font-weight-bold">Monthly Trips Report</h1>
        <p class="text-body-2 text-medium-emphasis">Aggregated trip data by month</p>
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
          <v-col cols="12" md="2">
            <v-btn color="primary" rounded="lg" :loading="loading" @click="load">Apply</v-btn>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <!-- Chart -->
    <v-card rounded="xl" class="mb-4">
      <v-card-title class="pa-5 pb-2 font-weight-bold">Revenue & Trips Trend</v-card-title>
      <v-card-text>
        <Bar v-if="chartData" :data="chartData" :options="chartOptions" height="60" />
        <v-skeleton-loader v-else type="image" />
      </v-card-text>
    </v-card>

    <!-- Table -->
    <v-card rounded="xl">
      <v-data-table
        :headers="headers"
        :items="rows"
        :loading="loading"
        density="compact"
      >
        <template #item.total_revenue="{ item }">KES {{ Number(item.total_revenue).toLocaleString() }}</template>
      </v-data-table>
    </v-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { Bar } from 'vue-chartjs'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js'
import axiosInst from '@/services/api'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

const loading = ref(false)
const rows = ref([])
const dateFrom = ref('')
const dateTo = ref('')
const chartData = ref(null)

const headers = [
  { title: 'Month',                key: 'month' },
  { title: 'Total Trips',          key: 'total_trips' },
  { title: 'Total Passengers',     key: 'total_passengers' },
  { title: 'Total Revenue (KES)',  key: 'total_revenue' },
  { title: 'Avg Passengers/Trip',  key: 'avg_passengers_per_trip' },
]

const chartOptions = {
  responsive: true,
  plugins: { legend: { position: 'top' } },
  scales: { y: { beginAtZero: true } },
}

async function load() {
  loading.value = true
  try {
    const { data } = await axiosInst.get('/reports/monthly-trips/', {
      params: {
        date_from: dateFrom.value || undefined,
        date_to:   dateTo.value   || undefined,
      },
    })
    rows.value = data.results || []
    chartData.value = {
      labels: rows.value.map(r => r.month),
      datasets: [
        { label: 'Total Trips',      data: rows.value.map(r => r.total_trips),      backgroundColor: 'rgba(21,101,192,0.7)', borderRadius: 6 },
        { label: 'Total Passengers', data: rows.value.map(r => r.total_passengers), backgroundColor: 'rgba(255,111,0,0.7)',  borderRadius: 6 },
      ],
    }
  } finally {
    loading.value = false
  }
}

async function exportCSV() {
  try {
    const resp = await axiosInst.get('/reports/monthly-trips/', {
      params: { export: 'csv', date_from: dateFrom.value || undefined, date_to: dateTo.value || undefined },
      responseType: 'blob',
    })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(new Blob([resp.data], { type: 'text/csv' }))
    a.download = 'monthly_trips.csv'
    a.click()
    URL.revokeObjectURL(a.href)
  } catch { console.error('Export failed') }
}

onMounted(load)
</script>
