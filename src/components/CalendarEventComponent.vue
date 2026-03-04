
<script setup>

import LoadingDialogComponent from '@/components/LoadingDialogComponent.vue';
import { computed, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

const emit = defineEmits(['CurrentMonthYear','update:loading', 'update:errorReq']);



 const props = defineProps({
        addCalendarContent: { type: Boolean},
        lstEvents: Array,
        loading: { type: Boolean},
        errorReq : { type: {}}
    });

const selectedDate = ref(new Date());
const currentMonthYear = ref(null);
const calendar = ref(null);

const view = ref('dayGridMonth');

const views = [
    { key: 'dayGridMonth', label: 'liMonth' },
    { key: 'timeGridWeek', label: 'liWeek' },
    { key: 'timeGridDay', label: 'liDay' },
    { key: 'listWeek', label: 'lilist' }
];

const currentViewLabel = computed(() => views.find((v) => v.key === view.value)?.label);

const viewItems = views.map((v) => ({
    label: t(v.label),
    command: () => (view.value = v.key)
}));

// Methods

const onMonthYearChanged = (formattedMonthYear) => {
    currentMonthYear.value = formattedMonthYear;
    emit('CurrentMonthYear', formattedMonthYear)
};


// Méthode pour sélectionner aujourd'hui
const selectToday = () => {
    selectedDate.value = new Date(); // met à jour la date sélectionnée
};

const prev = () => {
    calendar.value.navigatePrev();
    const calView = calendar.value.$refs.calendarRef.getApi().view;
    selectedDate.value = calView.currentStart;
};

const next = () => {
    calendar.value.navigateNext();
    const calView = calendar.value.$refs.calendarRef.getApi().view;
    selectedDate.value = calView.currentStart;
};

// Watch sur selectedDate pour mettre à jour FullCalendar
watch(selectedDate, (newDate) => {
    if (calendar.value && newDate) {
        calendar.value.gotoDate(newDate);
    }
});
</script>


<template>
    <div class="flex flex-col h-screen">
        <LoadingDialogComponent :onLoading="loading" :errorReq="errorReq"/>
        <!-- Barre d'outils -->
       <div class="border-b border-gray-200 p-4">

    <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">

        <!-- LEFT SECTION -->
        <div class="flex flex-col sm:flex-row sm:items-center gap-3 w-full lg:w-auto">

            <Button
                :label="t('liToDay')"
                @click="selectToday"
                severity="primary"
                variant="outlined"
                rounded
                class="w-full sm:w-auto text-sm sm:text-base font-medium px-4 py-2"
            />

            <div class="flex items-center gap-2 flex-wrap">

                <Button icon="pi pi-chevron-left" variant="text" @click="prev" />

                <DatePicker class="w-40 sm:w-44 md:w-48" />

                <Button icon="pi pi-chevron-right" variant="text" @click="next" />

                <span class="text-sm sm:text-base md:text-lg font-semibold capitalize">
                    {{ currentMonthYear?.formattedMonthYear }}
                </span>

            </div>

        </div>

        <div class="flex flex-col sm:flex-row sm:items-center gap-3 w-full lg:w-auto">

            <div class="w-full sm:w-auto">
                <slot name="rightContent" />
            </div>

            <SplitButton
                :label="t(currentViewLabel)"
                icon="pi pi-calendar"
                outlined
                class="w-full sm:w-auto"
                :model="viewItems"
            />

        </div>

    </div>

    </div>
        <!-- Contenu principal -->
        <div class="flex flex-col sm:flex-row w-full h-full overflow-auto">
            <!-- Calendrier principal -->
            <div class="flex-1 flex flex-col overflow-auto min-h-0" >
                <CalendarComponent ref="calendar"
                    :addCalendarContent="addCalendarContent"
                    :lstEvents="lstEvents"
                    @CurrentMonthYear="onMonthYearChanged" v-model:currentView="view" :showHeader="false"
                    class="flex-1 min-h-0" >
                    <template #fullCalendarContent="slotProps">
                        <slot class="mt-5" name="fullCalendarContent" v-bind="slotProps"/>
                    </template>
                </CalendarComponent>
            </div>
        </div>
    </div>
</template>
