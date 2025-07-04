<script setup lang="ts">
import AvailabilityService from '@/service/AvailabilityService';
import ServicePrgService from '@/service/ServicePrgService';
import { handleAsyncError } from '@/utils/handleAsyncError';
import { ProgressSpinner } from 'primevue';
import { inject, onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';

const dialogRef = inject('dialogRef');
const { t } = useI18n();
const loading = ref(false);
const errorReq = ref(null);
const data = ref([]);
//
const availableLoading = ref(false);
var errorReqToggle = ref(null);

onMounted(async () => {
    const { result, error } = await handleAsyncError(
        () => ServicePrgService.getDepartmentServicesByDate(dialogRef.value.data.dateService),
        t,
        (val: boolean) => (loading.value = val)
    );
    errorReq.value = error;
    data.value = result;
});

async function addAvailable(serviceProgramId) {
    const { error } = await handleAsyncError(
        () => AvailabilityService.addAvailability(serviceProgramId),
        t,
        (val: boolean) => (availableLoading.value = val),
        true,
        'msgAvailability'
    );
    errorReqToggle.value = error;
}

async function deleteAvailable(serviceProgramId) {
    const { error } = await handleAsyncError(
        () => AvailabilityService.delete(serviceProgramId),
        t,
        (val: boolean) => (availableLoading.value = val),
        true,
        'msgUnAvailability'
    );
    errorReqToggle.value = error;
}

function closeDialog() {
    dialogRef.value.close();
}

async function toggleAvailable(serviceProgramId, indexDept, indexServicePrg) {
    errorReqToggle.value = null;
    const isAvailable = !data.value[indexDept].servicePrograms[indexServicePrg].isAvailable;
    isAvailable ? await addAvailable(serviceProgramId) : await deleteAvailable(serviceProgramId);

    if (!errorReqToggle.value?.message) {
        data.value[indexDept].servicePrograms[indexServicePrg].isAvailable = isAvailable;
    }
}
</script>

<template>
    <div class="text-center">
        <ProgressSpinner v-if="loading" />
        <Message v-else-if="errorReq != null" severity="error">{{ errorReq?.message }}</Message>
        <div class="p-4 space-y-4" v-else>
            <div v-if="data != null">
                <section id="listService" class="mb-10" v-for="(item, indexDept) in data" :key="indexDept">
                    <h3 class="h1 font-bold text-wrap">{{ item.departmentName }}</h3>
                    <div class="flex items-center justify-between bg-gray-100 p-3 rounded-lg shadow mb-3" v-for="(prg, indexServicePrg) in item.servicePrograms" :key="indexServicePrg">
                        <p>
                            <i class="pi pi-info-circle pr-1" v-tooltip="prg.programName + ' ' + prg.startTime + ' - ' + prg.endTime"></i>
                            <span class="font-bold" v-if="prg.programShortName != null"> {{ prg.programShortName.toUpperCase() }} - </span> {{ prg.displayName.toUpperCase() }} — Heure d'arrivée :
                            <span class="font-bold"> {{ prg.servantArrivalTime }}</span>
                        </p>
                        <Button :loading="availableLoading" :severity="prg.isAvailable ? 'success' : 'contrast'" icon="pi pi-verified" @click="toggleAvailable(prg.serviceProgramId, indexDept, indexServicePrg)" />
                    </div>
                    <Message v-if="errorReqToggle != null" severity="error">{{ errorReqToggle?.message }}</Message>
                </section>
            </div>
            <Message v-else severity="info">{{ $t('noServices') }}</Message>
        </div>

        <div class="text-right mt-5">
            <Button severity="contrast" @click="closeDialog" :label="$t('bntClose')" />
        </div>
    </div>
</template>
