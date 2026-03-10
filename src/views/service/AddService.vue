<template>
  <Dialog 
    v-model:visible="visible" 
    :header="$t('liAddService')" 
    :modal="true" 
    :closable="true"
    :style="{ width: '50vw' }"
    @hide="resetForm"
  >
    <div class="space-y-4">
      <div class="flex flex-col gap-2">
        <label for="serviceTitle" class="font-semibold text-slate-700">
          {{ $t('servicesCulte') }}
        </label>
        <InputText 
          id="serviceTitle"
          v-model="formData.serviceTitle" 
          :placeholder="$t('servicesCulte')"
          class="w-full"
        />
      </div>

      <div class="flex flex-col gap-2">
        <label for="startTime" class="font-semibold text-slate-700">
          Heure de début
        </label>
        <DatePicker
          id="startTime"
          v-model="formData.startTime"
          timeOnly
          :placeholder="$t('liDateStart')"
          class="w-full"
        />
      </div>

      <div class="flex items-center gap-2">
        <Checkbox 
          v-model="formData.hasArrival" 
          inputId="hasArrival" 
          :binary="true"
        />
        <label for="hasArrival" class="font-semibold text-slate-700">
          Heure d'arrivée différente
        </label>
      </div>

      <div v-if="formData.hasArrival" class="flex flex-col gap-2">
        <label for="arrivalTime" class="font-semibold text-slate-700">
          Heure d'arrivée
        </label>
        <DatePicker
          id="arrivalTime"
          v-model="formData.arrivalTime"
          timeOnly
          placeholder="Heure d'arrivée"
          class="w-full"
        />
      </div>
    </div>

    <template #footer>
      <Button 
        :label="$t('Cancel')" 
        icon="pi pi-times" 
        text 
        @click="visible = false"
      />
      <Button 
        :label="$t('Save')" 
        icon="pi pi-check" 
        @click="handleSave"
        :loading="loading"
      />
    </template>
  </Dialog>
</template>

<script setup>
import Button from 'primevue/button';
import Checkbox from 'primevue/checkbox';
import DatePicker from 'primevue/datepicker';
import Dialog from 'primevue/dialog';
import InputText from 'primevue/inputtext';
import { ref, watch } from 'vue';

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  program: {
    type: Object,
    default: null
  }
});

const emit = defineEmits(['update:modelValue', 'save']);

const visible = ref(props.modelValue);
const loading = ref(false);

const formData = ref({
  serviceTitle: '',
  startTime: null,
  hasArrival: false,
  arrivalTime: null
});

watch(() => props.modelValue, (newVal) => {
  visible.value = newVal;
});

watch(visible, (newVal) => {
  emit('update:modelValue', newVal);
});

function resetForm() {
  formData.value = {
    serviceTitle: '',
    startTime: null,
    hasArrival: false,
    arrivalTime: null
  };
}

function handleSave() {
  const serviceData = {
    serviceTitle: formData.value.serviceTitle,
    startTime: formData.value.startTime,
    arrival: formData.value.hasArrival,
    arrivalTime: formData.value.hasArrival ? formData.value.arrivalTime : null,
    programId: props.program?.id
  };

  emit('save', serviceData);
  visible.value = false;
}
</script>
