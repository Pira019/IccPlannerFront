
<script setup>

import LoadingDialogComponent from '@/components/LoadingDialogComponent.vue';
import { computed, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

const emit = defineEmits(['CurrentMonthYear','clickedDate']);



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
        <LoadingDialogComponent :onLoading="loading" :errorReq="errorReq" />

        <!-- Barre d'outils -->
        <div class="border-b border-surface-200 p-3 sm:p-4 flex-shrink-0">
            <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 sm:gap-4">
                <!-- LEFT SECTION -->
                <div class="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 w-full lg:w-auto">
                    <Button :label="t('liToDay')" @click="selectToday" severity="primary" outlined rounded class="w-full sm:w-auto text-sm font-medium px-3 py-2" />

                    <div class="flex items-center gap-1 sm:gap-2 justify-between sm:justify-start flex-wrap">
                        <Button icon="pi pi-chevron-left" text @click="prev" class="flex-shrink-0" />

                        <DatePicker v-model="selectedDate" class="w-32 sm:w-40 md:w-44" dateFormat="dd/mm/yy" showIcon iconDisplay="input" />

                        <Button icon="pi pi-chevron-right" text @click="next" class="flex-shrink-0" />

                        <span class="text-xs sm:text-sm md:text-base font-semibold capitalize ml-2 hidden md:inline">
                            {{ currentMonthYear?.formattedMonthYear }}
                        </span>
                    </div>
                </div>

                <!-- Mobile/Tablet month/year display -->
                <div class="md:hidden text-center">
                    <span class="text-sm font-semibold capitalize">
                        {{ currentMonthYear?.formattedMonthYear }}
                    </span>
                </div>

                <!-- RIGHT SECTION -->
                <div class="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 w-full lg:w-auto">
                    <div class="w-full sm:w-auto">
                        <slot name="rightContent" />
                    </div>

                    <SplitButton :label="t(currentViewLabel)" icon="pi pi-calendar" outlined class="w-full sm:w-auto" :model="viewItems" />
                </div>
            </div>
        </div>

        <!-- Contenu principal -->
        <div class="flex-1 overflow-auto min-h-0">
            <CalendarComponent
                ref="calendar"
                :addCalendarContent="addCalendarContent"
                :lstEvents="lstEvents"
                @CurrentMonthYear="onMonthYearChanged"
                @clickedDate="$emit('clickedDate', $event)"
                v-model:currentView="view"
                :showHeader="false"
                class="h-full"
            >
                <template #fullCalendarContent="slotProps">
                    <slot name="fullCalendarContent" v-bind="slotProps" />
                </template>
            </CalendarComponent>
        </div>
    </div>
</template>
