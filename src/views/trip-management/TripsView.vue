<template>
    <div>
      <div class="d-flex align-center mb-6">
        <div>
          <h1 class="text-h5 font-weight-bold">Trips</h1>
          <p class="text-body-2 text-medium-emphasis">Manage daily trips and their status</p>
        </div>
        <v-spacer />
        <v-btn color="primary" prepend-icon="mdi-plus" rounded="lg" @click="createDialog = true">
          Create Trip
        </v-btn>
      </div>
  
      <!-- Filters -->
      <v-card rounded="xl" class="mb-4" variant="outlined">
        <v-card-text>
          <v-row dense align="center">
            <v-col cols="6" md="3">
              <v-text-field v-model="filterDate" label="Date" type="date" variant="outlined" density="compact" rounded="lg" hide-details @change="fetchTrips" />
            </v-col>
            <v-col cols="6" md="3">
              <v-select v-model="filterStatus" :items="['', 'scheduled', 'in_progress', 'completed', 'cancelled']" label="Status" variant="outlined" density="compact" rounded="lg" hide-details clearable @update:model-value="fetchTrips" />
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>
  
      <v-row>
        <v-col v-for="trip in trips" :key="trip.id" cols="12" md="6" lg="4">
          <v-card rounded="xl" :border="true" hover>
            <v-card-text>
              <div class="d-flex justify-space-between align-start mb-3">
                <div>
                  <p class="font-weight-bold text-body-1">
                    {{ trip.schedule_detail?.route_detail?.origin }}
                    <v-icon size="16">mdi-arrow-right</v-icon>
                    {{ trip.schedule_detail?.route_detail?.destination }}
                  </p>
                  <p class="text-caption text-medium-emphasis">
                    Bus {{ trip.schedule_detail?.bus_detail?.bus_number }} &bull;
                    {{ trip.schedule_detail?.departure_time }}
                  </p>
                </div>
                <v-chip :color="statusColor(trip.status)" size="small" variant="tonal">
                  {{ trip.status.replace('_', ' ') }}
                </v-chip>
              </div>
  
              <v-row dense class="text-center mb-3">
                <v-col cols="4">
                  <p class="text-caption text-medium-emphasis">Date</p>
                  <p class="text-body-2 font-weight-medium">{{ trip.date }}</p>
                </v-col>
                <v-col cols="4">
                  <p class="text-caption text-medium-emphasis">Booked</p>
                  <p class="text-body-2 font-weight-medium">{{ trip.seats_booked }}</p>
                </v-col>
                <v-col cols="4">
                  <p class="text-caption text-medium-emphasis">Available</p>
                  <p class="text-body-2 font-weight-medium">{{ trip.available_seats }}</p>
                </v-col>
              </v-row>
  
              <div class="d-flex gap-2">
                <v-btn
                  v-if="trip.status === 'scheduled'"
                  size="small" color="success" variant="tonal" rounded="lg" block
                  :loading="updatingId === trip.id"
                  @click="updateStatus(trip, 'in_progress')"
                >
                  <v-icon start>mdi-play</v-icon> Start Trip
                </v-btn>
                <v-btn
                  v-if="trip.status === 'in_progress'"
                  size="small" color="primary" variant="tonal" rounded="lg" block
                  :loading="updatingId === trip.id"
                  @click="updateStatus(trip, 'completed')"
                >
                  <v-icon start>mdi-check</v-icon> Complete
                </v-btn>
                <v-btn
                  v-if="['scheduled', 'in_progress'].includes(trip.status)"
                  size="small" color="error" variant="tonal" rounded="lg"
                  :loading="updatingId === trip.id"
                  @click="updateStatus(trip, 'cancelled')"
                >
                  <v-icon>mdi-close</v-icon>
                </v-btn>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
  
        <v-col v-if="!loading && trips.length === 0" cols="12">
          <v-empty-state icon="mdi-bus-clock" title="No trips found" text="Try adjusting the filters or create a new trip." />
        </v-col>
      </v-row>
  
      <!-- Create Trip Dialog -->
      <v-dialog v-model="createDialog" max-width="480">
        <v-card rounded="xl">
          <v-card-title class="pa-5">Create New Trip</v-card-title>
          <v-card-text>
            <v-select
              v-model="newTrip.schedule"
              :items="schedules"
              item-title="label"
              item-value="id"
              label="Schedule"
              variant="outlined"
              rounded="lg"
              class="mb-3"
            />
            <v-text-field v-model="newTrip.date" label="Date" type="date" variant="outlined" rounded="lg" />
          </v-card-text>
          <v-card-actions class="pa-5 pt-0">
            <v-spacer />
            <v-btn variant="text" @click="createDialog = false">Cancel</v-btn>
            <v-btn color="primary" variant="flat" rounded="lg" :loading="creating" @click="createTrip">Create</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
  
      <v-snackbar v-model="snack.show" :color="snack.color" rounded="lg">{{ snack.text }}</v-snackbar>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue'
  // import { transportApi } from '@/api'
  import axiosInst from '@/services/api'

  
  const trips = ref([])
  const schedules = ref([])
  const loading = ref(false)
  const filterDate = ref('')
  const filterStatus = ref('')
  const updatingId = ref(null)
  const createDialog = ref(false)
  const creating = ref(false)
  const newTrip = ref({ schedule: null, date: '' })
  const snack = ref({ show: false, text: '', color: 'success' })
  
  function statusColor(s) {
    return { scheduled: 'primary', in_progress: 'success', completed: 'grey', cancelled: 'error' }[s] || 'grey'
  }
  
  async function fetchTrips() {
    loading.value = true
    try {
      const { data } = await axiosInst.get('/transport/trips/', {
        params: {
          date: filterDate.value || undefined,
          status: filterStatus.value || undefined,
        },
      })
      trips.value = data.results || data
    } finally { loading.value = false }
  }

  async function updateStatus(trip, status) {
    updatingId.value = trip.id
    try {
      await axiosInst.patch(`/transport/trips/${trip.id}/update_status/`, { status })
      trip.status = status
      snack.value = { show: true, text: `Trip marked as ${status}.`, color: 'success' }
    } catch {
      snack.value = { show: true, text: 'Failed to update.', color: 'error' }
    } finally { updatingId.value = null }
  }

  async function createTrip() {
    creating.value = true
    try {
      await axiosInst.post('/transport/trips/', newTrip.value)
      snack.value = { show: true, text: 'Trip created.', color: 'success' }
      createDialog.value = false
      fetchTrips()
    } finally { creating.value = false }
  }

  onMounted(async () => {
    fetchTrips()
    const { data } = await axiosInst.get('/transport/schedules/')
    schedules.value = (data.results || data).map(s => ({
      id: s.id,
      label: `${s.route_detail?.origin} → ${s.route_detail?.destination} | ${s.day_label || s.day_of_week} ${s.departure_time}`,
    }))
  })
  </script>