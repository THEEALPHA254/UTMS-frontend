<template>
    <div>
      <div class="d-flex align-center mb-6">
        <div>
          <h1 class="text-h5 font-weight-bold">Reports & Analytics</h1>
          <p class="text-body-2 text-medium-emphasis">Usage statistics and financial reports</p>
        </div>
        <v-spacer />
        <v-btn color="primary" prepend-icon="mdi-download" variant="tonal" class="mr-2" @click="exportStudents">
          Student Report
        </v-btn>
        <v-btn color="secondary" prepend-icon="mdi-download" variant="tonal" @click="exportPayments">
          Payment Report
        </v-btn>
      </div>
  
      <!-- Date range for payment export -->
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
              <v-btn color="primary" rounded="lg" @click="exportPayments">Export Payments CSV</v-btn>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>
  
      <v-row>
        <!-- Monthly revenue trend -->
        <v-col cols="12" md="8">
          <v-card rounded="xl">
            <v-card-title class="pa-5 pb-2 font-weight-bold">Monthly Revenue Trend</v-card-title>
            <v-card-text>
              <Line v-if="monthlyRevChart" :data="monthlyRevChart" :options="lineOptions" height="80" />
              <v-skeleton-loader v-else type="image" />
            </v-card-text>
          </v-card>
        </v-col>
  
        <!-- Monthly bookings -->
        <v-col cols="12" md="4">
          <v-card rounded="xl">
            <v-card-title class="pa-5 pb-2 font-weight-bold">Monthly Bookings</v-card-title>
            <v-card-text>
              <Bar v-if="monthlyBookChart" :data="monthlyBookChart" :options="barOptions" height="140" />
              <v-skeleton-loader v-else type="image" />
            </v-card-text>
          </v-card>
        </v-col>
  
        <!-- Route popularity table -->
        <v-col cols="12" md="6">
          <v-card rounded="xl">
            <v-card-title class="pa-5 pb-0 font-weight-bold">Route Popularity</v-card-title>
            <v-data-table
              :headers="routeHeaders"
              :items="routeStats"
              :loading="loading"
              density="compact"
              hide-default-footer
            >
              <template #item.revenue="{ item }">KES {{ Number(item.revenue || 0).toLocaleString() }}</template>
            </v-data-table>
          </v-card>
        </v-col>
  
        <!-- Top students table -->
        <v-col cols="12" md="6">
          <v-card rounded="xl">
            <v-card-title class="pa-5 pb-0 font-weight-bold">Top Active Students</v-card-title>
            <v-data-table
              :headers="studentHeaders"
              :items="topStudents"
              :loading="loading"
              density="compact"
              hide-default-footer
            >
              <template #item.total_spent="{ item }">KES {{ Number(item.total_spent || 0).toLocaleString() }}</template>
            </v-data-table>
          </v-card>
        </v-col>
      </v-row>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue'
  import { Bar, Line } from 'vue-chartjs'
  import {
    Chart as ChartJS, CategoryScale, LinearScale, BarElement,
    LineElement, PointElement, Title, Tooltip, Legend, Filler
  } from 'chart.js'
  //import { axiosInst } from '@/api'
  import axiosInst from '@/services/api'
  
  ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend, Filler)
  
  const loading = ref(false)
  const monthlyRevChart = ref(null)
  const monthlyBookChart = ref(null)
  const routeStats = ref([])
  const topStudents = ref([])
  const dateFrom = ref('')
  const dateTo = ref('')
  
  const lineOptions = {
    responsive: true,
    plugins: { legend: { display: false } },
    scales: { y: { beginAtZero: true } },
  }
  const barOptions = {
    responsive: true,
    plugins: { legend: { display: false } },
    scales: { y: { beginAtZero: true } },
  }
  
  const routeHeaders = [
    { title: 'Origin', key: 'trip__schedule__route__origin' },
    { title: 'Destination', key: 'trip__schedule__route__destination' },
    { title: 'Bookings', key: 'bookings' },
  ]
  const studentHeaders = [
    { title: 'First Name', key: 'student__first_name' },
    { title: 'Last Name', key: 'student__last_name' },
    { title: 'Admission', key: 'student__student_profile__admission_number' },
    { title: 'Trips', key: 'trips' },
  ]

  const apiBase = import.meta.env.VITE_BASE_API_URL || 'http://127.0.0.1:8000/api'

  function exportStudents() {
    window.open(`${apiBase}/reports/students/?export=csv`, '_blank')
  }
  function exportPayments() {
    const params = new URLSearchParams({ export: 'csv' })
    if (dateFrom.value) params.set('from', dateFrom.value)
    if (dateTo.value) params.set('to', dateTo.value)
    window.open(`${apiBase}/reports/revenue/?${params}`, '_blank')
  }

  onMounted(async () => {
    loading.value = true
    const [monthly, trips, students] = await Promise.allSettled([
      axiosInst.get('/reports/revenue/'),
      axiosInst.get('/reports/trips/'),
      axiosInst.get('/reports/students/'),
    ])

    if (monthly.status === 'fulfilled') {
      const months_data = monthly.value.data.months || []
      monthlyRevChart.value = {
        labels: months_data.map(d => d.month),
        datasets: [{ label: 'Revenue (KES)', data: months_data.map(d => d.trip_revenue), borderColor: '#1565C0', backgroundColor: 'rgba(21,101,192,0.1)', fill: true, tension: 0.4 }],
      }
      monthlyBookChart.value = {
        labels: months_data.map(d => d.month),
        datasets: [{ label: 'Wallet Top-Ups (KES)', data: months_data.map(d => d.wallet_topups), backgroundColor: '#FF6F00', borderRadius: 6 }],
      }
    }
    if (trips.status === 'fulfilled') routeStats.value = trips.value.data.popular_routes_this_month || []
    if (students.status === 'fulfilled') topStudents.value = (students.value.data.top_users || []).slice(0, 8)

    loading.value = false
  })
  </script>