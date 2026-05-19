<template>
    <div>
      <div class="d-flex align-center mb-6">
        <div>
          <h1 class="text-h5 font-weight-bold">Bookings</h1>
          <p class="text-body-2 text-medium-emphasis">All student trip bookings</p>
        </div>
        <v-spacer />
        <v-btn color="primary" prepend-icon="mdi-qrcode-scan" rounded="lg" @click="boardingDialog = true">
          Scan QR / Board
        </v-btn>
      </div>
  
      <v-card rounded="xl">
        <v-card-text class="pb-0">
          <v-row dense>
            <v-col cols="12" md="5">
              <v-text-field v-model="search" placeholder="Search student name or admission no..." prepend-inner-icon="mdi-magnify" variant="outlined" density="compact" rounded="lg" hide-details clearable @update:model-value="fetchBookings" />
            </v-col>
            <v-col cols="6" md="3">
              <v-select v-model="filterStatus" :items="['', 'confirmed', 'pending', 'cancelled', 'completed']" label="Status" variant="outlined" density="compact" rounded="lg" hide-details clearable @update:model-value="fetchBookings" />
            </v-col>
          </v-row>
        </v-card-text>
  
        <v-data-table-server
          v-model:items-per-page="perPage"
          :headers="headers"
          :items="bookings"
          :items-length="total"
          :loading="loading"
          @update:options="onOptions"
        >
          <template #item.student_name="{ item }">
            <span class="font-weight-medium">{{ item.student_name }}</span>
          </template>
          <template #item.route="{ item }">
            {{ item.trip_detail?.schedule_detail?.route_detail?.name || '—' }}
          </template>
          <template #item.date="{ item }">
            {{ item.trip_detail?.date }}
          </template>
          <template #item.amount_paid="{ item }">
            KES {{ item.amount_paid }}
          </template>
          <template #item.boarded="{ item }">
            <v-icon :color="item.boarded ? 'success' : 'grey'">
              {{ item.boarded ? 'mdi-check-circle' : 'mdi-circle-outline' }}
            </v-icon>
          </template>
          <template #item.status="{ item }">
            <v-chip :color="statusColor(item.status)" size="small" variant="tonal">{{ item.status }}</v-chip>
          </template>
          <template #item.created_at="{ item }">
            {{ new Date(item.created_at).toLocaleDateString() }}
          </template>
        </v-data-table-server>
      </v-card>
  
      <!-- QR / Manual Boarding Dialog -->
      <v-dialog v-model="boardingDialog" max-width="440">
        <v-card rounded="xl">
          <v-card-title class="pa-5">Mark Student as Boarded</v-card-title>
          <v-card-text>
            <v-text-field
              v-model="qrInput"
              label="Enter QR Code / Booking Reference"
              variant="outlined"
              rounded="lg"
              prepend-inner-icon="mdi-qrcode"
              placeholder="Scan or paste QR token"
              autofocus
              @keyup.enter="markBoarded"
            />
            <v-alert v-if="boardResult" :type="boardResult.type" variant="tonal" rounded="lg" class="mt-2">
              {{ boardResult.message }}
            </v-alert>
          </v-card-text>
          <v-card-actions class="pa-5 pt-0">
            <v-spacer />
            <v-btn variant="text" @click="boardingDialog = false; boardResult = null">Close</v-btn>
            <v-btn color="primary" variant="flat" rounded="lg" :loading="boarding" @click="markBoarded">
              Confirm Boarding
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue'
  // import { transportApi } from '@/api'
  import axiosInst from '@/services/api'

  
  const bookings = ref([])
  const total = ref(0)
  const loading = ref(false)
  const page = ref(1)
  const perPage = ref(15)
  const search = ref('')
  const filterStatus = ref('')
  const boardingDialog = ref(false)
  const qrInput = ref('')
  const boarding = ref(false)
  const boardResult = ref(null)
  
  const headers = [
    { title: 'Student', key: 'student_name' },
    { title: 'Route', key: 'route', sortable: false },
    { title: 'Date', key: 'date', sortable: false },
    { title: 'Amount', key: 'amount_paid' },
    { title: 'Boarded', key: 'boarded' },
    { title: 'Status', key: 'status' },
    { title: 'Booked On', key: 'created_at' },
  ]
  
  function statusColor(s) {
    return { confirmed: 'success', pending: 'warning', cancelled: 'error', completed: 'primary' }[s] || 'grey'
  }
  
  async function fetchBookings() {
    loading.value = true
    try {
      const { data } = await axiosInst.get('/transport/bookings/all/', {
        params: {
          page: page.value,
          page_size: perPage.value,
          search: search.value || undefined,
          status: filterStatus.value || undefined,
        },
      })
      bookings.value = data.results || data
      total.value = data.count || bookings.value.length
    } finally { loading.value = false }
  }
  
  function onOptions({ page: p, itemsPerPage: pp }) {
    page.value = p; perPage.value = pp; fetchBookings()
  }
  
  async function markBoarded() {
    if (!qrInput.value.trim()) return
    boarding.value = true
    boardResult.value = null
    try {
      const { data } = await axiosInst.post('/transport/bookings/board/', { qr_code: qrInput.value.trim() })
      boardResult.value = { type: 'success', message: `✓ ${data.message} — ${data.student}` }
      qrInput.value = ''
      fetchBookings()
    } catch (e) {
      boardResult.value = { type: 'error', message: e.response?.data?.error || 'Invalid QR code.' }
    } finally { boarding.value = false }
  }
  
  onMounted(fetchBookings)
  </script>