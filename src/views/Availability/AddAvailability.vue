<script setup lang="ts">
import LoadingDialogComponent from '@/components/LoadingDialogComponent.vue';
import AvailabilityService from '@/service/AvailabilityService';
import ServicePrgService from '@/service/ServicePrgService';
import { useHandleAsyncError } from '@/utils/handleAsyncError';
import { onMounted, ref } from 'vue';


const { handleAsyncError } = useHandleAsyncError();

const loading = ref(false);
const errorReq = ref(null);
const data = ref(null);

const props = defineProps({
  datePrg: {
    type: [String],
    required: true
  },
  idDepart: {
    type: [Number],
    default:null
  }
});

//
const availableLoading = ref(false);
var errorReqToggle = ref(null);

onMounted(async () => {
    const { result, error } = await handleAsyncError(
        () => ServicePrgService.GetServicePrgByDepartAsync(props.idDepart,props.datePrg),
        (val: boolean) => (loading.value = val)
    );
    errorReq.value = error;
    data.value = result;
});

async function addAvailable(serviceProgramId) {
    const { error } = await handleAsyncError(
        () => AvailabilityService.addAvailability(serviceProgramId),
        (val: boolean) => (availableLoading.value = val),
        true,
        'msgAvailability'
    );
    errorReqToggle.value = error;
}

async function deleteAvailable(serviceProgramId) {
    const { error } = await handleAsyncError(
        () => AvailabilityService.delete(serviceProgramId),
        (val: boolean) => (availableLoading.value = val),
        true,
        'msgUnAvailability'
    );
    errorReqToggle.value = error;
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
    <div >
        <LoadingDialogComponent :onLoading="loading" :error-req="errorReq"/>
        <div id="header">
            <p class="h2 font-bold text-wrap">Me disponibile - {{ datePrg }}</p>
        </div>
        <section
        id="listService"
        class="mb-10 text-center"
        v-for="(item, indexDept) in data?.servicePrgDates"
        :key="indexDept"
        >
            <h3 class="h2 font-bold text-wrap">{{ item.prgName }}</h3>
            <div
                class="flex items-center justify-between bg-gray-100 p-3 rounded-lg shadow mb-3"
                v-for="(servicePrg, indexServicePrg) in item.servicePrg"
                :key="indexServicePrg"
            >
                <div class="flex flex-col">
                <div class="flex items-center">
                    <span class="font-bold">{{ servicePrg.displayName }} - </span>
                    <span class="mx-1">{{ servicePrg.startTime }} - {{ servicePrg.endTime }}</span>
                </div>

                <div class="mt-1 text-sm text-yellow-600 flex items-center" v-if="servicePrg.arrivalTime">
                    <i class="pi pi-exclamation-triangle pr-1"></i>
                    <span>{{ servicePrg.arrivalTime }}</span>cc
                </div>

                <!-- Commentaire -->
                <div class="mt-1 text-sm text-blue-500 flex items-center" v-if="servicePrg.comment">
                    <i class="pi pi-comment pr-1"></i>
                    <span>{{ servicePrg.comment }}</span>
                </div>
            </div>

                <!-- Bouton de disponibilité à droite -->
            <Button
                :loading="availableLoading"
                :severity="servicePrg.isAvailable ? 'success' : 'contrast'"
                icon="pi pi-verified"
                @click="toggleAvailable(servicePrg.serviceProgramId, indexDept, indexServicePrg)"
                />
            </div>

            <!-- Message d'erreur -->
            <Message v-if="errorReqToggle != null" severity="error">
                {{ errorReqToggle?.message }}
            </Message>
        </section>
        <div class="text-right mt-5">
            <Button severity="contrast" @click="$emit('closeModal')" :label="$t('bntClose')" />
        </div>
    </div>
</template>
