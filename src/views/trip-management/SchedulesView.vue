<template>
  <div>
    <!-- Page Header -->
    <div class="d-flex align-center mb-6">
      <div>
        <h1 class="text-h5 font-weight-bold">Schedules</h1>
        <p class="text-body-2 text-medium-emphasis">Manage recurring bus schedules</p>
      </div>
      <v-spacer />
      <v-btn color="primary" prepend-icon="mdi-plus" rounded="lg" @click="openCreate">
        Add Schedule
      </v-btn>
    </div>

    <!-- Table Card -->
    <v-card rounded="xl">
      <v-card-text class="pb-0">
        <v-row dense>
          <v-col cols="12" md="4">
            <v-select
              v-model="filterDay"
              :items="dayOptions"
              item-title="label"
              item-value="value"
              label="Day of Week"
              variant="outlined"
              density="compact"
              rounded="lg"
              hide-details
              clearable
              class="app-field"
              @update:model-value="fetchSchedules"
            />
          </v-col>
          <v-col cols="12" md="4">
            <v-select
              v-model="filterActive"
              :items="statusOptions"
              item-title="title"
              item-value="value"
              label="Status"
              variant="outlined"
              density="compact"
              rounded="lg"
              hide-details
              class="app-field"
              @update:model-value="fetchSchedules"
            />
          </v-col>
        </v-row>
      </v-card-text>

      <v-data-table
        :headers="headers"
        :items="schedules"
        :loading="loading"
        hover
        class="mt-2"
      >
        <!-- Route -->
        <template #item.route="{ item }">
          <span class="font-weight-medium">
            {{ item.route_detail?.origin }} → {{ item.route_detail?.destination }}
          </span>
        </template>

        <!-- Bus -->
        <template #item.bus="{ item }">
          {{ item.bus_detail?.bus_number }}
          <span class="text-caption text-medium-emphasis ml-1">{{ item.bus_detail?.plate_number }}</span>
        </template>

        <!-- Day -->
        <template #item.day_of_week="{ item }">
          {{ item.day_label || dayOptions[item.day_of_week]?.label }}
        </template>

        <!-- Times -->
        <template #item.departure_time="{ item }">
          {{ item.departure_time?.slice(0, 5) }}
        </template>
        <template #item.arrival_time="{ item }">
          {{ item.arrival_time?.slice(0, 5) }}
        </template>

        <!-- Status -->
        <template #item.is_active="{ item }">
          <v-chip :color="item.is_active ? 'success' : 'grey'" size="small" variant="tonal">
            {{ item.is_active ? 'Active' : 'Inactive' }}
          </v-chip>
        </template>

        <!-- Actions -->
        <template #item.actions="{ item }">
          <v-btn icon size="small" variant="text" @click="openEdit(item)">
            <v-icon>mdi-pencil-outline</v-icon>
          </v-btn>
          <v-btn icon size="small" variant="text" color="error" @click="handleDelete(item)">
            <v-icon>mdi-delete-outline</v-icon>
          </v-btn>
        </template>
      </v-data-table>
    </v-card>

    <!-- Create / Edit Dialog -->
    <v-dialog v-model="formDialog" max-width="520" persistent>
      <v-card rounded="xl">
        <v-card-title class="pa-5 d-flex align-center">
          <v-icon class="mr-2" color="primary">
            {{ editTarget ? 'mdi-pencil-outline' : 'mdi-calendar-plus' }}
          </v-icon>
          {{ editTarget ? 'Edit Schedule' : 'Add Schedule' }}
          <v-spacer />
          <v-btn icon variant="text" size="small" @click="formDialog = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>
        <v-divider />

        <v-card-text class="pa-5">
          <v-row dense>
            <v-col cols="12">
              <v-select
                v-model="form.route"
                :items="routes"
                item-title="label"
                item-value="id"
                label="Route *"
                variant="outlined"
                rounded="lg"
                :loading="loadingRoutes"
                class="app-field"
              />
            </v-col>
            <v-col cols="12">
              <v-select
                v-model="form.bus"
                :items="buses"
                item-title="label"
                item-value="id"
                label="Bus *"
                variant="outlined"
                rounded="lg"
                :loading="loadingBuses"
                class="app-field"
              />
            </v-col>
            <v-col cols="12" sm="6">
              <v-select
                v-model="form.day_of_week"
                :items="dayOptions"
                item-title="label"
                item-value="value"
                label="Day of Week *"
                variant="outlined"
                rounded="lg"
                class="app-field"
              />
            </v-col>
            <v-col cols="12" sm="6">
              <v-select
                v-model="form.is_active"
                :items="[{ title: 'Active', value: true }, { title: 'Inactive', value: false }]"
                item-title="title"
                item-value="value"
                label="Status"
                variant="outlined"
                rounded="lg"
                class="app-field"
              />
            </v-col>
            <v-col cols="12" sm="6">
              <v-text-field
                v-model="form.departure_time"
                label="Departure Time *"
                type="time"
                variant="outlined"
                rounded="lg"
                class="app-field"
              />
            </v-col>
            <v-col cols="12" sm="6">
              <v-text-field
                v-model="form.arrival_time"
                label="Arrival Time *"
                type="time"
                variant="outlined"
                rounded="lg"
                class="app-field"
              />
            </v-col>
          </v-row>
        </v-card-text>

        <v-card-actions class="pa-5 pt-0">
          <v-spacer />
          <v-btn variant="text" @click="formDialog = false">Cancel</v-btn>
          <v-btn color="primary" variant="flat" rounded="lg" :loading="saving" @click="submitForm">
            {{ editTarget ? 'Save Changes' : 'Create Schedule' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Delete Confirm Dialog -->
    <v-dialog v-model="deleteDialog" max-width="400">
      <v-card rounded="xl">
        <v-card-title class="pa-5 d-flex align-center">
          <v-icon color="error" class="mr-2">mdi-alert-circle-outline</v-icon>
          Delete Schedule
        </v-card-title>
        <v-card-text class="px-5">
          Delete the schedule for
          <strong>
            {{ deleteTarget?.route_detail?.origin }} → {{ deleteTarget?.route_detail?.destination }}
          </strong>
          on <strong>{{ dayOptions[deleteTarget?.day_of_week]?.label }}</strong>? This cannot be undone.
        </v-card-text>
        <v-card-actions class="pa-5 pt-0">
          <v-spacer />
          <v-btn variant="text" @click="deleteDialog = false">Cancel</v-btn>
          <v-btn color="error" variant="flat" rounded="lg" :loading="deleting" @click="confirmDelete">
            Delete
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-snackbar v-model="snack.show" :color="snack.color" rounded="lg">
      {{ snack.text }}
    </v-snackbar>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axiosInst from '@/services/api'

const schedules     = ref([])
const routes        = ref([])
const buses         = ref([])
const loading       = ref(false)
const loadingRoutes = ref(false)
const loadingBuses  = ref(false)
const filterDay     = ref(null)
const filterActive  = ref('')
const formDialog    = ref(false)
const deleteDialog  = ref(false)
const saving        = ref(false)
const deleting      = ref(false)
const editTarget    = ref(null)
const deleteTarget  = ref(null)
const snack = ref({ show: false, text: '', color: 'success' })

const dayOptions = [
  { value: 0, label: 'Monday' },
  { value: 1, label: 'Tuesday' },
  { value: 2, label: 'Wednesday' },
  { value: 3, label: 'Thursday' },
  { value: 4, label: 'Friday' },
  { value: 5, label: 'Saturday' },
  { value: 6, label: 'Sunday' },
]

const statusOptions = [
  { title: 'All',      value: '' },
  { title: 'Active',   value: true },
  { title: 'Inactive', value: false },
]

const headers = [
  { title: 'Route',      key: 'route',          sortable: false },
  { title: 'Bus',        key: 'bus',            sortable: false },
  { title: 'Day',        key: 'day_of_week' },
  { title: 'Departure',  key: 'departure_time' },
  { title: 'Arrival',    key: 'arrival_time' },
  { title: 'Status',     key: 'is_active' },
  { title: 'Actions',    key: 'actions', sortable: false, align: 'end' },
]

const emptyForm = () => ({
  route: null,
  bus: null,
  day_of_week: null,
  departure_time: '',
  arrival_time: '',
  is_active: true,
})

const form = ref(emptyForm())

function showSnack(text, color = 'success') {
  snack.value = { show: true, text, color }
}

async function fetchSchedules() {
  loading.value = true
  try {
    const params = {
      day_of_week: filterDay.value ?? undefined,
      is_active:   filterActive.value === '' ? undefined : filterActive.value,
    }
    const { data } = await axiosInst.get('/transport/schedules/', { params })
    schedules.value = data.results || data
  } catch {
    showSnack('Failed to load schedules.', 'error')
  } finally {
    loading.value = false
  }
}

async function loadRoutes() {
  loadingRoutes.value = true
  try {
    const { data } = await axiosInst.get('/transport/routes/', { params: { is_active: true } })
    routes.value = (data.results || data).map(r => ({
      id: r.id,
      label: `${r.origin} → ${r.destination}`,
    }))
  } finally {
    loadingRoutes.value = false
  }
}

async function loadBuses() {
  loadingBuses.value = true
  try {
    const { data } = await axiosInst.get('/transport/buses/')
    buses.value = (data.results || data).map(b => ({
      id: b.id,
      label: `${b.bus_number} — ${b.plate_number}`,
    }))
  } finally {
    loadingBuses.value = false
  }
}

function openCreate() {
  editTarget.value = null
  form.value = emptyForm()
  formDialog.value = true
}

function openEdit(item) {
  editTarget.value = item
  form.value = {
    route:          item.route,
    bus:            item.bus,
    day_of_week:    item.day_of_week,
    departure_time: item.departure_time?.slice(0, 5),
    arrival_time:   item.arrival_time?.slice(0, 5),
    is_active:      item.is_active,
  }
  formDialog.value = true
}

function toTimeString(t) {
  return t && t.length === 5 ? `${t}:00` : t
}

async function submitForm() {
  saving.value = true
  try {
    const payload = {
      ...form.value,
      departure_time: toTimeString(form.value.departure_time),
      arrival_time:   toTimeString(form.value.arrival_time),
    }
    if (editTarget.value) {
      await axiosInst.patch(`/transport/schedules/${editTarget.value.id}/`, payload)
      showSnack('Schedule updated.')
    } else {
      await axiosInst.post('/transport/schedules/', payload)
      showSnack('Schedule created.')
    }
    formDialog.value = false
    fetchSchedules()
  } catch (e) {
    showSnack(e?.response?.data?.detail || 'Failed to save schedule.', 'error')
  } finally {
    saving.value = false
  }
}

function handleDelete(item) {
  deleteTarget.value = item
  deleteDialog.value = true
}

async function confirmDelete() {
  deleting.value = true
  try {
    await axiosInst.delete(`/transport/schedules/${deleteTarget.value.id}/`)
    showSnack('Schedule deleted.')
    deleteDialog.value = false
    fetchSchedules()
  } catch {
    showSnack('Failed to delete schedule.', 'error')
  } finally {
    deleting.value = false
  }
}

onMounted(() => {
  fetchSchedules()
  loadRoutes()
  loadBuses()
})
</script>
