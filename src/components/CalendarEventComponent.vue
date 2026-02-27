
<script setup>
    import LoadingDialogComponent from '@/components/LoadingDialogComponent.vue';
import { computed, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

 const props = defineProps({
        addCalendarContent: { type: Boolean},
        lstEvents: Array,
    });

const selectedDate = ref(new Date());
const currentMonthYear = ref(null);
const calendar = ref(null);

const loading = ref(false);
const errorReq = ref(false);



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


watch(
    () => [currentMonthYear.value?.month, currentMonthYear.value?.year],
    async ([newMonth, newYear], [oldMonth, oldYear]) => {

        if (newMonth !== oldMonth || newYear !== oldYear) {
            await getEvent(newMonth, newYear);
        }
    }
);

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
        <div class="border-b border-gray-200 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div class="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 w-full sm:w-auto">
                <Button :label="t('liToDay')" @click="selectToday" severity="Primary"
                class="text-sm sm:text-base md:text-lg font-medium px-3 py-2 sm:px-4 sm:py-2 md:px-5 md:py-3 w-full sm:w-auto" variant="outlined" rounded />
                <div class="flex items-center gap-1 sm:gap-2 mt-2 sm:mt-0 flex-wrap">
                    <Button icon="pi pi-chevron-left" variant="text" @click="prev" />

                    <DatePicker disabled="" />

                    <Button icon="pi pi-chevron-right" variant="text" @click="next" />

                    <span class="ml-1 sm:ml-2 text-sm sm:text-base md:text-lg font-semibold capitalize"> {{ currentMonthYear?.formattedMonthYear }} </span>
                </div>
            </div>

            <div class="flex items-center gap-2 flex-wrap w-full sm:w-auto mt-2 sm:mt-0 justify-start sm:justify-end">
                <SplitButton :label="t(currentViewLabel)" icon="pi pi-calendar" outlined class="hidden sm:flex" :model="viewItems" />
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
