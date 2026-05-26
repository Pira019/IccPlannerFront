<template>
  <Dialog 
    v-model:visible="visible" 
    :header="isEdit ? $t('liModifier') + ' - ' + $t('servicesCulte') : $t('liAddService')" 
    :modal="true" 
    :closable="true"
    :style="{ width: '500px' }"
    @hide="resetForm"
  >
    <div class="flex flex-col gap-4 pt-2">
      <!-- Liste déroulante des services existants -->
      <div class="flex flex-col gap-1">
        <label class="font-semibold text-sm">{{ $t('servicesCulte') }}</label>
        <div class="flex gap-2">
          <Select 
            v-model="formData.serviceId" 
            :options="servicesList" 
            optionLabel="label" 
            optionValue="id" 
            :placeholder="$t('servicesCulte')"
            :loading="loadingServices"
            filter
            class="w-full"
            @change="onServiceSelected"
          />
          <Button icon="pi pi-plus" severity="secondary" @click="showCreateService = true" v-tooltip="$t('liAddService')" />
        </div>
      </div>

      <!-- Formulaire inline pour créer un nouveau service -->
      <div v-if="showCreateService" class="flex flex-col gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
        <span class="text-sm font-bold text-slate-700">{{ $t('liNewService') }}</span>
        <div class="flex flex-col gap-1">
          <label class="text-xs font-semibold">{{ $t('liDisplayName') }}</label>
          <InputText v-model="newService.displayName" :placeholder="$t('liDisplayName')" />
        </div>
        <div class="flex gap-4">
          <div class="flex-1 flex flex-col gap-1">
            <label class="text-xs font-semibold">{{ $t('liDateStart') }}</label>
            <DatePicker v-model="newService.startTime" timeOnly placeholder="HH:mm" />
          </div>
          <div class="flex-1 flex flex-col gap-1">
            <label class="text-xs font-semibold">{{ $t('liDateEnd') }}</label>
            <DatePicker v-model="newService.endTime" timeOnly placeholder="HH:mm" />
          </div>
        </div>
        <div class="flex gap-2 justify-end">
          <Button :label="$t('Cancel')" size="small" text @click="showCreateService = false" />
          <Button :label="$t('Save')" size="small" icon="pi pi-check" @click="createNewService" :loading="creatingService" />
        </div>
        <Message v-if="createServiceError" severity="error" size="small" :closable="true" @close="createServiceError = null">{{ createServiceError }}</Message>
      </div>

      <!-- Nom d'affichage -->
      <div class="flex flex-col gap-1">
        <label class="font-semibold text-sm">{{ $t('liDisplayName') }}</label>
        <InputText v-model="formData.displayName" :placeholder="$t('liDisplayName')" />
      </div>

      <!-- Heures -->
      <div class="flex gap-4">
        <div class="flex-1 flex flex-col gap-1">
          <label class="font-semibold text-sm">{{ $t('liDateStart') }}</label>
          <DatePicker v-model="formData.startTime" timeOnly placeholder="HH:mm" />
        </div>
        <div class="flex-1 flex flex-col gap-1">
          <label class="font-semibold text-sm">{{ $t('liDateEnd') }}</label>
          <DatePicker v-model="formData.endTime" timeOnly placeholder="HH:mm" />
        </div>
      </div>

      <!-- Heure d'arrivée -->
      <div class="flex items-center gap-2">
        <Checkbox v-model="formData.hasArrival" inputId="hasArrival" :binary="true" />
        <label for="hasArrival" class="text-sm">{{ $t('planning.differentArrival') }}</label>
      </div>
      <div v-if="formData.hasArrival" class="flex flex-col gap-1">
        <label class="font-semibold text-sm">{{ $t('planning.arrivalTime') }}</label>
        <DatePicker v-model="formData.arrivalTime" timeOnly placeholder="HH:mm" />
      </div>

      <!-- Notes -->
      <div class="flex flex-col gap-1">
        <label class="font-semibold text-sm">Notes</label>
        <Textarea v-model="formData.notes" rows="3" />
      </div>

      <Message v-if="validationError" severity="error" size="small" :closable="true" @close="validationError = null">{{ validationError }}</Message>
      <ResponseComponent :error="errorReq" />
    </div>

    <template #footer>
      <Button :label="$t('Cancel')" icon="pi pi-times" text @click="visible = false" />
      <Button :label="$t('Save')" icon="pi pi-check" @click="handleSave" :loading="saving" />
    </template>
  </Dialog>
