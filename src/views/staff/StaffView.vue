<template>
  <div>
    <!-- Header -->
    <div class="d-flex align-center mb-6">
      <div>
        <h1 class="text-h5 font-weight-bold">Staff</h1>
        <p class="text-body-2 text-medium-emphasis">Manage staff accounts</p>
      </div>

      <v-spacer />

      <v-btn
        color="primary"
        prepend-icon="mdi-download"
        variant="tonal"
        class="mr-3"
      >
        Export CSV
      </v-btn>

      <!-- CRUD MODAL -->
      <CrudModal
        ref="crudModal"
        name="Staff"
        icon="mdi-account-plus-outline"
        btn-label="Add Staff"
        btn-icon="mdi-plus"
        btn-color="primary"
        :max-width="600"
        :field-cols="6"
        :field-cols-sm="12"
        :fields="staffFields"
        @submit="onAddStaff"
        @edit="onEditStaff"
      />
    </div>

    <!-- Table -->
    <v-card>
      <!-- Filters -->
      <v-card-text class="pb-0">
        <v-row dense>
          <v-col cols="12" md="5">
            <v-text-field
              v-model="search"
              placeholder="Search..."
              prepend-inner-icon="mdi-magnify"
              variant="outlined"
              density="compact"
              rounded="lg"
              hide-details
              clearable
              class="app-field"
              @update:model-value="fetchStaff"
            />
          </v-col>

          <v-col cols="6" md="4">
            <v-select
              v-model="filterRole"
              :items="['staff', 'admin']"
              label="Role"
              variant="outlined"
              density="compact"
              rounded="lg"
              hide-details
              clearable
              class="app-field"
              @update:model-value="fetchStaff"
            />
          </v-col>

          <v-col cols="6" md="3">
            <v-select
              v-model="filterActive"
              :items="accountStatuses"
              label="Status"
              variant="outlined"
              density="compact"
              rounded="lg"
              hide-details
              class="app-field"
              @update:model-value="fetchStaff"
            />
          </v-col>
        </v-row>
      </v-card-text>

      <!-- Data Table -->
      <v-data-table-server
        v-model:items-per-page="perPage"
        :headers="headers"
        :items="staff"
        :items-length="total"
        :loading="loading"
        :page="page"
        class="mt-2"
        @update:options="onTableOptions"
      >
        <!-- Name -->
        <template #item.name="{ item }">
          <div class="d-flex align-center py-2">
            <v-avatar color="primary" size="36" class="mr-3">
              <span class="text-caption text-white font-weight-bold">
                {{ item.first_name?.[0] }}{{ item.last_name?.[0] }}
              </span>
            </v-avatar>
            <div>
              <p class="font-weight-medium mb-0">
                {{ item.first_name }} {{ item.last_name }}
              </p>
              <p class="text-caption text-medium-emphasis">
                {{ item.email }}
              </p>
            </div>
          </div>
        </template>

        <!-- Phone -->
        <template #item.phone_number="{ item }">
          {{ item.phone_number || '—' }}
        </template>

        <!-- Role -->
        <template #item.role="{ item }">
          <v-chip
            :color="item.role === 'admin' ? 'deep-purple' : 'teal'"
            size="small"
            variant="tonal"
          >
            {{ item.role }}
          </v-chip>
        </template>

        <!-- Status -->
        <template #item.is_active="{ item }">
          <v-chip
            :color="item.is_active ? 'success' : 'error'"
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

          <v-btn icon size="small" variant="text" @click="confirmDelete(item)">
            <v-icon>mdi-delete-outline</v-icon>
          </v-btn>
        </template>
      </v-data-table-server>
    </v-card>

    <!-- Delete Dialog -->
    <v-dialog v-model="deleteDialog" max-width="380">
      <v-card rounded="lg">
        <v-card-title class="pa-5 pb-2 font-weight-bold">
          Delete Staff
        </v-card-title>

        <v-card-text class="pa-5 pt-0 text-medium-emphasis">
          Are you sure you want to delete
          <strong>{{ selected?.first_name }} {{ selected?.last_name }}</strong>?
        </v-card-text>

        <v-card-actions class="pa-4">
          <v-spacer />
          <v-btn variant="text" @click="deleteDialog = false">Cancel</v-btn>
          <v-btn color="red" variant="flat" :loading="deleting" @click="deleteStaff">
            Delete
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Snackbar -->
    <v-snackbar v-model="snack.show" :color="snack.color">
      {{ snack.text }}
    </v-snackbar>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import CrudModal from '@/components/CRUD.vue'
import axiosInst from '@/services/api'
import { toast } from 'vue3-toastify'

// State
const staff = ref([])
const total = ref(0)
const loading = ref(false)
const page = ref(1)
const perPage = ref(15)

const search = ref('')
const filterRole = ref('')
const filterActive = ref('')

const crudModal = ref(null)
const deleteDialog = ref(false)
const selected = ref(null)
const deleting = ref(false)

const snack = ref({ show: false, text: '', color: 'success' })

// Filters
const accountStatuses = [
  { title: 'All', value: '' },
  { title: 'Active', value: true },
  { title: 'Inactive', value: false },
]

// Headers
const headers = [
  { title: 'Staff', key: 'name', sortable: false },
  { title: 'Phone', key: 'phone_number' },
  { title: 'Role', key: 'role' },
  { title: 'Status', key: 'is_active' },
  { title: 'Actions', key: 'actions', sortable: false, align: 'end' },
]

// Fields for CrudModal
const staffFields = [
  { value: 'first_name', text: 'First Name', type: 'text', required: true },
  { value: 'last_name', text: 'Last Name', type: 'text', required: true },
  { value: 'email', text: 'Email', type: 'email', required: true, cols: 12 },
  { value: 'phone_number', text: 'Phone', type: 'text' },
  { value: 'role', text: 'Role', type: 'select', required: true, cols: 12, select_list: ['staff', 'admin'],},
]

// Fetch
async function fetchStaff() {
  loading.value = true
  try {
    const { data } = await axiosInst.get('/auth/staff/', {
      params: {
        page: page.value,
        page_size: perPage.value,
        search: search.value,
        role: filterRole.value,
        is_active: filterActive.value === '' ? undefined : filterActive.value,
      },
    })

    staff.value = data.results || []
    total.value = data.count || 0
  } catch (e) {
    staff.value = []
    total.value = 0
  } finally {
    loading.value = false
  }
}

function onTableOptions({ page: p, itemsPerPage: pp }) {
  page.value = p
  perPage.value = pp
  fetchStaff()
}

// CRUD
async function onAddStaff({ data, callback }) {
  try {
    await axiosInst.post('/auth/staff/create/', data)
    toast.success('Staff created')
    fetchStaff()
    callback()
  } catch (e) {
    toast.error('Failed to create staff')
    callback()
  }
}

function openEdit(item) {
  selected.value = item
  crudModal.value?.openEdit(item)
}

async function onEditStaff({ data, id, callback }) {
  try {
    await axiosInst.put(`/auth/staff/${id}/`, data)
    toast.success('Staff updated')
    fetchStaff()
    callback()
  } catch (e) {
    toast.error('Failed to update staff')
    callback()
  }
}



// Delete
function confirmDelete(item) {
  selected.value = item
  deleteDialog.value = true
}

async function deleteStaff() {
  deleting.value = true
  try {
    await axiosInst.delete(`/auth/staff/${selected.value.id}/`)
    toast.success('Staff deleted')
    deleteDialog.value = false
    fetchStaff()
  } catch {
    toast.error('Failed to delete staff')
  } finally {
    deleting.value = false
  }
}

onMounted(fetchStaff)
</script>