<!-- StudentDetailView.vue -->
<template>
  <div>
    <!-- Back button + header -->
    <div class="d-flex align-center mb-6">
      <v-btn icon variant="text" :to="{ name: 'students' }" class="mr-2">
        <v-icon>mdi-arrow-left</v-icon>
      </v-btn>
      <div>
        <h1 class="text-h5 font-weight-bold">Student Details</h1>
        <p class="text-body-2 text-medium-emphasis">Full profile, bookings &amp; wallet history</p>
      </div>
    </div>

    <div v-if="loading" class="d-flex justify-center pa-10">
      <v-progress-circular indeterminate color="primary" />
    </div>

    <div v-else-if="!student" class="text-center pa-10">
      <v-icon size="64" color="grey">mdi-account-off-outline</v-icon>
      <p class="text-medium-emphasis mt-2">Student not found.</p>
    </div>

    <template v-else>
      <!-- Profile Card -->
      <v-row class="mb-4">
        <v-col cols="12" md="4">
          <v-card rounded="xl" height="100%">
            <v-card-text class="pa-6 text-center">
              <v-avatar color="primary" size="80" class="mb-4">
                <span class="text-h5 text-white font-weight-bold">
                  {{ student.first_name?.[0] }}{{ student.last_name?.[0] }}
                </span>
              </v-avatar>
              <h2 class="text-h6 font-weight-bold">{{ student.first_name }} {{ student.last_name }}</h2>
              <p class="text-caption text-medium-emphasis">{{ student.email }}</p>
              <v-chip
                :color="tsColor(student.student_profile?.transport_status)"
                size="small"
                variant="tonal"
                class="mt-2"
              >
                {{ student.student_profile?.transport_status || '—' }}
              </v-chip>
            </v-card-text>
            <v-divider />
            <v-list density="compact" class="pa-2">
              <v-list-item prepend-icon="mdi-card-account-details-outline" title="Admission No">
                <template #subtitle><code>{{ student.student_profile?.admission_number || '—' }}</code></template>
              </v-list-item>
              <v-list-item prepend-icon="mdi-phone-outline" title="Phone">
                <template #subtitle>{{ student.phone_number || '—' }}</template>
              </v-list-item>
              <v-list-item prepend-icon="mdi-school-outline" title="Faculty">
                <template #subtitle>{{ student.student_profile?.faculty || '—' }}</template>
              </v-list-item>
              <v-list-item prepend-icon="mdi-account-check-outline" title="Account Status">
                <template #subtitle>
                  <v-chip :color="student.is_active ? 'success' : 'error'" size="x-small" variant="tonal">
                    {{ student.is_active ? 'Active' : 'Inactive' }}
                  </v-chip>
                </template>
              </v-list-item>
              <v-list-item prepend-icon="mdi-calendar-outline" title="Joined">
                <template #subtitle>{{ formatDate(student.date_joined) }}</template>
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
                  <p class="text-caption text-medium-emphasis mb-1">Wallet Balance</p>
                  <p class="text-h5 font-weight-bold">KES {{ (student.student_profile?.wallet_balance ?? 0).toLocaleString() }}</p>
                </v-card-text>
              </v-card>
            </v-col>
            <v-col cols="12" sm="4">
              <v-card rounded="xl" color="success" variant="tonal">
                <v-card-text class="pa-5 text-center">
                  <p class="text-caption text-medium-emphasis mb-1">Total Trips</p>
                  <p class="text-h5 font-weight-bold">{{ stats.total_trips }}</p>
                </v-card-text>
              </v-card>
            </v-col>
            <v-col cols="12" sm="4">
              <v-card rounded="xl" color="info" variant="tonal">
                <v-card-text class="pa-5 text-center">
                  <p class="text-caption text-medium-emphasis mb-1">Total Spent</p>
                  <p class="text-h5 font-weight-bold">KES {{ (stats.total_spent ?? 0).toLocaleString() }}</p>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>
        </v-col>
      </v-row>

      <!-- Booking History -->
      <v-card rounded="xl" class="mb-4">
        <v-card-title class="pa-5 pb-2 d-flex align-center">
          <v-icon class="mr-2" color="primary">mdi-ticket-outline</v-icon>
          Booking History
        </v-card-title>
        <v-data-table
          :headers="bookingHeaders"
          :items="bookings"
          :items-per-page="10"
          density="compact"
          class="mt-1"
        >
          <template #item.boarded="{ item }">
            <v-chip :color="item.boarded ? 'success' : 'warning'" size="x-small" variant="tonal">
              {{ item.boarded ? 'Boarded' : 'No-Show' }}
            </v-chip>
          </template>
          <template #item.status="{ item }">
            <v-chip
              :color="{ confirmed: 'primary', completed: 'success', cancelled: 'error', pending: 'warning', refunded: 'grey' }[item.status] || 'grey'"
              size="x-small" variant="tonal"
            >
              {{ item.status }}
            </v-chip>
          </template>
          <template #item.amount_paid="{ item }">
            KES {{ Number(item.amount_paid).toLocaleString() }}
          </template>
        </v-data-table>
      </v-card>

      <!-- Wallet Transactions -->
      <v-card rounded="xl">
        <v-card-title class="pa-5 pb-2 d-flex align-center">
          <v-icon class="mr-2" color="success">mdi-wallet-outline</v-icon>
          Wallet Transactions
        </v-card-title>
        <v-data-table
          :headers="txnHeaders"
          :items="transactions"
          :items-per-page="10"
          density="compact"
          class="mt-1"
        >
          <template #item.type="{ item }">
            <v-chip
              :color="{ wallet_topup: 'success', trip_payment: 'primary', refund: 'info' }[item.type] || 'grey'"
              size="x-small" variant="tonal"
            >
              {{ item.type.replace(/_/g, ' ') }}
            </v-chip>
          </template>
          <template #item.amount="{ item }">
            <span :class="item.type === 'wallet_topup' ? 'text-success font-weight-bold' : ''">
              {{ item.type === 'wallet_topup' ? '+' : '-' }}KES {{ Number(item.amount).toLocaleString() }}
            </span>
          </template>
          <template #item.status="{ item }">
            <v-chip :color="{ success: 'success', pending: 'warning', failed: 'error' }[item.status] || 'grey'" size="x-small" variant="tonal">
              {{ item.status }}
            </v-chip>
          </template>
          <template #item.created_at="{ item }">
            {{ formatDate(item.created_at) }}
          </template>
        </v-data-table>
      </v-card>
    </template>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import axiosInst from '@/services/api'

