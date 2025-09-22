<script setup lang="ts">
import CalendarComponent from '@/components/CalendarComponent.vue';
import HeaderComponent from '@/components/HeaderComponent.vue';
import ServicePrgService from '@/service/ServicePrgService';
import { useHandleAsyncError } from '@/utils/handleAsyncError';
import ProgressSpinner from 'primevue/progressspinner';

import { useDialog } from 'primevue/usedialog';
import { defineAsyncComponent, ref } from 'vue';
import { useI18n } from 'vue-i18n';

const { handleAsyncError } = useHandleAsyncError();
const { t } = useI18n();
const dialog = useDialog();
const AddAvailability = defineAsyncComponent(() => import('@/views/Availability/AddAvailability.vue'));

const loading = ref(false);
const dates = ref();
const errorReq = ref();

async function onMonthChanged({ month, year }) {
    const { result, error } = await handleAsyncError(
        () => ServicePrgService.getDates(month, year),
        (val: boolean) => (loading.value = val)
    );

    errorReq.value = error;
    dates.value = result?.dates;
}

const show = (dateService) => {
    dialog.open(AddAvailability, {
        data: {
            dateService
        },
        props: {
            header: dateService,
            modal: true
        }
    });
};
</script>

<template>
    <HeaderComponent :title-page="$t('AvailabilityTitlePage')" />
    <div class="card">
        <div class="text-center" v-if="loading">
            <ProgressSpinner aria-label="Loading" />
        </div>
        <Message class="mb-5" v-if="errorReq != null" severity="error">{{ errorReq?.message }}</Message>

        <Message v-if="dates" class="p-5 mb-5" icon="pi pi-info-circle" severity="info">{{ $t('defaultMsgAvailability') }}</Message>

        <CalendarComponent :dates-service="dates" @show-modal="show" @month-changed="onMonthChanged" />
    </div>
    <DynamicDialog />
</template>
