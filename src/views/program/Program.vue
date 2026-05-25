
<script setup>
    import LoadingDialogComponent from '@/components/LoadingDialogComponent.vue';
import { Permission } from '@/model/Enum/Permission';
import ProgramService from '@/service/ProgramService';
import TabServicePrgService from '@/service/TabServicePrgService';
import { useHandleAsyncError } from '@/utils/handleAsyncError';
import { hasPermission } from '@/utils/hasPermission';
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
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

const panelOpen = ref(false);

const isMobile = ref(false);
const displayAddPrg = ref(false);

// Detail programme
const showDetailDialog = ref(false);
const selectedEvents = ref([]);
const selectedDateStr = ref('');
const detailPayload = ref(null);
const selectedProgramEvent = ref(null);
const detailServices = ref([]);
const detailLoading = ref(false);

function onProgramClicked(eventData) {
    const ev = filteredEvents.value.find(e => e.date === eventData.date && e.idPrg === eventData.idPrg)
        || filteredEvents.value.find(e => e.date === eventData.date);
    if (ev) {
        viewProgramServices(ev);
    }
}

function onEventClicked(dateStr) {
    selectedDateStr.value = dateStr;
    selectedEvents.value = filteredEvents.value.filter(e => e.date === dateStr);
    if (selectedEvents.value.length === 1) {
        viewProgramServices(selectedEvents.value[0]);
    } else if (selectedEvents.value.length > 1) {
        showDetailDialog.value = true;
        selectedProgramEvent.value = null;
        detailServices.value = [];
    }
}

async function viewProgramServices(ev) {
    selectedProgramEvent.value = ev;
    selectedDateStr.value = ev.date;
    showDetailDialog.value = true;
    detailServices.value = [];

    const payload = {
        programId: ev.idPrg,
        date: ev.date
    };

    const { result } = await handleAsyncError(
        () => TabServicePrgService.GetTabServicesPrgAsync(payload),
        (val) => (detailLoading.value = val)
    );
    if (result) {
        detailServices.value = result;
    }
}

function backToList() {
    selectedProgramEvent.value = null;
    detailServices.value = [];
}

function getProgramDisplayName(ev) {
    return ev.fullName || ev.title;
}

const allDepartmentsInServices = computed(() => {
    const depts = new Map();
    for (const group of detailServices.value) {
        for (const prg of group.servicePrograms || []) {
            if (prg.departmentName && !depts.has(prg.departmentId)) {
                depts.set(prg.departmentId, {
                    id: prg.departmentId,
                    name: prg.departmentName,
                    shortName: prg.departmentShortName
                });
            }
        }
    }
    return [...depts.values()].sort((a, b) => a.name.localeCompare(b.name));
});

