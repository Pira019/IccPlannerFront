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
        default: null
    }
});

const availableLoading = ref(false);
const errorReqToggle = ref(null);

onMounted(async () => {
    const { result, error } = await handleAsyncError(
        () => ServicePrgService.GetServicePrgByDepartAsync(props.idDepart, props.datePrg),
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
    <div class="flex flex-col gap-5 p-1">
        <LoadingDialogComponent :onLoading="loading" :error-req="errorReq" />

        <!-- Header -->
        <div class="flex items-center gap-3">
            <div class="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10">
                <i class="pi pi-calendar-clock text-primary text-lg"></i>
            </div>
            <div class="flex flex-col">
                <h2 class="text-lg font-bold m-0 text-surface-800">{{ $t('liAvailability') }}</h2>
                <span class="text-sm text-surface-400">{{ datePrg }}</span>
            </div>
        </div>

        <Divider class="m-0" />

        <!-- Contenu scrollable -->
        <div class="flex flex-col gap-5 max-h-[60vh] overflow-y-auto pr-1">
            <div v-for="(item, indexDept) in data?.servicePrgDates" :key="indexDept" class="flex flex-col gap-3">
                <!-- Nom du programme -->
                <div class="flex items-center gap-2">
                    <i class="pi pi-bookmark-fill text-primary text-sm"></i>
                    <span class="font-semibold text-surface-700 text-sm uppercase tracking-wide">{{ item.prgName }}</span>
                </div>

                <!-- Services -->
                <div
                    v-for="(servicePrg, indexServicePrg) in item.servicePrg"
                    :key="indexServicePrg"
                    class="flex items-center justify-between gap-3 p-3 sm:p-4 rounded-xl border transition-all duration-200 cursor-pointer"
                    :class="servicePrg.isAvailable
                        ? 'border-green-200 bg-green-50 hover:bg-green-100/70 shadow-sm'
                        : 'border-surface-200 bg-surface-0 hover:bg-surface-50 hover:shadow-sm'"
                    @click="toggleAvailable(servicePrg.serviceProgramId, indexDept, indexServicePrg)"
                >
                    <!-- Indicateur gauche -->
                    <div class="flex items-start gap-3 min-w-0 flex-1">
                        <div
                            class="w-1 self-stretch rounded-full flex-shrink-0"
                            :class="servicePrg.isAvailable ? 'bg-green-400' : 'bg-surface-200'"
                        ></div>

                        <div class="flex flex-col gap-1.5 min-w-0">
                            <span class="font-semibold text-sm sm:text-base text-surface-800">{{ servicePrg.displayName }}</span>

                            <div class="flex items-center gap-1.5">
                                <i class="pi pi-clock text-xs text-surface-400"></i>
                                <span class="text-xs sm:text-sm text-surface-500">{{ servicePrg.startTime }} – {{ servicePrg.endTime }}</span>
                            </div>

                            <!-- Heure d'arrivée -->
                            <div v-if="servicePrg.arrivalTime" class="flex items-center gap-1.5 mt-0.5">
                                <i class="pi pi-exclamation-triangle text-xs text-orange-500"></i>
                                <span class="text-xs text-orange-600">{{ servicePrg.arrivalTime }}</span>
                            </div>

                            <!-- Commentaire -->
                            <div v-if="servicePrg.comment" class="flex items-center gap-1.5 mt-0.5">
                                <i class="pi pi-info-circle text-xs text-blue-400"></i>
                                <span class="text-xs text-blue-500">{{ servicePrg.comment }}</span>
                            </div>
                        </div>
                    </div>

                    <!-- Toggle -->
                    <div class="flex-shrink-0">
                        <ToggleSwitch
                            :modelValue="servicePrg.isAvailable"
                            :disabled="availableLoading"
                            @click.stop="toggleAvailable(servicePrg.serviceProgramId, indexDept, indexServicePrg)"
                        />
                    </div>
                </div>
            </div>

            <!-- État vide -->
            <div v-if="!loading && (!data?.servicePrgDates || data.servicePrgDates.length === 0)" class="flex flex-col items-center gap-3 py-8 text-surface-400">
                <i class="pi pi-calendar text-4xl"></i>
                <span class="text-sm">{{ $t('liNoElement') }}</span>
            </div>
        </div>

        <!-- Message d'erreur -->
        <Message v-if="errorReqToggle != null" severity="error" :closable="false">
            {{ errorReqToggle?.message }}
        </Message>

        <Divider class="m-0" />

        <!-- Footer -->
        <div class="flex justify-end">
            <Button severity="secondary" @click="$emit('closeModal')" :label="$t('bntClose')" outlined rounded />
        </div>
    </div>
</template>
