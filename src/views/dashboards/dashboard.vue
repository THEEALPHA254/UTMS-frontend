<template>
    <div>
      <div class="d-flex align-center mb-6">
        <div>
          <h1 class="text-h5 font-weight-bold">Dashboard</h1>
          <p class="text-body-2 text-medium-emphasis">Welcome back, {{ auth.user?.first_name }}</p>
        </div>
        <v-spacer />
        <v-chip color="success" variant="tonal" prepend-icon="mdi-circle">
          System Online
        </v-chip>
      </div>
  
      <!-- KPI Cards -->
      <v-row class="mb-4">
        <v-col v-for="kpi in kpiCards" :key="kpi.title" cols="12" sm="6" lg="3">
          <v-card rounded="xl" :color="kpi.bg" variant="tonal" height="120">
            <v-card-text class="d-flex align-center pa-5 fill-height">
              <div>
                <p class="text-body-2 text-medium-emphasis mb-1">{{ kpi.title }}</p>
                <p class="text-h5 font-weight-bold">{{ kpi.value }}</p>
                <p class="text-caption text-medium-emphasis">{{ kpi.sub }}</p>
              </div>
              <v-spacer />
              <v-icon :color="kpi.color" size="40">{{ kpi.icon }}</v-icon>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
  
      <v-row>
        <!-- Revenue chart -->
        <v-col cols="12" md="8">
          <v-card rounded="xl">
            <v-card-title class="pa-5 pb-2 font-weight-bold">Revenue (Last 30 Days)</v-card-title>
            <v-card-text>
              <Bar v-if="revenueData" :data="revenueData" :options="chartOptions" height="80" />
              <v-skeleton-loader v-else type="image" />
            </v-card-text>
          </v-card>
        </v-col>
  
        <!-- Route popularity -->
        <v-col cols="12" md="4">
          <v-card rounded="xl" height="100%">
            <v-card-title class="pa-5 pb-2 font-weight-bold">Top Routes</v-card-title>
            <v-card-text>
              <Doughnut v-if="routeData" :data="routeData" :options="{ responsive: true, plugins: { legend: { position: 'bottom' } } }" />
              <v-skeleton-loader v-else type="image" />
            </v-card-text>
          </v-card>
        </v-col>
  
        <!-- Recent bookings -->
        <v-col cols="12">
          <v-card rounded="xl">
            <v-card-title class="pa-5 pb-2 font-weight-bold">Recent Bookings</v-card-title>
            <v-data-table
              :headers="bookingHeaders"
              :items="recentBookings"
              :loading="loadingBookings"
              density="compact"
              hide-default-footer
            >
              <template #item.status="{ item }">
                <v-chip :color="statusColor(item.status)" size="small" variant="tonal">
                  {{ item.status }}
                </v-chip>
              </template>
            </v-data-table>
          </v-card>
        </v-col>
      </v-row>
    </div>
  </template>
  
  <script setup>
  import { ref, computed, onMounted } from 'vue'
  import { Bar, Doughnut } from 'vue-chartjs'
  import {
    Chart as ChartJS, CategoryScale, LinearScale, BarElement,
    Title, Tooltip, Legend, ArcElement
  } from 'chart.js'
  import { useAuthStore } from '@/stores/authStore'
  import axiosInst from '@/services/api'
  
  ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement)
  
  const auth = useAuthStore()
  const summary = ref(null)
  const revenueData = ref(null)
  const routeData = ref(null)
  const recentBookings = ref([])
  const loadingBookings = ref(true)
  
  const kpiCards = computed(() => {
    if (!summary.value) return []
    const s = summary.value
    return [
      { title: 'Total Students', value: s.students.total, sub: `${s.students.active} active`, icon: 'mdi-account-group', color: 'primary', bg: 'primary' },
      { title: 'Monthly Revenue', value: `KES ${Number(s.revenue.this_month).toLocaleString()}`, sub: 'This month', icon: 'mdi-cash-multiple', color: 'success', bg: 'success' },
      { title: "Today's Trips", value: s.trips.today, sub: `${s.trips.today_completed} completed`, icon: 'mdi-bus-clock', color: 'warning', bg: 'warning' },
      { title: "Today's Bookings", value: s.bookings.today, sub: 'Confirmed', icon: 'mdi-ticket-confirmation', color: 'secondary', bg: 'secondary' },
    ]
  })
  
  const chartOptions = {
    responsive: true,
    plugins: { legend: { display: false } },
    scales: { y: { beginAtZero: true } },
  }
  
  const bookingHeaders = [
    { title: 'Student', key: 'student_name' },
    { title: 'Route', key: 'trip_detail.schedule_detail.route_detail.name' },
    { title: 'Date', key: 'trip_detail.date' },
    { title: 'Amount', key: 'amount_paid' },
    { title: 'Status', key: 'status' },
  ]
  
  function statusColor(s) {
    return { confirmed: 'success', pending: 'warning', cancelled: 'error', completed: 'primary' }[s] || 'grey'
  }

  onMounted(async () => {
    const [sumRes, revRes, routeRes, bookRes] = await Promise.allSettled([
      axiosInst.get('/reports/dashboard/'),
      axiosInst.get('/reports/revenue/'),
      axiosInst.get('/reports/trips/'),
      axiosInst.get('/transport/bookings/all/?page_size=8'),
    ])

    if (sumRes.status === 'fulfilled') summary.value = sumRes.value.data

    if (revRes.status === 'fulfilled') {
      const raw = revRes.value.data.months || []
      revenueData.value = {
        labels: raw.map(d => d.month),
        datasets: [{
          label: 'Revenue (KES)',
          data: raw.map(d => d.total),
          backgroundColor: '#1565C0',
          borderRadius: 6,
        }],
      }
    }

    if (routeRes.status === 'fulfilled') {
      const raw = (routeRes.value.data.popular_routes_this_month || []).slice(0, 6)
      const palette = ['#1565C0','#0288D1','#FF6F00','#2E7D32','#C62828','#6A1B9A']
      routeData.value = {
        labels: raw.map(d => `${d['trip__schedule__route__origin']} → ${d['trip__schedule__route__destination']}`),
        datasets: [{
          data: raw.map(d => d.bookings),
          backgroundColor: palette,
        }],
      }
    }

    if (bookRes.status === 'fulfilled') {
      recentBookings.value = bookRes.value.data.results || bookRes.value.data
    }
    loadingBookings.value = false
  })
  </script>