// Événements dedupliques (un programme par jour)
const filteredEvents = computed(() => {
    if (!lstEvents.value) { return []; }
    const seen = new Set();
    return lstEvents.value.filter(e => {
        const key = `${e.date}_${e.idPrg}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
    }).map(e => ({
        ...e,
        fullName: e.title,
        title: e.shortName || e.title
    }));
});

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
                deptMap[e.departmentId] = { id: e.departmentId, name: e.departmentName || `Dept ${e.departmentId}`, shortName: e.departmentShortName };
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
                <!-- Sidebar : DatePicker en vue liste -->
                <div v-if="view !== 'dayGridMonth'" class="bg-white border-r border-gray-200 w-full sm:w-1/4">
                    <DatePicker inline class="w-full" v-model="selectedDate" />
                </div>

                <!-- Calendrier principal -->
                <div class="flex-1 flex flex-col overflow-auto min-h-0">
                    <CalendarComponent ref="calendar" :showHeader="false" :lstEvents="filteredEvents"
                        @CurrentMonthYear="onMonthYearChanged" v-model:currentView="view"
                        @eventClicked="onProgramClicked"
                    class="flex-1 min-h-0" />
                </div>
            </div>
        </div>
    </PageComponent>
    <Dialog  v-model:visible="dialogVisible" :header="modalTitle" :modal="true" :style="{ width: '50rem' }" :breakpoints="{ '1199px': '75vw', '575px': '90vw' }" >
        <StepperPrg @closeModal="() => (displayAddPrg = false)" @step-title="modalTitle=$event" />
    </Dialog>

    <!-- Detail programme -->
    <Dialog v-model:visible="showDetailDialog" :header="selectedProgramEvent ? (getProgramDisplayName(selectedProgramEvent) + ' - ' + selectedDateStr) : selectedDateStr" modal :style="{ width: '700px' }" :breakpoints="{ '1199px': '75vw', '575px': '95vw' }">
        <!-- Liste des programmes (si plusieurs pour cette date) -->
        <template v-if="!selectedProgramEvent">
            <div v-if="selectedEvents.length === 0" class="text-muted-color text-sm py-4">Aucun programme pour cette date.</div>
            <div v-else class="flex flex-col gap-3">
                <div v-for="ev in selectedEvents" :key="ev.id"
                    class="p-4 rounded-lg border border-surface-200 dark:border-surface-700 cursor-pointer hover:bg-surface-50 dark:hover:bg-surface-800 transition"
                    @click="viewProgramServices(ev)">
                    <div class="flex items-center justify-between">
                        <div class="font-semibold text-base">{{ getProgramDisplayName(ev) }}</div>
                        <i class="pi pi-chevron-right text-muted-color text-sm"></i>
                    </div>
                    <div class="flex flex-wrap gap-2 mt-2">
                        <Tag :value="ev.departmentName || '-'" severity="info" class="text-xs" />
                        <Tag v-if="ev.indRecurrent" value="Recurrent" severity="warn" class="text-xs" />
                        <Tag v-else value="Ponctuel" severity="secondary" class="text-xs" />
                    </div>
                </div>
            </div>
        </template>

        <!-- Services du programme selectionne -->
        <template v-else>
            <div class="flex flex-wrap gap-2 mb-4">
                <Tag v-if="selectedProgramEvent.indRecurrent" value="Recurrent" severity="warn" class="text-xs" />
                <Tag v-else value="Ponctuel" severity="secondary" class="text-xs" />
                <Tag :value="selectedDateStr" severity="secondary" icon="pi pi-calendar" class="text-xs" />
            </div>

            <div v-if="detailLoading" class="flex justify-center py-6"><ProgressSpinner /></div>
            <div v-else-if="detailServices.length === 0" class="text-muted-color text-sm py-4">{{ $t('noServices') }}</div>
            <div v-else>
                <Tabs :value="allDepartmentsInServices[0]?.name || '0'">
                    <TabList>
                        <Tab v-for="dept in allDepartmentsInServices" :key="dept.id" :value="dept.name" v-tooltip="dept.name">
                            {{ (dept.shortName || dept.name).toUpperCase() }}
                        </Tab>
                    </TabList>
                    <TabPanels>
                        <TabPanel v-for="dept in allDepartmentsInServices" :key="dept.id" :value="dept.name">
                            <div class="flex flex-col gap-2 mt-3">
                                <template v-for="group in detailServices" :key="group.groupKey">
                                    <template v-for="prg in group.servicePrograms.filter(p => p.departmentName === dept.name)" :key="prg.programId + '-' + prg.departmentId">
                                        <div v-for="svc in prg.services" :key="svc.idTabService"
                                            class="p-3 rounded-lg border border-surface-200 dark:border-surface-700">
                                            <div class="flex items-center justify-between">
                                                <span class="font-semibold text-sm">{{ svc.serviceTitle }}</span>
                                                <div class="flex items-center gap-2">
                                                    <span class="text-xs font-mono bg-primary text-white px-2 py-0.5 rounded">{{ svc.startTime }}</span>
                                                    <span v-if="svc.endTime" class="text-xs text-muted-color">- {{ svc.endTime }}</span>
                                                </div>
                                            </div>
                                            <div v-if="svc.arrivalTime" class="text-xs text-muted-color mt-1">
                                                <i class="pi pi-clock mr-1"></i>Arrivee : {{ svc.arrivalTime }}
                                            </div>
                                            <div v-if="svc.notes" class="text-xs text-muted-color mt-1 italic">
                                                <i class="pi pi-comment mr-1"></i>{{ svc.notes }}
                                            </div>
                                        </div>
                                    </template>
                                </template>
                            </div>
                        </TabPanel>
                    </TabPanels>
                </Tabs>
            </div>
        </template>

        <template #footer>
            <Button :label="$t('Close')" text @click="showDetailDialog = false; selectedProgramEvent = null; detailServices = []" />
        </template>
    </Dialog>
</template>
