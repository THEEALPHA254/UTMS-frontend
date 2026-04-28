<!-- drivers.vue -->
<template>
  <div>
    <!-- Page Header -->
    <div class="d-flex align-center mb-6">
      <div>
        <h1 class="text-h5 font-weight-bold">Drivers</h1>
        <p class="text-body-2 text-medium-emphasis">Manage registered drivers</p>
      </div>
      <v-spacer />

      <CrudModal
        ref="crudModal"
        name="Driver"
        icon="mdi-steering"
        btn-label="Add Driver"
        btn-icon="mdi-plus"
        btn-color="primary"
        :max-width="620"
        :field-cols="6"
        :field-cols-sm="12"
        :fields="driverFields"
        @submit="onAddDriver"
        @edit="onEditDriver"
      />
    </div>

    <!-- Table Card -->
    <v-card>
      <!-- Filters -->
      <v-card-text class="pb-0">
        <v-row dense>
          <v-col cols="12" md="5">
            <v-text-field
              v-model="search"
              placeholder="Search by name or email..."
              prepend-inner-icon="mdi-magnify"
              variant="outlined"
              density="compact"
              rounded="lg"
              hide-details
              clearable
              class="app-field"
              @update:model-value="fetchDrivers"
            />
          </v-col>
          <v-col cols="6" md="4">
            <v-select
              v-model="filterDuty"
              :items="dutyStatuses"
              item-title="title"
              item-value="value"
              label="Duty Status"
              variant="outlined"
              density="compact"
              rounded="lg"
              hide-details
              clearable
              class="app-field"
              @update:model-value="fetchDrivers"
            />
          </v-col>
          <v-col cols="6" md="3">
            <v-select
              v-model="filterActive"
              :items="accountStatuses"
              item-title="title"
              item-value="value"
              label="Account Status"
              variant="outlined"
              density="compact"
              rounded="lg"
              hide-details
              class="app-field"
              @update:model-value="fetchDrivers"
            />
          </v-col>
        </v-row>
      </v-card-text>

      <!-- Data Table -->
      <v-data-table-server
        v-model:items-per-page="perPage"
        :headers="headers"
        :items="drivers"
        :items-length="total"
        :loading="loading"
        :page="page"
        class="mt-2"
        @update:options="onTableOptions"
      >
        <!-- Name + Email -->
        <template #item.name="{ item }">
          <div class="d-flex align-center py-2">
            <v-avatar color="primary" size="36" class="mr-3">
              <span class="text-caption text-white font-weight-bold">
                {{ item.first_name?.[0] }}{{ item.last_name?.[0] }}
              </span>
            </v-avatar>
            <div>
              <p class="font-weight-medium mb-0">{{ item.first_name }} {{ item.last_name }}</p>
              <p class="text-caption text-medium-emphasis">{{ item.email }}</p>
            </div>
          </div>
        </template>

        <!-- License No -->
        <template #item.license_number="{ item }">
          <code>{{ item.license_number }}</code>
        </template>

        <!-- Duty Status chip -->
        <template #item.is_on_duty="{ item }">
          <v-chip :color="item.is_on_duty ? 'teal' : 'grey'" size="small" variant="tonal">
            {{ item.is_on_duty ? 'On Duty' : 'Off Duty' }}
          </v-chip>
        </template>

        <!-- Active status chip -->
        <template #item.is_active="{ item }">
          <v-chip :color="item.is_active ? 'success' : 'error'" size="small" variant="tonal">
            {{ item.is_active ? 'Active' : 'Inactive' }}
          </v-chip>
        </template>

        <!-- Actions -->
        <template #item.actions="{ item }">
          <v-btn icon size="small" variant="text" @click="openEdit(item)">
            <v-icon>mdi-pencil-outline</v-icon>
          </v-btn>
          <v-btn icon size="small" variant="text" color="error" @click="confirmDelete(item)">
            <v-icon>mdi-delete-outline</v-icon>
          </v-btn>
        </template>
      </v-data-table-server>
    </v-card>

    <!-- Delete Confirm Dialog -->
    <v-dialog v-model="deleteDialog" max-width="420">
      <v-card rounded="xl">
        <v-card-title class="pa-5">Delete Driver</v-card-title>
        <v-card-text class="pa-5 pt-0 text-medium-emphasis">
          Are you sure you want to delete
          <strong>{{ selected?.first_name }} {{ selected?.last_name }}</strong>?
          This cannot be undone.
        </v-card-text>
        <v-card-actions class="pa-5 pt-0">
          <v-spacer />
          <v-btn variant="text" @click="deleteDialog = false">Cancel</v-btn>
          <v-btn color="error" variant="flat" rounded="lg" :loading="deleting" @click="deleteDriver">
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
import { toast } from 'vue3-toastify'

// ── Table state ────────────────────────────────────────────
const drivers      = ref([])
const total        = ref(0)
const loading      = ref(false)
const page         = ref(1)
const perPage      = ref(15)
const search       = ref('')
const filterDuty   = ref('')
const filterActive = ref('')