const route = useRoute()
const loading = ref(true)
const student = ref(null)
const bookings = ref([])
const transactions = ref([])
const stats = ref({ total_trips: 0, total_spent: 0 })

const bookingHeaders = [
  { title: 'Route',     key: 'route' },
  { title: 'Date',      key: 'date' },
  { title: 'Time',      key: 'departure_time' },
  { title: 'Amount',    key: 'amount_paid' },
  { title: 'Status',    key: 'status' },
  { title: 'Boarded',   key: 'boarded' },
]

const txnHeaders = [
  { title: 'Reference', key: 'reference' },
  { title: 'Type',      key: 'type' },
  { title: 'Method',    key: 'method' },
  { title: 'Amount',    key: 'amount' },
  { title: 'Status',    key: 'status' },
  { title: 'Date',      key: 'created_at' },
]

function tsColor(s) {
  return { active: 'success', inactive: 'grey', suspended: 'error' }[s] || 'grey'
}

function formatDate(d) {
  return d ? new Date(d).toLocaleDateString() : '—'
}

async function loadStudent() {
  loading.value = true
  try {
    const profileId = route.params.id
    const { data } = await axiosInst.get(`/auth/students/${profileId}/full/`)
    const payload = data.data || data
    student.value = payload
    bookings.value = payload.bookings || []
    transactions.value = payload.transactions || []
    stats.value = payload.stats || { total_trips: 0, total_spent: 0 }
  } catch {
    student.value = null
  } finally {
    loading.value = false
  }
}

onMounted(loadStudent)
</script>
