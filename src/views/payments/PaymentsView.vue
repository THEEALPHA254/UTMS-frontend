<template>
    <div>
      <div class="d-flex align-center mb-6">
        <div>
          <h1 class="text-h5 font-weight-bold">Payments</h1>
          <p class="text-body-2 text-medium-emphasis">All wallet top-ups and transactions</p>
        </div>
        <v-spacer />
        <v-btn color="primary" prepend-icon="mdi-download" variant="tonal" @click="exportCSV">Export CSV</v-btn>
      </div>
  
      <v-card rounded="xl">
        <v-card-text class="pb-0">
          <v-row dense align="center">
            <v-col cols="6" md="3">
              <v-select v-model="filterMethod" :items="['', 'mpesa', 'wallet']" label="Method" variant="outlined" density="compact" rounded="lg" hide-details clearable @update:model-value="fetch" />
            </v-col>
            <v-col cols="6" md="3">
              <v-select v-model="filterStatus" :items="['', 'success', 'pending', 'failed']" label="Status" variant="outlined" density="compact" rounded="lg" hide-details clearable @update:model-value="fetch" />
            </v-col>
            <v-col cols="12" md="2">
              <v-btn variant="tonal" color="grey" size="small" prepend-icon="mdi-filter-off" rounded="lg" @click="resetFilters">Reset</v-btn>
            </v-col>
          </v-row>
        </v-card-text>
        <v-data-table-server
          v-model:items-per-page="perPage"
          :headers="headers"
          :items="transactions"
          :items-length="total"
          :loading="loading"
          @update:options="onOptions"
        >
          <template #item.amount="{ item }">KES {{ Number(item.amount).toLocaleString() }}</template>
          <template #item.status="{ item }">
            <v-chip :color="{ success: 'success', pending: 'warning', failed: 'error' }[item.status]" size="small" variant="tonal">{{ item.status }}</v-chip>
          </template>
          <template #item.created_at="{ item }">{{ new Date(item.created_at).toLocaleString() }}</template>
        </v-data-table-server>
      </v-card>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue'
  // import { paymentsApi } from '@/api'
  import axiosInst from '@/services/api'
  
  const transactions = ref([])
  const total = ref(0)
  const loading = ref(false)
  const page = ref(1)
  const perPage = ref(20)
  const filterMethod = ref('')
  const filterStatus = ref('')
  
  const headers = [
    { title: 'Reference',    key: 'reference' },
    { title: 'Admission No', key: 'student_admission', sortable: false },
    { title: 'Student',      key: 'student_name',      sortable: false },
    { title: 'Method',       key: 'payment_method' },
    { title: 'Type',         key: 'transaction_type' },
    { title: 'Amount',       key: 'amount' },
    { title: 'Status',       key: 'status' },
    { title: 'Date',         key: 'created_at' },
  ]

  function buildParams() {
    return {
      page:           page.value,
      page_size:      perPage.value,
      payment_method: filterMethod.value || undefined,
      status:         filterStatus.value || undefined,
    }
  }

  async function fetch() {
    loading.value = true
    try {
      const { data } = await axiosInst.get('/payments/all/', { params: buildParams() })
      transactions.value = data.results || data
      total.value = data.count || transactions.value.length
    } finally { loading.value = false }
  }

  function onOptions({ page: p, itemsPerPage: pp }) { page.value = p; perPage.value = pp; fetch() }

  async function exportCSV() {
    try {
      const resp = await axiosInst.get('/payments/all/', { params: { ...buildParams(), export: 'csv', page_size: 10000 }, responseType: 'blob' })
      const blob = new Blob([resp.data], { type: 'text/csv' })
      const a = document.createElement('a')
      a.href = URL.createObjectURL(blob)
      a.download = 'payments.csv'
      a.click()
      URL.revokeObjectURL(a.href)
    } catch {
      console.error('Export failed')
    }
  }

  function resetFilters() {
    filterMethod.value = ''
    filterStatus.value = ''
    page.value = 1
    fetch()
  }

  onMounted(fetch)
  </script>