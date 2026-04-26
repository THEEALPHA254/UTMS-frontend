<template>
  <div>
    <!-- Page Header -->
    <div class="d-flex align-center mb-6">
      <div>
        <h1 class="text-h5 font-weight-bold">Routes</h1>
        <p class="text-body-2 text-medium-emphasis">Manage bus routes and fares</p>
      </div>
      <v-spacer />

      <!-- Add Route — triggers CrudModal -->
      <CrudModal
        ref="crudModal"
        name="Route"
        icon="mdi-map-marker-path"
        btn-label="Add Route"
        btn-icon="mdi-plus"
        btn-color="primary"
        :max-width="600"
        :field-cols="6"
        :field-cols-sm="12"
        :fields="routeFields"
        @submit="onAddRoute"
        @edit="onEditRoute"
      />
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
import CrudModal from '@/components/CRUD.vue'
import axiosInst from '@/services/api'

// ── Table state ────────────────────────────────────────────
const routes      = ref([])
const loading     = ref(false)
const search      = ref('')
const filterActive = ref('')

// ── Modal / delete state ───────────────────────────────────
const crudModal     = ref(null)
const deleteDialog  = ref(false)
const routeToDelete = ref(null)
const deleting      = ref(false)
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
  { title: 'Distance',    key: 'distance_km' },
  { title: 'Fare',        key: 'fare' },
  { title: 'Status',      key: 'is_active' },
  { title: 'Actions',     key: 'actions', sortable: false, align: 'end' },
]

// ── Route form fields for CrudModal ───────────────────────
const routeFields = [
  {
    value: 'name',
    text: 'Route Name',
    type: 'text',
    required: true,
    cols: 12,
  },
  {
    value: 'origin',
    text: 'Origin',
    type: 'text',
    required: true,
  },
  {
    value: 'destination',
    text: 'Destination',
    type: 'text',
    required: true,
  },
  {
    value: 'fare',
    text: 'Fare (KES)',
    type: 'number',
    required: true,
  },
  {
    value: 'distance_km',
    text: 'Distance (km)',
    type: 'number',
    required: false,
  },
  {
    value: 'is_active',
    text: 'Status',
    type: 'select',
    required: true,
    cols: 12,
    select_list: [
      { title: 'Active',   value: true },
      { title: 'Inactive', value: false },
    ],
    itemId: 'value',
    itemTitle: 'title',
  },
  {
    value: 'description',
    text: 'Description (optional)',
    type: 'textarea',
    required: false,
    cols: 12,
  },
]

// ── Helpers ────────────────────────────────────────────────
function showSnack(text, color = 'success') {
  snack.value = { show: true, text, color }
}

function openEdit(item) {
  crudModal.value?.openEdit(item)
}

// ── Fetch routes ───────────────────────────────────────────
async function fetchRoutes() {
  loading.value = true
  try {
    const params = {
      search: search.value || undefined,
      is_active: filterActive.value === '' ? undefined : filterActive.value,
    }
    const { data } = await axiosInst.get('/routes/', { params })
    routes.value = data.results || data
  } catch (e) {
    showSnack('Failed to load routes.', 'error')
  } finally {
    loading.value = false
  }
}

// ── Add route ──────────────────────────────────────────────
async function onAddRoute({ data, callback }) {
  try {
    await axiosInst.post('/routes/', data)
    showSnack('Route created successfully.')
    fetchRoutes()
    callback()
  } catch (e) {
    showSnack(e?.response?.data?.detail || 'Failed to create route.', 'error')
    callback()
  }
}

// ── Edit route ─────────────────────────────────────────────
async function onEditRoute({ data, id, callback }) {
  try {
    await axiosInst.patch(`/routes/${id}/`, data)
    showSnack('Route updated successfully.')
    fetchRoutes()
    callback()
  } catch (e) {
    showSnack(e?.response?.data?.detail || 'Failed to update route.', 'error')
    callback()
  }
}

// ── Delete route ───────────────────────────────────────────
function handleDelete(item) {
  routeToDelete.value = item
  deleteDialog.value  = true
}

async function confirmDelete() {
  deleting.value = true
  try {
    await axiosInst.delete(`/routes/${routeToDelete.value.id}/`)
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