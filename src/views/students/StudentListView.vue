<!-- students.vue -->
<template>
  <div>
    <!-- Page Header -->
    <div class="d-flex align-center mb-6">
      <div>
        <h1 class="text-h5 font-weight-bold">Students</h1>
        <p class="text-body-2 text-medium-emphasis">Manage registered students</p>
      </div>
      <v-spacer />
      <v-btn
        color="primary"
        prepend-icon="mdi-download"
        variant="tonal"
        class="mr-3"
        @click="exportCSV"
      >
        Export CSV
      </v-btn>

      <!-- ✅ Add Student Button — triggers GlobalCrudModal -->
      <CrudModal
        ref="crudModal"
        name="Student"
        icon="mdi-account-plus-outline"
        btn-label="Add Student"
        btn-icon="mdi-plus"
        btn-color="primary"
        :max-width="620"
        :field-cols="6"
        :field-cols-sm="12"
        :fields="studentFields"
        @submit="onAddStudent"
        @edit="onEditStudent"
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
              placeholder="Search...."
              prepend-inner-icon="mdi-magnify"
              variant="outlined"
              density="compact"
              rounded="lg"
              hide-details
              clearable
              class="app-field"
              @update:model-value="fetchStudents"
            />
          </v-col>
          <v-col cols="6" md="4">
            <v-select
              v-model="filterStatus"
              :items="transportStatuses"
              label="Transport Status"
              variant="outlined"
              density="compact"
              rounded="lg"
              hide-details
              clearable
              class="app-field"
              @update:model-value="fetchStudents"
            />
          </v-col>
          <v-col cols="6" md="3">
            <v-select
              v-model="filterActive"
              :items="accountStatuses"
              label="Account Status"
              variant="outlined"
              density="compact"
              rounded="lg"
              hide-details
              class="app-field"
              @update:model-value="fetchStudents"
            />
          </v-col>
        </v-row>
      </v-card-text>

      <!-- Data Table -->
      <v-data-table-server
        v-model:items-per-page="perPage"
        :headers="headers"
        :items="students"
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

        <!-- Admission No -->
        <template #item.admission_number="{ item }">
          <code>{{ item.admission_number }}</code>
        </template>

        <!-- Transport Status chip -->
        <template #item.transport_status="{ item }">
          <v-chip
            :color="tsColor(item.GlobalComponentstransport_status)"
            size="small"
            variant="tonal"
          >
            {{ item.student_profile?.transport_status || '—' }}
          </v-chip>
        </template>

        <!-- Wallet -->
        <template #item.wallet_balance="{ item }">
          KES {{ Number(item.wallet_balance || 0).toLocaleString() }}
        </template>

        <!-- Actions -->
        <template #item.actions="{ item }">
          <!-- Edit via GlobalCrudModal -->
          <v-btn icon size="small" variant="text" @click="openEdit(item)">
            <v-icon>mdi-pencil-outline</v-icon>
          </v-btn>
          <!-- View detail -->
          <v-btn icon size="small" variant="text" :to="`/students/${item.id}`">
            <v-icon>mdi-eye-outline</v-icon>
          </v-btn>
        </template>
      </v-data-table-server>
    </v-card>

    <!-- Transport Status Quick-Update Dialog -->
    <v-dialog v-model="statusDialog" max-width="420">
      <v-card rounded="xl">
        <v-card-title class="pa-5">Update Transport Status</v-card-title>
        <v-card-text>
          <p class="mb-4">
            Student:
            <strong>{{ selectedStudent?.first_name }} {{ selectedStudent?.last_name }}</strong>
          </p>
          <v-select
            v-model="newStatus"
            :items="['active', 'inactive', 'suspended']"
            label="Transport Status"
            variant="outlined"
            rounded="lg"
            class="app-field"
          />
        </v-card-text>
        <v-card-actions class="pa-5 pt-0">
          <v-spacer />
          <v-btn variant="text" @click="statusDialog = false">Cancel</v-btn>
          <v-btn
            color="primary"
            variant="flat"
            rounded="lg"
            :loading="saving"
            @click="saveStatus"
          >
            Save
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
const students    = ref([])
const total       = ref(0)
const loading     = ref(false)
const page        = ref(1)
const perPage     = ref(15)
const search      = ref('')
const filterStatus = ref('')
const filterActive = ref('')

// ── Dialog state ───────────────────────────────────────────
const crudModal       = ref(null)   // ref to GlobalCrudModal
const statusDialog    = ref(false)
const selectedStudent = ref(null)
const newStatus       = ref('')
const saving          = ref(false)
const snack = ref({ show: false, text: '', color: 'success' })

