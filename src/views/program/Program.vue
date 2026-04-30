
<script setup>
    import LoadingDialogComponent from '@/components/LoadingDialogComponent.vue';
import { Permission } from '@/model/Enum/Permission';
import ProgramService from '@/service/ProgramService';
import { useHandleAsyncError } from '@/utils/handleAsyncError';
import { hasPermission } from '@/utils/hasPermission';
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import SlideContent from './SlideContent.vue';
import StepperPrg from './StepperPrg.vue';

const { t } = useI18n();
const { handleAsyncError } = useHandleAsyncError();

const selectedDate = ref(new Date());
const currentMonthYear = ref(null);
const calendar = ref(null);
const modalTitle = ref(null);

const loading = ref(false);
const errorReq = ref(false);

const lstEvents = ref();
const lstPrg = ref();
const departments = ref([]);
const activeFilters = ref({ programIds: [], departmentIds: [] });

const panelOpen = ref(false);

const isMobile = ref(false);
const displayAddPrg = ref(false);

// Événements filtrés par programmes et départements sélectionnés
const filteredEvents = computed(() => {
    if (!lstEvents.value) { return []; }
    return lstEvents.value.filter(e => {
        const prgMatch = activeFilters.value.programIds.length === 0 || activeFilters.value.programIds.includes(e.idPrg);
        const deptMatch = activeFilters.value.departmentIds.length === 0 || activeFilters.value.departmentIds.includes(e.departmentId);
        return prgMatch && deptMatch;
    });
});

function onFilterChanged(filters) {
    activeFilters.value = filters;
}

const canAddAccess = computed(() =>
    hasPermission(Permission.PRG_MANAGER) || hasPermission(Permission.DEPART_MANAGER)
);

const view = ref('dayGridMonth');

const views = [
    { key: 'dayGridMonth', label: 'liMonth' },
    { key: 'listMonth', label: 'liList' }
];

const currentViewLabel = computed(() => views.find((v) => v.key === view.value)?.label);

const viewItems = views.map((v) => ({
    label: t(v.label),
    command: () => (view.value = v.key)
}));

// Methods

function openAdd() {
    displayAddPrg.value = true;
}

const onMonthYearChanged = (formattedMonthYear) => {
    currentMonthYear.value = formattedMonthYear;
};

const checkScreen = () => {
    isMobile.value = window.innerWidth < 640;
};

