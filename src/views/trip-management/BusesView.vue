<template>
  <div>
    <!-- Page Header -->
    <div class="d-flex align-center mb-6">
      <div>
        <h1 class="text-h5 font-weight-bold">Buses</h1>
        <p class="text-body-2 text-medium-emphasis">Register and manage the bus fleet</p>
      </div>
      <v-spacer />
      <v-btn color="primary" prepend-icon="mdi-plus" rounded="lg" @click="openCreate">
        Add Bus
      </v-btn>
    </div>

    <!-- Table Card -->
    <v-card rounded="xl">
      <v-card-text class="pb-0">
        <v-row dense>
          <v-col cols="12" md="5">
            <v-text-field
              v-model="search"
              placeholder="Search by bus number or plate..."
              prepend-inner-icon="mdi-magnify"
              variant="outlined"
              density="compact"
              rounded="lg"
              hide-details
              clearable
              class="app-field"
              @update:model-value="fetchBuses"
            />
          </v-col>
          <v-col cols="12" md="4">
            <v-select
              v-model="filterStatus"
              :items="statusFilterOptions"
              item-title="title"
              item-value="value"
              label="Status"
              variant="outlined"
              density="compact"
              rounded="lg"
              hide-details
              class="app-field"
              @update:model-value="fetchBuses"
            />
          </v-col>
        </v-row>
      </v-card-text>

      <v-data-table
        :headers="headers"
        :items="buses"
        :loading="loading"
        hover
        class="mt-2"
      >
        <!-- Bus number -->
        <template #item.bus_number="{ item }">
          <code class="font-weight-bold">{{ item.bus_number }}</code>
        </template>

        <!-- Capacity -->
        <template #item.capacity="{ item }">
          <span>{{ item.capacity }} seats</span>
        </template>

        <!-- Status chip -->
        <template #item.status="{ item }">
          <v-chip :color="statusColor(item.status)" size="small" variant="tonal">
            {{ statusLabel(item.status) }}
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
    <v-dialog v-model="formDialog" max-width="560" persistent>
      <v-card rounded="xl">
        <v-card-title class="pa-5 d-flex align-center">
          <v-icon class="mr-2" color="primary">
            {{ editTarget ? 'mdi-pencil-outline' : 'mdi-bus-plus' }}
          </v-icon>
          {{ editTarget ? 'Edit Bus' : 'Add Bus' }}
          <v-spacer />
          <v-btn icon variant="text" size="small" @click="formDialog = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>
        <v-divider />

        <v-card-text class="pa-5">
          <v-row dense>
            <v-col cols="12" sm="6">
              <v-text-field
                v-model="form.bus_number"
                label="Bus Number *"
                variant="outlined"
                rounded="lg"
                class="app-field"
              />
            </v-col>
            <v-col cols="12" sm="6">
              <v-text-field
                v-model="form.plate_number"
                label="Plate Number *"
                variant="outlined"
                rounded="lg"
                class="app-field"
              />
            </v-col>
            <v-col cols="12" sm="6">
              <v-text-field
                v-model.number="form.capacity"
                label="Capacity (seats) *"
                type="number"
                min="1"
                variant="outlined"
                rounded="lg"
                class="app-field"
              />
            </v-col>
            <v-col cols="12" sm="6">
              <v-select
                v-model="form.status"
                :items="busStatuses"
                item-title="title"
                item-value="value"
                label="Status"
                variant="outlined"
                rounded="lg"
                class="app-field"
              />
            </v-col>
            <v-col cols="12">
              <v-textarea
                v-model="form.description"
                label="Description (optional)"
                variant="outlined"
                rounded="lg"
                rows="2"
                auto-grow
                class="app-field"
              />
            </v-col>
          </v-row>
        </v-card-text>

        <v-card-actions class="pa-5 pt-0">
          <v-spacer />
          <v-btn variant="text" @click="formDialog = false">Cancel</v-btn>
          <v-btn color="primary" variant="flat" rounded="lg" :loading="saving" @click="submitForm">
            {{ editTarget ? 'Save Changes' : 'Add Bus' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Delete Confirm Dialog -->
    <v-dialog v-model="deleteDialog" max-width="400">
      <v-card rounded="xl">
        <v-card-title class="pa-5 d-flex align-center">
          <v-icon color="error" class="mr-2">mdi-alert-circle-outline</v-icon>
          Delete Bus
        </v-card-title>
        <v-card-text class="px-5">
          Delete bus <strong>{{ deleteTarget?.bus_number }}</strong>
          ({{ deleteTarget?.plate_number }})? This cannot be undone.
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

const buses        = ref([])
const loading      = ref(false)
const search       = ref('')
const filterStatus = ref('')
const formDialog   = ref(false)
const deleteDialog = ref(false)
const saving       = ref(false)
const deleting     = ref(false)
const editTarget   = ref(null)
const deleteTarget = ref(null)
const snack = ref({ show: false, text: '', color: 'success' })

const busStatuses = [
  { title: 'Active',      value: 'active' },
  { title: 'Inactive',    value: 'inactive' },
  { title: 'Maintenance', value: 'maintenance' },
]

const statusFilterOptions = [
  { title: 'All',         value: '' },
  ...busStatuses,
]

const headers = [
  { title: 'Bus Number',  key: 'bus_number' },
  { title: 'Plate',       key: 'plate_number' },
  { title: 'Capacity',    key: 'capacity' },
  { title: 'Status',      key: 'status' },
  { title: 'Description', key: 'description', sortable: false },
  { title: 'Actions',     key: 'actions', sortable: false, align: 'end' },
]

const emptyForm = () => ({
  bus_number:   '',
  plate_number: '',
  capacity:     '',
  status:       'active',
  description:  '',
})

const form = ref(emptyForm())

function statusColor(s) {
  return { active: 'success', inactive: 'grey', maintenance: 'warning' }[s] || 'grey'
}

function statusLabel(s) {
  return { active: 'Active', inactive: 'Inactive', maintenance: 'Maintenance' }[s] || s
}

function showSnack(text, color = 'success') {
  snack.value = { show: true, text, color }
}

async function fetchBuses() {
  loading.value = true
  try {
    const { data } = await axiosInst.get('/transport/buses/', {
      params: {
        search: search.value || undefined,
        status: filterStatus.value || undefined,
      },
    })
    buses.value = data.results || data
  } catch {
    showSnack('Failed to load buses.', 'error')
  } finally {
    loading.value = false
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
    bus_number:   item.bus_number,
    plate_number: item.plate_number,
    capacity:     item.capacity,
    status:       item.status,
    description:  item.description || '',
  }
  formDialog.value = true
}

async function submitForm() {
  saving.value = true
  try {
    if (editTarget.value) {
      await axiosInst.patch(`/transport/buses/${editTarget.value.id}/`, form.value)
      showSnack('Bus updated.')
    } else {
      await axiosInst.post('/transport/buses/', form.value)
      showSnack('Bus registered.')
    }
    formDialog.value = false
    fetchBuses()
  } catch (e) {
    showSnack(e?.response?.data?.detail || 'Failed to save bus.', 'error')
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
    await axiosInst.delete(`/transport/buses/${deleteTarget.value.id}/`)
    showSnack('Bus deleted.')
    deleteDialog.value = false
    fetchBuses()
  } catch {
    showSnack('Failed to delete bus.', 'error')
  } finally {
    deleting.value = false
  }
}

onMounted(fetchBuses)
</script>