</template>

<script setup>
import ResponseComponent from '@/components/ResponseComponent.vue';
import ServicePrgService from '@/service/ServicePrgService';
import TabServicePrgService from '@/service/TabServicePrgService';
import { useHandleAsyncError } from '@/utils/handleAsyncError';
import { onMounted, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  program: { type: Object, default: null },
  service: { type: Object, default: null },
  prgDateId: { type: Number, default: null }
});

const emit = defineEmits(['update:modelValue', 'save']);

const { t } = useI18n();
const { handleAsyncError } = useHandleAsyncError();
const visible = ref(props.modelValue);
const saving = ref(false);
const loadingServices = ref(false);
const errorReq = ref(null);
const servicesList = ref([]);
const isEdit = ref(false);
const validationError = ref(null);
const showCreateService = ref(false);
const creatingService = ref(false);
const createServiceError = ref(null);

const newService = ref({
  displayName: '',
  startTime: null,
  endTime: null
});

const formData = ref({
  serviceId: null,
  displayName: '',
  startTime: null,
  endTime: null,
  hasArrival: false,
  arrivalTime: null,
  notes: ''
});

function parseTime(timeStr) {
  if (!timeStr) { return null; }
  const parts = timeStr.toString().split(':');
  if (parts.length >= 2) {
    const d = new Date();
    d.setHours(parseInt(parts[0]), parseInt(parts[1]), 0, 0);
    return d;
  }
  return null;
}

function formatTime(date) {
  if (!date) { return null; }
  if (date instanceof Date) {
    return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
  }
  return date.toString();
}

async function loadServices() {
  const { result } = await handleAsyncError(
    () => ServicePrgService.getAll(),
    (val) => (loadingServices.value = val)
  );
  if (result) {
    servicesList.value = result.map(s => ({
      id: s.id,
      label: `${s.startTime} - ${s.endTime} | ${s.displayName}`,
      displayName: s.displayName,
      startTime: s.startTime,
      endTime: s.endTime,
      arrivalTime: s.memberArrivalTime
    }));
  }
}

function onServiceSelected() {
  const selected = servicesList.value.find(s => s.id === formData.value.serviceId);
  if (selected) {
    formData.value.displayName = selected.displayName;
    formData.value.startTime = parseTime(selected.startTime);
    formData.value.endTime = parseTime(selected.endTime);
    if (selected.arrivalTime) {
      formData.value.hasArrival = true;
      formData.value.arrivalTime = parseTime(selected.arrivalTime);
    }
  }
}

async function createNewService() {
  createServiceError.value = null;

  if (!newService.value.displayName?.trim()) {
    createServiceError.value = t('validation.displayNameRequired');
    return;
  }
  if (!newService.value.startTime) {
    createServiceError.value = t('validation.startTimeRequired');
    return;
  }
  if (!newService.value.endTime) {
    createServiceError.value = t('validation.endTimeRequired');
    return;
  }

  const payload = {
    displayName: newService.value.displayName,
    startTime: formatTime(newService.value.startTime),
    endTime: formatTime(newService.value.endTime)
  };

  const { error, result } = await handleAsyncError(
    () => ServicePrgService.create(payload),
    (val) => (creatingService.value = val),
    true
  );

  if (error) {
    createServiceError.value = error?.message || t('internalError');
    return;
  }

  // Recharger la liste et sélectionner le nouveau service
  await loadServices();
  if (result?.id) {
    formData.value.serviceId = result.id;
    onServiceSelected();
  }

  showCreateService.value = false;
  newService.value = { displayName: '', startTime: null, endTime: null };
}