// Méthode pour sélectionner aujourd'hui
const selectToday = () => {
    const today = new Date();
    selectedDate.value = today;
    if (calendar.value) {
        calendar.value.gotoDate(today);
        const calView = calendar.value.$refs.calendarRef?.getApi()?.view;
        if (calView) {
            selectedDate.value = calView.currentStart;
        }
    }
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

function onMonthPicked(date) {
    selectedDate.value = date;
    if (calendar.value) {
        calendar.value.gotoDate(date);
    }
}

// Dialog control
const dialogVisible = computed({
    get() {
        return displayAddPrg.value;
    },
    set(val) {
        // fermer le dialog → on reset les deux flags si nécessaire
        if (!val) {
            displayAddPrg.value = false;
        }
    }
});

async function getEvent(month,year)
{
      const { error, result } = await handleAsyncError(
        () => ProgramService.getByMonthYear(month, year),
        (val) => (loading.value = val),
    );

    if(error){
        errorReq.value = error
        return;
    }

    lstEvents.value = result?.events;
    lstPrg.value = result?.prgs;

    // Extraire les départements depuis les événements
    if (result?.events) {
        const deptMap = {};
        for (const e of result.events) {
            if (e.departmentId && !deptMap[e.departmentId]) {
                deptMap[e.departmentId] = { id: e.departmentId, name: e.departmentName || `Dept ${e.departmentId}` };
            }
        }
        departments.value = Object.values(deptMap).sort((a, b) => a.name.localeCompare(b.name));
    }
}

// Watch sur selectedDate pour mettre à jour FullCalendar
watch(selectedDate, (newDate) => {
    if (calendar.value && newDate) {
        calendar.value.gotoDate(newDate);

        // En vue liste, scroller vers la date sélectionnée
        if (view.value === 'listMonth') {
            setTimeout(() => {
                const y = newDate.getFullYear();
                const m = String(newDate.getMonth() + 1).padStart(2, '0');
                const d = String(newDate.getDate()).padStart(2, '0');
                const dateStr = `${y}-${m}-${d}`;
                // FullCalendar list view uses th[data-date] inside .fc-list-day
                const el = document.querySelector(`.fc-list-day th[data-date="${dateStr}"]`)
                    || document.querySelector(`[data-date="${dateStr}"]`);
                if (el) {
                    const row = el.closest('tr') || el;
                    row.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    // Flash highlight
                    row.style.transition = 'background 0.3s';
                    row.style.background = 'rgba(var(--p-primary-500), 0.15)';
                    setTimeout(() => { row.style.background = ''; }, 1500);
                }
            }, 200);
        }
    }
});

watch(
    () => [currentMonthYear.value?.month, currentMonthYear.value?.year],
    async ([newMonth, newYear], [oldMonth, oldYear]) => {

        if (newMonth !== oldMonth || newYear !== oldYear) {
            await getEvent(newMonth, newYear);
        }
    }
);
onMounted( async () => {
    await getEvent(currentMonthYear.value.month,currentMonthYear.value.year);
    checkScreen();
    window.addEventListener('resize', checkScreen);

    // Charger les départements depuis les événements (pas d'appel supplémentaire)
    // Les départements sont extraits des événements déjà chargés
});

onUnmounted(() => {
    window.removeEventListener('resize', checkScreen);
});
</script>


<template>
    <PageComponent :title-page="$t('Programs')" @btn-add="openAdd" :showAddBtn="canAddAccess"
        :breadcrumbs="[{ label: $t('Programs') }]">
        <div class="flex flex-col h-screen">
            <LoadingDialogComponent :onLoading="loading" :errorReq="errorReq"/>
            <!-- Barre d'outils -->
            <div class="border-b border-gray-200 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div class="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 w-full sm:w-auto">

                    <div class="sm:hidden self-start">
                        <Button icon="pi pi-bars" text @click="panelOpen = !panelOpen" />
                    </div>
                    <Button :label="t('liToDay')" @click="selectToday" severity="Primary"
                    class="text-sm sm:text-base md:text-lg font-medium px-3 py-2 sm:px-4 sm:py-2 md:px-5 md:py-3 w-full sm:w-auto" variant="outlined" rounded />
                    <div class="flex items-center gap-1 sm:gap-2 mt-2 sm:mt-0 flex-wrap">
                        <Button icon="pi pi-chevron-left" variant="text" @click="prev" />
                        <Button icon="pi pi-chevron-right" variant="text" @click="next" />

                        <DatePicker v-model="selectedDate" view="month" dateFormat="MM yy"
                            class="ml-1 sm:ml-2"
                            inputClass="text-sm sm:text-base md:text-lg font-semibold capitalize cursor-pointer border-none bg-transparent p-0 w-auto shadow-none"
                            @date-select="onMonthPicked"
                        />
                    </div>
                </div>

                <div class="flex items-center gap-2 flex-wrap w-full sm:w-auto mt-2 sm:mt-0 justify-start sm:justify-end">
                    <SplitButton :label="t(currentViewLabel)" icon="pi pi-calendar" outlined class="hidden sm:flex" :model="viewItems" />
                </div>
            </div>
            <!-- Contenu principal -->
            <div class="flex flex-col sm:flex-row w-full h-full overflow-auto">
                <!-- Sidebar / Liste -->
                <div class="bg-white border-r border-gray-200 flex flex-col w-full sm:w-1/4">
                    <div v-if="view !== 'dayGridMonth'">
                        <DatePicker inline class="w-full" v-model="selectedDate" />
                    </div>
                    <div class="flex-1 bg-white border-l pt-4 overflow-y-auto">
                        <!-- Mobile : Drawer -->
                        <Drawer v-if="isMobile" v-model:visible="panelOpen">
                            <SlideContent :prgs="lstPrg" :departments="departments" @filterChanged="onFilterChanged" />
                        </Drawer>

                        <!-- Desktop : contenu normal -->
                        <div v-else class="flex-1 overflow-y-auto">
                            <SlideContent :prgs="lstPrg" :departments="departments" @filterChanged="onFilterChanged" />
                        </div>
                    </div>
                </div>

                <!-- Calendrier principal (toujours visible) -->
                <div class="flex-1 flex flex-col overflow-auto min-h-0">
                    <CalendarComponent ref="calendar" :showHeader="false" :lstEvents="filteredEvents"
                        @CurrentMonthYear="onMonthYearChanged" v-model:currentView="view"
                    class="flex-1 min-h-0" />
                </div>
            </div>
        </div>
    </PageComponent>
    <Dialog  v-model:visible="dialogVisible" :header="modalTitle" :modal="true" :style="{ width: '50rem' }" :breakpoints="{ '1199px': '75vw', '575px': '90vw' }" >
        <StepperPrg @closeModal="() => (displayAddPrg = false)" @step-title="modalTitle=$event" />
    </Dialog>
</template>