// ── Filter options ─────────────────────────────────────────
const transportStatuses = ['active', 'inactive', 'suspended']
const accountStatuses   = [
  { title: 'All',      value: '' },
  { title: 'Active',   value: true },
  { title: 'Inactive', value: false },
]

// ── Table headers ──────────────────────────────────────────
const headers = [
  { title: 'Student', key: 'name', sortable: false },
  { title: 'Admission No', key: 'admission_number' },
  { title: 'Faculty', key: 'faculty' },
  { title: 'Transport', key: 'transport_status' },
  { title: 'Wallet', key: 'wallet_balance' },
  { title: 'Actions', key: 'actions', sortable: false, align: 'end' },
]

// ── Student form fields passed to GlobalCrudModal ──────────
// Each field: { value, text, type, required, cols?, select_list? }
const studentFields = [
  { value: 'first_name',  text: 'First Name', type: 'text',   required: true },
  { value: 'last_name', text: 'Last Name', type: 'text',   required: true },
  { value: 'email', text: 'Email', type: 'email',  required: true,  cols: 12 },
  // { value: 'phone', text: 'Phone Number', type: 'text',   required: false },
  { value: 'admission_number', text: 'Admission No', type: 'text', required: true, },
  { value: 'student_id', text: 'Student Id', type: 'text', required: true, },
  { value: 'faculty', text: 'Faculty', type: 'text', required: false,},
  {value: 'transport_status', text: 'Transport Status', type: 'select', required: true, cols: 12, select_list: transportStatuses,},
]

// ── Helpers ────────────────────────────────────────────────
function tsColor(s) {
  return { active: 'success', inactive: 'grey', suspended: 'error' }[s] || 'grey'
}

function showSnack(text, color = 'success') {
  snack.value = { show: true, text, color }
}

const editingProfileId = ref(null)
// ── Open edit via crudModal ref ────────────────────────────
function openEdit(item) {
  editingProfileId.value = item.profile_id
  console.log(item.profile_id)
  crudModal.value?.openEdit(item)
  
}


// ── Fetch ──────────────────────────────────────────────────
async function fetchStudents() {
  loading.value = true
  try {
    const { data } = await axiosInst.get('/auth/students/', {
      params: {
        page:             page.value,
        page_size:        perPage.value,
        search:           search.value,
        transport_status: filterStatus.value,
        is_active:        filterActive.value === '' ? undefined : filterActive.value,
      }
    })

    // ✅ Map to flatten user fields onto each student object
    students.value = (data.results || []).map(student => ({
      ...student,
      first_name: student.first_name || '',
      last_name:  student.last_name  || '',
      admission_number: student.student_profile?.admission_number || '',
      faculty: student.student_profile?.faculty || '',
      profile_id: student.student_profile?.id,
      is_active: student.is_active,
    }))

    total.value = data.count || students.value.length

  } catch (e) {
    console.error('Fetch error:', e)
    students.value = []
    total.value    = 0
  } finally {
    loading.value = false
  }
}


function onTableOptions({ page: p, itemsPerPage: pp }) {
  page.value    = p
  perPage.value = pp
  fetchStudents()
}

// ── Add Student ────────────────────────────────────────────
async function onAddStudent({ data, callback }) {
  try {
    await axiosInst.post('/auth/students/create/', data)
    showSnack('Student added successfully.')
    fetchStudents()
    callback()
  } catch (e) {
    showSnack(e?.response?.data?.detail || 'Failed to add student.', 'error')
    callback()
  }
}

// ── Edit Student ───────────────────────────────────────────
async function onEditStudent({ data, id, callback }) {

  try {
    await axiosInst.put(`/auth/students/${editingProfileId.value}/`, data)
    toast.success('Student updated successfully.')
    fetchStudents()
    callback()
  } catch (e) {
    toast.error(e?.response?.data?.detail || 'Failed to update student.')
    callback()
  }
}

// ── Quick transport status update ──────────────────────────
function openStatusDialog(student) {
  selectedStudent.value = student
  newStatus.value       = student.student_profile?.transport_status || 'inactive'
  statusDialog.value    = true
}

async function saveStatus() {
  saving.value = true
  try {
    await axiosInst.patch(`/student-profiles/${selectedStudent.value.student_profile.id}/`, {
      transport_status: newStatus.value,
    })
    showSnack('Status updated.')
    statusDialog.value = false
    fetchStudents()
  } catch {
    showSnack('Failed to update status.', 'error')
  } finally {
    saving.value = false
  }
}

async function exportCSV() {
  window.open('/api/reports/students/usage/?export=csv', '_blank')
}

onMounted(fetchStudents)
</script>