// ── Dialog / modal state ───────────────────────────────────
const crudModal        = ref(null)
const deleteDialog     = ref(false)
const selected         = ref(null)
const deleting         = ref(false)
const editingProfileId = ref(null)
const snack = ref({ show: false, text: '', color: 'success' })

// ── Filter options ─────────────────────────────────────────
const dutyStatuses = [
  { title: 'On Duty',  value: true  },
  { title: 'Off Duty', value: false },
]
const accountStatuses = [
  { title: 'All',      value: '' },
  { title: 'Active',   value: true },
  { title: 'Inactive', value: false },
]

// ── Table headers ──────────────────────────────────────────
const headers = [
  { title: 'Driver',         key: 'name',           sortable: false },
  { title: 'Phone',          key: 'phone_number',    sortable: false },
  { title: 'License No.',    key: 'license_number',  sortable: false },
  { title: 'License Expiry', key: 'license_expiry',  sortable: false },
  { title: 'Duty Status',    key: 'is_on_duty',      sortable: false },
  { title: 'Status',         key: 'is_active',       sortable: false },
  { title: 'Actions',        key: 'actions',         sortable: false, align: 'end' },
]

// ── Driver form fields ─────────────────────────────────────
const driverFields = [
  { value: 'first_name',     text: 'First Name',    type: 'text',  required: true  },
  { value: 'last_name',      text: 'Last Name',      type: 'text',  required: true  },
  { value: 'email',          text: 'Email',          type: 'email', required: true,  cols: 12 },
  { value: 'phone_number',   text: 'Phone Number',   type: 'text',  required: false, cols: 12 },
  { value: 'license_number', text: 'License Number', type: 'text',  required: true  },
  { value: 'license_expiry', text: 'License Expiry', type: 'date',  required: true  },
]

// ── Fetch ──────────────────────────────────────────────────
async function fetchDrivers() {
  loading.value = true
  try {
    const { data } = await axiosInst.get('/auth/drivers/', {
      params: {
        page:       page.value,
        page_size:  perPage.value,
        search:     search.value || undefined,
        is_active:  filterActive.value === '' ? undefined : filterActive.value,
        is_on_duty: filterDuty.value    === '' ? undefined : filterDuty.value,
      },
    })

    drivers.value = (data.results || []).map(d => ({
      ...d,
      first_name:     d.first_name || '',
      last_name:      d.last_name  || '',
      license_number: d.driver_profile?.license_number || '',
      license_expiry: d.driver_profile?.license_expiry || '',
      is_on_duty:     d.driver_profile?.is_on_duty     ?? false,
      profile_id:     d.driver_profile?.id,
    }))

    total.value = data.count || drivers.value.length
  } catch {
    toast.error('Failed to load drivers.')
  } finally {
    loading.value = false
  }
}

function onTableOptions({ page: p, itemsPerPage: pp }) {
  page.value    = p
  perPage.value = pp
  fetchDrivers()
}

onMounted(fetchDrivers)

// ── Open edit ──────────────────────────────────────────────
function openEdit(item) {
  editingProfileId.value = item.profile_id
  crudModal.value?.openEdit(item)
}

function confirmDelete(item) {
  selected.value     = item
  deleteDialog.value = true
}

// ── Add Driver ─────────────────────────────────────────────
async function onAddDriver({ data, callback }) {
  try {
    const payload = {
      first_name:     data.first_name,
      last_name:      data.last_name,
      email:          data.email,
      phone_number:   data.phone_number,
      license_number: data.license_number,
      license_expiry: data.license_expiry,
    }
    await axiosInst.post('/auth/drivers/create/', payload)
    toast.success('Driver created. Credentials sent by email.')
    fetchDrivers()
    callback()
  } catch (e) {
    toast.error(e?.response?.data?.message || 'Failed to add driver.')
    callback()
  }
}

// ── Edit Driver ────────────────────────────────────────────
async function onEditDriver({ data, callback }) {
  try {
    const payload = {
      first_name:     data.first_name,
      last_name:      data.last_name,
      phone_number:   data.phone_number,
      license_expiry: data.license_expiry,
    }
    await axiosInst.put(`/auth/drivers/${editingProfileId.value}/`, payload)
    toast.success('Driver updated successfully.')
    fetchDrivers()
    callback()
  } catch (e) {
    toast.error(e?.response?.data?.message || 'Failed to update driver.')
    callback()
  }
}

// ── Delete Driver ──────────────────────────────────────────
async function deleteDriver() {
  deleting.value = true
  try {
    await axiosInst.delete(`/auth/drivers/${selected.value.profile_id}/`)
    toast.success('Driver deleted.')
    deleteDialog.value = false
    fetchDrivers()
  } catch {
    toast.error('Failed to delete driver.')
  } finally {
    deleting.value = false
  }
}
</script>