function initForm() {
  if (props.service) {
    isEdit.value = true;
    formData.value = {
      serviceId: props.service.tabServicesId || null,
      displayName: props.service.serviceTitle || '',
      startTime: parseTime(props.service.startTime),
      endTime: parseTime(props.service.endTime),
      hasArrival: !!props.service.arrivalTime,
      arrivalTime: parseTime(props.service.arrivalTime),
      notes: props.service.notes || ''
    };
  } else {
    isEdit.value = false;
  }
}

async function handleSave() {
  errorReq.value = null;
  validationError.value = null;

  // Validation champs obligatoires
  if (!formData.value.serviceId) {
    validationError.value = t('validation.serviceRequired');
    return;
  }
  if (!formData.value.displayName || !formData.value.displayName.trim()) {
    validationError.value = t('validation.displayNameRequired');
    return;
  }
  if (!formData.value.startTime) {
    validationError.value = t('validation.startTimeRequired');
    return;
  }
  if (!formData.value.endTime) {
    validationError.value = t('validation.endTimeRequired');
    return;
  }

  // Validation front : StartTime < EndTime
  if (formData.value.startTime && formData.value.endTime) {
    const start = formData.value.startTime instanceof Date ? formData.value.startTime : new Date(`2000-01-01T${formData.value.startTime}`);
    const end = formData.value.endTime instanceof Date ? formData.value.endTime : new Date(`2000-01-01T${formData.value.endTime}`);
    if (end <= start) {
      validationError.value = t('endDateMustBeAfterStartDate');
      return;
    }

    // Validation front : ArrivalTime <= StartTime
    if (formData.value.hasArrival && formData.value.arrivalTime) {
      const arrival = formData.value.arrivalTime instanceof Date ? formData.value.arrivalTime : new Date(`2000-01-01T${formData.value.arrivalTime}`);
      if (arrival > start) {
        validationError.value = t('planning.arrivalBeforeStart');
        return;
      }
    }
  }

  if (isEdit.value && props.service?.idTabService) {
    const payload = {
      tabServicesId: formData.value.serviceId,
      displayName: formData.value.displayName,
      startTime: formatTime(formData.value.startTime),
      endTime: formatTime(formData.value.endTime),
      arrivalTimeOfMember: formData.value.hasArrival ? formatTime(formData.value.arrivalTime) : null,
      notes: formData.value.notes
    };

    const { error } = await handleAsyncError(
      () => TabServicePrgService.updateServicePrg(props.service.idTabService, payload),
      (val) => (saving.value = val),
      true
    );
    if (error) { errorReq.value = error; return; }
    emit('save');
  } else {
    // Mode ajout — appel API
    const payload = {
      serviceId: formData.value.serviceId,
      prgDateId: props.prgDateId,
      displayName: formData.value.displayName,
      memberArrivalTime: formData.value.hasArrival ? formatTime(formData.value.arrivalTime) : null,
      notes: formData.value.notes
    };

    const { error } = await handleAsyncError(
      () => TabServicePrgService.addServicePrg(payload),
      (val) => (saving.value = val),
      true
    );
    if (error) { errorReq.value = error; return; }
    emit('save');
  }

  visible.value = false;
}

function resetForm() {
  formData.value = { serviceId: null, displayName: '', startTime: null, endTime: null, hasArrival: false, arrivalTime: null, notes: '' };
  errorReq.value = null;
  validationError.value = null;
  isEdit.value = false;
}

watch(() => props.modelValue, (val) => { visible.value = val; });
watch(visible, (val) => { emit('update:modelValue', val); });
watch(() => props.service, () => { initForm(); });

onMounted(() => {
  loadServices();
  initForm();
});
</script>
