<script setup>
import AssignmentSidebar from '@/components/AssignmentSidebar.vue';
import RecapTable from '@/components/RecapTable.vue';
import DepartmentService from '@/service/DepartmentService';
import { createSeededRandom, getSundays, useMonthNavigation } from '@/utils/composables/useCalendar';
import { useHandleAsyncError } from '@/utils/handleAsyncError';
import { computed, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const { handleAsyncError } = useHandleAsyncError();

const props = defineProps({
    departmentSelected: [String, Number]
});

// State
const currentMonthYear = ref(null);
const loading = ref(false);
const errorReq = ref(null);
const lstEvents = ref([]);

// View mode fixé en tableau
const viewMode = ref('table');

// 4.1 - Table mode state (using shared composable)
const { month: tableMonth, year: tableYear, monthLabel: tableMonthLabel, navigateMonth: navigateTableMonth } = useMonthNavigation();
const monthlyData = ref(null);
const tableLoading = ref(false);
const searchQuery = ref('');

// Sidebar state
const selectedDate = ref(null);
const sidebarVisible = ref(false);

// Responsive
const isMobile = ref(window.innerWidth < 640);
window.addEventListener('resize', () => { isMobile.value = window.innerWidth < 640; });

// 4.3 - Compute serviceDates from monthlyData for RecapTable
const serviceDates = computed(() => {
    if (!monthlyData.value?.assignments) return [];
    const datesMap = new Map();
    for (const a of monthlyData.value.assignments) {
        if (!datesMap.has(a.date)) {
            const d = new Date(a.date + 'T00:00:00');
            const dayLabel = d.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric' });
            datesMap.set(a.date, { date: a.date, dayLabel, services: [] });
        }
        const entry = datesMap.get(a.date);
        if (!entry.services.some((s) => s.id === a.serviceId)) {
            entry.services.push({ id: a.serviceId, title: a.serviceName, startTime: a.startTime, endTime: a.endTime });
        }
    }
    // Also add dates from availabilities that have services
    if (monthlyData.value?.availabilities) {
        for (const av of monthlyData.value.availabilities) {
            if (!datesMap.has(av.date)) {
                const d = new Date(av.date + 'T00:00:00');
                const dayLabel = d.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric' });
                datesMap.set(av.date, { date: av.date, dayLabel, services: [{ id: 0, title: '', startTime: '', endTime: '' }] });
            }
        }
    }
    return Array.from(datesMap.values()).sort((a, b) => a.date.localeCompare(b.date));
});

// Fetch planning events (calendar mode)
async function fetchPlanning() {
    if (!props.departmentSelected || !currentMonthYear.value) return;

    const { result, error } = await handleAsyncError(
        () => DepartmentService.getPlanning(props.departmentSelected, currentMonthYear.value.month, currentMonthYear.value.year),
        (val) => (loading.value = val)
    );

    errorReq.value = error;
    if (error) return;
    lstEvents.value = result || [];
}

// --- MOCK DATA (à retirer quand l'API est prête) ---
function generateMockData(month, year) {
    const members = [
        { id: 1, firstName: 'Jean', lastName: 'Dupont', fonction: 'Live' },
        { id: 2, firstName: 'Marie', lastName: 'Kouassi', fonction: 'Chorale' },
        { id: 3, firstName: 'Paul', lastName: 'Mbeki', fonction: 'Son' },
        { id: 4, firstName: 'Sarah', lastName: 'Ndiaye', fonction: 'Accueil' },
        { id: 5, firstName: 'David', lastName: 'Okafor', fonction: 'Camera' },
        { id: 6, firstName: 'Ruth', lastName: 'Bamba', fonction: 'Chorale' },
        { id: 7, firstName: 'Samuel', lastName: 'Traoré', fonction: 'Régie' },
        { id: 8, firstName: 'Esther', lastName: 'Diallo', fonction: 'Live' }
    ];

    const services = [
        { id: 1, name: 'Culte de célébration', startTime: '09:00', endTime: '12:00' },
        { id: 2, name: 'École du dimanche', startTime: '09:00', endTime: '10:00' },
        { id: 3, name: 'Culte du soir', startTime: '17:00', endTime: '19:00' }
    ];

    const sundays = getSundays(month, year);
    const assignments = [];
    const availabilities = [];
    let assignId = 1;
    const seededRandom = createSeededRandom(month * 1000 + year);

    for (const sunday of sundays) {
        const sundayServices = seededRandom() > 0.4 ? services : services.slice(0, 2);

        for (const member of members) {
            const isAvailable = seededRandom() > 0.25;
            availabilities.push({ memberId: member.id, date: sunday, isAvailable });

            if (isAvailable) {
                for (const svc of sundayServices) {
                    if (seededRandom() > 0.5) {
                        assignments.push({
                            id: assignId++,
                            memberId: member.id,
                            date: sunday,
                            serviceId: svc.id,
                            serviceName: svc.name,
                            startTime: svc.startTime,
                            endTime: svc.endTime
                        });
                    }
                }
            }
        }
    }

    return { members, assignments, availabilities };
}

// 4.4 - Fetch monthly assignments (table mode)
async function fetchMonthlyAssignments() {
    if (!props.departmentSelected) return;

    const { result, error } = await handleAsyncError(
        () => DepartmentService.getMonthlyAssignments(props.departmentSelected, tableMonth.value, tableYear.value),
        (val) => (tableLoading.value = val)
    );

    if (!error && result) {
        monthlyData.value = result;
    } else {
        // Fallback mock data pour le développement
        monthlyData.value = generateMockData(tableMonth.value, tableYear.value);
    }
}

function onMonthYearChanged(data) {
    currentMonthYear.value = data;
}

function onDateClicked(date) {
    selectedDate.value = date;
    sidebarVisible.value = true;
}

// 4.7 - Cell click from RecapTable opens sidebar
function onTableCellClick(date) {
    selectedDate.value = date;
    sidebarVisible.value = true;
}

function onAssignmentChanged() {
    fetchPlanning();
    if (viewMode.value === 'table') {
        fetchMonthlyAssignments();
    }
}

// Reload on department change
watch(
    () => props.departmentSelected,
    () => {
        lstEvents.value = [];
        monthlyData.value = null;
        sidebarVisible.value = false;
        fetchPlanning();
        if (viewMode.value === 'table') {
            fetchMonthlyAssignments();
        }
    }
);

// Reload on month/year change (calendar)
watch(currentMonthYear, () => {
    fetchPlanning();
});

// 4.8 - Watcher: reload table data when viewMode, month, year or department changes
watch([viewMode, tableMonth, tableYear], ([newMode]) => {
    if (newMode === 'table' && props.departmentSelected) {
        fetchMonthlyAssignments();
    }
});

// --- Export / Share / Publish ---
function exportPdf() {
    window.print();
}

function sharePlanning() {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
}

function publishPlanning() {
    // TODO: Appeler l'API de publication quand elle sera prête
}
</script>

<template>
    <div>
        <!-- 4.9 - No department selected (both modes) -->
        <EmptyStateComponent v-if="!departmentSelected" icon="pi pi-sitemap" :title="$t('planning.selectDeptTitle')" :description="$t('planning.selectDeptDesc')" />

        <div v-else class="flex flex-col h-[calc(100vh-220px)]">
            <!-- Toolbar -->
            <div class="bg-surface-0 dark:bg-surface-900 rounded-xl border border-surface-200 dark:border-surface-700 p-3 sm:p-4 mb-4">
                <!-- Row 1: Month nav centered -->
                <div class="flex items-center justify-center gap-3 mb-3">
                    <Button icon="pi pi-chevron-left" text rounded @click="navigateTableMonth(-1)" :aria-label="$t('planning.previousMonth')" />
                    <span class="font-semibold text-base sm:text-lg min-w-[160px] text-center capitalize">{{ tableMonthLabel }}</span>
                    <Button icon="pi pi-chevron-right" text rounded @click="navigateTableMonth(1)" :aria-label="$t('planning.nextMonth')" />
                </div>

                <!-- Row 2: Search + actions -->
                <div class="flex items-center justify-between flex-wrap gap-3">
                    <IconField class="flex-1 max-w-xs">
                        <InputIcon class="pi pi-search" />
                        <InputText v-model="searchQuery" :placeholder="$t('planning.searchMembers')" size="small" class="w-full" />
                    </IconField>
                    <div class="flex items-center gap-2">
                        <Button icon="pi pi-file-pdf" :label="isMobile ? '' : $t('planning.exportPdf')" outlined size="small" @click="exportPdf" v-tooltip.bottom="$t('planning.exportPdf')" />
                        <Button icon="pi pi-share-alt" :label="isMobile ? '' : $t('planning.share')" outlined size="small" @click="sharePlanning" v-tooltip.bottom="$t('planning.share')" />
                        <Button icon="pi pi-megaphone" :label="isMobile ? '' : $t('planning.publish')" severity="success" size="small" @click="publishPlanning" v-tooltip.bottom="$t('planning.publish')" />
                    </div>
                </div>
            </div>

            <!-- Table -->
            <div class="flex-1 min-h-0 flex flex-col lg:flex-row">
                <div class="flex-1 min-w-0 overflow-auto">
                    <RecapTable
                        :members="monthlyData?.members || []"
                        :assignments="monthlyData?.assignments || []"
                        :availabilities="monthlyData?.availabilities || []"
                        :service-dates="serviceDates"
                        :loading="tableLoading"
                        :search-query="searchQuery"
                        :selected-date="selectedDate"
                        :month="tableMonth"
                        :year="tableYear"
                        @cell-click="onTableCellClick"
                    />
                </div>

                <!-- Assignment Sidebar -->
                <AssignmentSidebar
                    v-if="sidebarVisible && departmentSelected"
                    :visible="sidebarVisible"
                    :department-id="departmentSelected"
                    :selected-date="selectedDate"
                    @update:visible="sidebarVisible = $event"
                    @assignment-changed="onAssignmentChanged"
                />
            </div>
        </div>
    </div>
</template>

<style scoped>
:deep(.fc) {
    height: 100%;
}
</style>
