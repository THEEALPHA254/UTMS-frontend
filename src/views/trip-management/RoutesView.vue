<template>
  <div>
    <!-- Page Header -->
    <div class="d-flex align-center mb-6">
      <div>
        <h1 class="text-h5 font-weight-bold">Routes</h1>
        <p class="text-body-2 text-medium-emphasis">Manage bus routes and fares</p>
      </div>
      <v-spacer />
      <v-btn color="primary" prepend-icon="mdi-plus" rounded="lg" @click="openCreate">
        Add Route
      </v-btn>
    </div>

    <!-- Routes Table -->
    <v-card rounded="xl">
      <v-card-text class="pb-0">
        <v-row dense>
          <v-col cols="12" md="5">
            <v-text-field
              v-model="search"
              placeholder="Search routes..."
              prepend-inner-icon="mdi-magnify"
              variant="outlined"
              density="compact"
              rounded="lg"
              hide-details
              clearable
              class="app-field"
              @update:model-value="fetchRoutes"
            />
          </v-col>
          <v-col cols="6" md="3">
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
              @update:model-value="fetchRoutes"
            />
          </v-col>
        </v-row>
      </v-card-text>

      <v-data-table
        :headers="headers"
        :items="routes"
        :loading="loading"
        :search="search"
        hover
        class="mt-2"
      >
        <!-- Fare -->
        <template #item.fare="{ item }">
          <span class="font-weight-medium">KES {{ Number(item.fare).toLocaleString() }}</span>
        </template>

        <!-- Distance -->
        <template #item.distance_km="{ item }">
          {{ item.distance_km }} km
        </template>

        <!-- Stops count -->
        <template #item.stops="{ item }">
          <v-chip
            v-if="item.stops?.length"
            size="small"
            variant="tonal"
            color="primary"
            @click="viewStops(item)"
            style="cursor: pointer"
          >
            {{ item.stops.length }} stop{{ item.stops.length !== 1 ? 's' : '' }}
          </v-chip>
          <span v-else class="text-medium-emphasis text-caption">—</span>
        </template>

        <!-- Status chip -->
        <template #item.is_active="{ item }">
          <v-chip
            :color="item.is_active ? 'success' : 'grey'"
            size="small"
            variant="tonal"
          >
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
    <v-dialog v-model="formDialog" max-width="640" persistent scrollable>
      <v-card rounded="xl">
        <v-card-title class="pa-5 d-flex align-center">
          <v-icon class="mr-2" color="primary">
            {{ editTarget ? 'mdi-pencil-outline' : 'mdi-map-marker-path' }}
          </v-icon>
          {{ editTarget ? 'Edit Route' : 'Add Route' }}
          <v-spacer />
          <v-btn icon variant="text" size="small" @click="formDialog = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>
        <v-divider />

        <v-card-text class="pa-5">
          <!-- Basic route fields -->
          <v-row dense>
            <v-col cols="12">
              <v-text-field
                v-model="form.name"
                label="Route Name *"
                variant="outlined"
                rounded="lg"
                class="app-field"
              />
            </v-col>
            <v-col cols="12" sm="6">
              <v-text-field
                v-model="form.origin"
                label="Origin *"
                variant="outlined"
                rounded="lg"
                class="app-field"
              />
            </v-col>
            <v-col cols="12" sm="6">
              <v-text-field
                v-model="form.destination"
                label="Destination *"
                variant="outlined"
                rounded="lg"
                class="app-field"
              />
            </v-col>
            <v-col cols="12" sm="6">
              <v-text-field
                v-model.number="form.fare"
                label="Fare (KES) *"
                type="number"
                min="0"
                variant="outlined"
                rounded="lg"
                class="app-field"
              />
            </v-col>
            <v-col cols="12" sm="6">
              <v-text-field
                v-model.number="form.distance_km"
                label="Distance (km)"
                type="number"
                min="0"
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

          <!-- Stops section -->
          <div class="mt-2">
            <div class="d-flex align-center mb-3">
              <p class="text-body-2 font-weight-semibold">Stops</p>
              <v-spacer />
              <v-btn
                size="small"
                variant="tonal"
                color="primary"
                prepend-icon="mdi-plus"
                rounded="lg"
                @click="addStop"
              >
                Add Stop
              </v-btn>
            </div>

            <p v-if="form.stops.length === 0" class="text-caption text-medium-emphasis mb-0">
              No stops added. Stops are intermediate points between origin and destination.
            </p>

            <div
              v-for="(stop, i) in form.stops"
              :key="i"
              class="d-flex align-center gap-2 mb-2"
            >
              <v-avatar size="24" color="primary" class="flex-shrink-0">
                <span class="text-caption text-white">{{ i + 1 }}</span>
              </v-avatar>
              <v-text-field
                v-model="stop.name"
                :label="`Stop ${i + 1}`"
                variant="outlined"
                density="compact"
                rounded="lg"
                hide-details
                class="app-field"
              />
              <v-btn
                icon
                size="small"
                variant="text"
                color="grey"
                :disabled="i === 0"
                @click="moveStop(i, -1)"
              >
                <v-icon size="18">mdi-arrow-up</v-icon>
              </v-btn>
              <v-btn
                icon
                size="small"
                variant="text"
                color="grey"
                :disabled="i === form.stops.length - 1"
                @click="moveStop(i, 1)"
              >
                <v-icon size="18">mdi-arrow-down</v-icon>
              </v-btn>
              <v-btn icon size="small" variant="text" color="error" @click="removeStop(i)">
                <v-icon size="18">mdi-close</v-icon>
              </v-btn>
            </div>
          </div>
        </v-card-text>

        <v-divider />
        <v-card-actions class="pa-5">
          <v-btn variant="text" @click="formDialog = false">Cancel</v-btn>
          <v-spacer />
          <v-btn color="primary" variant="flat" rounded="lg" :loading="saving" @click="submitForm">
            {{ editTarget ? 'Save Changes' : 'Add Route' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- View Stops Dialog -->
    <v-dialog v-model="stopsDialog" max-width="380">
      <v-card rounded="xl">
        <v-card-title class="pa-5">
          {{ stopsRoute?.name }} — Stops
        </v-card-title>
        <v-divider />
        <v-card-text class="pa-5">
          <v-timeline density="compact" side="end">
            <v-timeline-item dot-color="primary" size="small">
              <span class="font-weight-medium">{{ stopsRoute?.origin }}</span>
              <span class="text-caption text-medium-emphasis ml-1">(origin)</span>
            </v-timeline-item>
            <v-timeline-item
              v-for="(stop, i) in stopsRoute?.stops"
              :key="i"
              dot-color="grey"
              size="x-small"
            >
              {{ stop.name }}
            </v-timeline-item>
            <v-timeline-item dot-color="success" size="small">
              <span class="font-weight-medium">{{ stopsRoute?.destination }}</span>
              <span class="text-caption text-medium-emphasis ml-1">(destination)</span>
            </v-timeline-item>
          </v-timeline>
        </v-card-text>
        <v-card-actions class="pa-5 pt-0">
          <v-spacer />
          <v-btn variant="text" @click="stopsDialog = false">Close</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Delete Confirm Dialog -->
    <v-dialog v-model="deleteDialog" max-width="400">
      <v-card rounded="xl">
        <v-card-title class="pa-5 d-flex align-center gap-sm">
          <v-icon color="error" class="mr-2">mdi-alert-circle-outline</v-icon>
          Delete Route
        </v-card-title>
        <v-card-text class="px-5">
          Are you sure you want to delete route
          <strong>{{ routeToDelete?.name }}</strong>?
          This action cannot be undone.
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

    <!-- Snackbar -->
    <v-snackbar v-model="snack.show" :color="snack.color" rounded="lg">
      {{ snack.text }}
    </v-snackbar>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axiosInst from '@/services/api'

// ── Table state ────────────────────────────────────────────
const routes       = ref([])
const loading      = ref(false)
const search       = ref('')
const filterActive = ref('')

// ── Dialog state ───────────────────────────────────────────
const formDialog   = ref(false)
const deleteDialog = ref(false)
const stopsDialog  = ref(false)
const saving       = ref(false)
const deleting     = ref(false)
const editTarget   = ref(null)
const routeToDelete = ref(null)
const stopsRoute   = ref(null)
const snack = ref({ show: false, text: '', color: 'success' })

// ── Filter options ─────────────────────────────────────────
const statusOptions = [
  { title: 'All',      value: '' },
  { title: 'Active',   value: true },
  { title: 'Inactive', value: false },
]

// ── Table headers ──────────────────────────────────────────
const headers = [
  { title: 'Route Name',  key: 'name' },
  { title: 'Origin',      key: 'origin' },
  { title: 'Destination', key: 'destination' },
  { title: 'Stops',       key: 'stops', sortable: false },
  { title: 'Distance',    key: 'distance_km' },
  { title: 'Fare',        key: 'fare' },
  { title: 'Status',      key: 'is_active' },
  { title: 'Actions',     key: 'actions', sortable: false, align: 'end' },
]

const emptyForm = () => ({
  name:        '',
  origin:      '',
  destination: '',
  fare:        '',
  distance_km: '',
  is_active:   true,
  description: '',
  stops:       [],
})

const form = ref(emptyForm())

// ── Helpers ────────────────────────────────────────────────
function showSnack(text, color = 'success') {
  snack.value = { show: true, text, color }
}

function addStop() {
  form.value.stops.push({ name: '', order: form.value.stops.length + 1 })
}

function removeStop(i) {
  form.value.stops.splice(i, 1)
  form.value.stops.forEach((s, idx) => { s.order = idx + 1 })
}

function moveStop(i, dir) {
  const stops = form.value.stops
  const j = i + dir
  if (j < 0 || j >= stops.length) return
  ;[stops[i], stops[j]] = [stops[j], stops[i]]
  stops.forEach((s, idx) => { s.order = idx + 1 })
}

function viewStops(item) {
  stopsRoute.value = item
  stopsDialog.value = true
}

// ── Fetch ──────────────────────────────────────────────────
async function fetchRoutes() {
  loading.value = true
  try {
    const params = {
      search:    search.value || undefined,
      is_active: filterActive.value === '' ? undefined : filterActive.value,
    }
    const { data } = await axiosInst.get('/transport/routes/', { params })
    routes.value = data.results || data
  } catch {
    showSnack('Failed to load routes.', 'error')
  } finally {
    loading.value = false
  }
}

// ── Open create / edit ─────────────────────────────────────
function openCreate() {
  editTarget.value = null
  form.value = emptyForm()
  formDialog.value = true
}

function openEdit(item) {
  editTarget.value = item
  form.value = {
    name:        item.name,
    origin:      item.origin,
    destination: item.destination,
    fare:        item.fare,
    distance_km: item.distance_km,
    is_active:   item.is_active,
    description: item.description || '',
    stops:       (item.stops || []).map((s, i) => ({ name: s.name, order: s.order ?? i + 1 })),
  }
  formDialog.value = true
}

// ── Submit ─────────────────────────────────────────────────
async function submitForm() {
  saving.value = true
  try {
    const payload = {
      ...form.value,
      stops: form.value.stops
        .filter(s => s.name.trim())
        .map((s, i) => ({ name: s.name.trim(), order: i + 1 })),
    }
    if (editTarget.value) {
      await axiosInst.patch(`/transport/routes/${editTarget.value.id}/`, payload)
      showSnack('Route updated successfully.')
    } else {
      await axiosInst.post('/transport/routes/', payload)
      showSnack('Route created successfully.')
    }
    formDialog.value = false
    fetchRoutes()
  } catch (e) {
    showSnack(e?.response?.data?.detail || 'Failed to save route.', 'error')
  } finally {
    saving.value = false
  }
}

// ── Delete ─────────────────────────────────────────────────
function handleDelete(item) {
  routeToDelete.value = item
  deleteDialog.value  = true
}

async function confirmDelete() {
  deleting.value = true
  try {
    await axiosInst.delete(`/transport/routes/${routeToDelete.value.id}/`)
    showSnack('Route deleted.')
    deleteDialog.value = false
    fetchRoutes()
  } catch {
    showSnack('Failed to delete route.', 'error')
  } finally {
    deleting.value = false
  }
}

onMounted(fetchRoutes)
</script>
