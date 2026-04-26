<template>
    <!-- Trigger Button -->
    <v-btn
      v-if="props.btnType === 'flat'"
      :color="props.btnColor"
      :variant="props.variant"
      :size="props.size"
      :prepend-icon="props.btnIcon"
      class="btn-auth-primary"
      @click="openCreate"
    >
      {{ props.btnLabel }}
    </v-btn>
  
    <v-btn
      v-else-if="props.btnType === 'icon'"
      variant="outlined"
      icon
      :size="props.size"
      @click="openCreate"
    >
      <v-icon>{{ props.btnIcon }}</v-icon>
    </v-btn>
  
    <!-- Dialog -->
    <v-dialog v-model="dialog" :max-width="props.maxWidth" persistent>
      <v-card rounded="xl" class="crud-dialog-card">
  
        <!-- Header -->
        <v-card-title class="crud-dialog-header pa-5 pb-3">
          <div class="d-flex align-center">
            <v-icon :icon="editingMode ? 'mdi-pencil-outline' : props.icon" class="mr-2" color="primary" />
            <span class="crud-dialog-title">
              {{ editingMode ? `Edit ${props.name}` : `Add ${props.name}` }}
            </span>
          </div>
          <v-btn
            icon
            variant="text"
            size="small"
            class="ml-auto"
            @click="closeDialog"
          >
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>
  
        <v-divider />
  
        <!-- Form -->
        <Form @submit="handleSubmit" :initial-values="formValues">
          <v-card-text class="pa-5">
            <v-row dense>
              <v-col
                v-for="field in props.fields"
                :key="field.value"
                :cols="field.colsFull || props.fieldColsSm"
                :sm="field.cols || props.fieldCols"
              >
                <Field
                  :name="field.value"
                  v-slot="{ value, field: fieldBind, errors }"
                  :rules="field.required ? 'required' : ''"
                >
                  <!-- Textarea -->
                  <v-textarea
                    v-if="field.type === 'textarea'"
                    v-bind="fieldBind"
                    :model-value="value"
                    :label="fieldLabel(field)"
                    :error-messages="errors"
                    variant="outlined"
                    density="compact"
                    rounded="lg"
                    auto-grow
                    rows="3"
                    class="app-field"
                  />
  
                  <!-- Select -->
                  <v-select
                    v-else-if="field.type === 'select'"
                    v-bind="fieldBind"
                    :model-value="value"
                    :label="fieldLabel(field)"
                    :error-messages="errors"
                    :items="field.select_list || []"
                    :item-value="field.itemId || 'value'"
                    :item-title="field.itemTitle || 'title'"
                    :multiple="field.multiple || false"
                    :chips="field.multiple || false"
                    :closable-chips="field.multiple || false"
                    :clearable="!field.required"
                    no-data-text="No data found."
                    variant="outlined"
                    density="compact"
                    rounded="lg"
                    class="app-field"
                  />
  
                  <!-- Date -->
                  <v-text-field
                    v-else-if="field.type === 'date'"
                    v-bind="fieldBind"
                    :model-value="value"
                    :label="fieldLabel(field)"
                    :error-messages="errors"
                    type="date"
                    variant="outlined"
                    density="compact"
                    rounded="lg"
                    class="app-field"
                  />
  
                  <!-- Default: text / email / number / password -->
                  <v-text-field
                    v-else
                    v-bind="fieldBind"
                    :model-value="value"
                    :label="fieldLabel(field)"
                    :error-messages="errors"
                    :type="field.type || 'text'"
                    variant="outlined"
                    density="compact"
                    rounded="lg"
                    class="app-field"
                  />
                </Field>
              </v-col>
            </v-row>
  
            <p class="text-caption text-medium-emphasis mt-2">* Required fields</p>
          </v-card-text>
  
          <v-divider />
  
          <!-- Actions -->
          <v-card-actions class="pa-5">
            <v-btn variant="text" color="grey-darken-1" @click="closeDialog">
              Cancel
            </v-btn>
            <v-spacer />
            <v-btn
              type="submit"
              color="primary"
              variant="flat"
              rounded="lg"
              :loading="isSubmitting"
              class="btn-auth-primary px-6"
            >
              {{ editingMode ? 'Save Changes' : 'Add ' + props.name }}
            </v-btn>
          </v-card-actions>
        </Form>
      </v-card>
    </v-dialog>
  </template>
  
  <script setup>
  import { ref, watch, onMounted } from 'vue'
  import { Form, Field } from 'vee-validate'
  
  // ── Props ──────────────────────────────────────────────────
  const props = defineProps({
    name: {
      type: String,
      default: 'Record',
    },
    icon: {
      type: String,
      default: 'mdi-plus-circle-outline',
    },
    fields: {
      type: Array,
      default: () => [],
    },
    maxWidth: {
      type: [String, Number],
      default: 560,
    },
    fieldCols: {
      type: [String, Number],
      default: 6,
    },
    fieldColsSm: {
      type: [String, Number],
      default: 12,
    },
    // Trigger button props
    btnType: {
      type: String,
      default: 'flat',         // 'flat' | 'icon' | 'none' (external control)
    },
    btnLabel: {
      type: String,
      default: 'Add',
    },
    btnIcon: {
      type: String,
      default: 'mdi-plus',
    },
    btnColor: {
      type: String,
      default: 'primary',
    },
    variant: {
      type: String,
      default: 'flat',
    },
    size: {
      type: String,
      default: 'default',
    },
  })
  
  // ── Emits ──────────────────────────────────────────────────
  const emit = defineEmits(['submit', 'edit', 'opened', 'closed'])
  
  // ── State ──────────────────────────────────────────────────
  const dialog      = ref(false)
  const editingMode = ref(false)
  const isSubmitting = ref(false)
  const formValues  = ref({})
  const selectedItem = ref(null)
  
  // ── Helpers ────────────────────────────────────────────────
  function fieldLabel(field) {
    return field.required ? `${field.text} *` : field.text
  }
  
  function openCreate() {
    editingMode.value = false
    formValues.value  = {}
    selectedItem.value = null
    dialog.value      = true
    emit('opened')
  }
  
  function closeDialog() {
    dialog.value = false
  }
  
  // ── Submit ─────────────────────────────────────────────────
  function handleSubmit(values, { resetForm }) {
    isSubmitting.value = true
  
    const done = () => {
      isSubmitting.value = false
      dialog.value       = false
      formValues.value   = {}
      resetForm()
    }
  
    if (editingMode.value) {
      emit('edit', { data: values, id: selectedItem.value?.id, callback: done })
    } else {
      emit('submit', { data: values, callback: done })
    }
  }
  
  // ── Expose: allow parent to trigger edit mode ──────────────
  function openEdit(item) {
    selectedItem.value = item
    editingMode.value  = true
    formValues.value   = {}
  
    props.fields.forEach((field) => {
      // Support nested keys like "student_profile.faculty"
      const keys  = field.value.split('.')
      let val     = item
      keys.forEach((k) => { val = val?.[k] })
      formValues.value[field.value] = val ?? ''
    })
  
    dialog.value = true
    emit('opened')
  }
  
  defineExpose({ openEdit, openCreate })
  
  // ── Watchers ───────────────────────────────────────────────
  watch(dialog, (val) => {
    if (!val) emit('closed')
  })
  
  // Load dynamic select options on mount
  onMounted(() => {
    props.fields.forEach(async (field) => {
      if (!field.dependsOn && field.loadOptions) {
        field.select_list = await field.loadOptions()
      }
      // Watch dependent fields
      if (field.dependsOn) {
        watch(
          () => formValues.value?.[field.dependsOn],
          async (newVal) => {
            field.select_list = newVal ? await field.loadOptions(newVal) : []
          }
        )
      }
    })
  })
  </script>
  
  <style scoped>
  .crud-dialog-card {
    font-family: var(--font-body, 'DM Sans', sans-serif);
  }
  
  .crud-dialog-header {
    display: flex;
    align-items: center;
  }
  
  .crud-dialog-title {
    font-size: 16px;
    font-weight: 600;
    color: var(--color-text, #0f0f0f);
    letter-spacing: -0.2px;
  }
  </style>