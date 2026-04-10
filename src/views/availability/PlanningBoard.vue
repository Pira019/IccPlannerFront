<script setup>
import AvailabilityService from '@/service/AvailabilityService';
import DepartmentService from '@/service/DepartmentService';
import PlanningService from '@/service/PlanningService';
import ServicePrgService from '@/service/ServicePrgService';
import { buildCalendarWeeks, useMonthNavigation, WEEK_DAYS } from '@/utils/composables/useCalendar';
import { useHandleAsyncError } from '@/utils/handleAsyncError';
import { useConfirmDialog } from '@/utils/useConfirmDialog';
import { computed, onMounted, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

const { locale, t } = useI18n();
const { handleAsyncError } = useHandleAsyncError();
const { showConfirm } = useConfirmDialog();

const props = defineProps({
    departmentSelected: [String, Number]
});

const { month: currentMonth, year: currentYear, monthLabel, navigateMonth } = useMonthNavigation();
const loading = ref(false);
const dates = ref([]);
const weekDays = WEEK_DAYS;
const viewMode = ref('calendar');

// DatePicker pour navigation mois/année
const selectedMonthDate = computed({
    get() {
        return new Date(currentYear.value, currentMonth.value - 1, 1);
    },
    set(val) {
        if (val) {
            currentMonth.value = val.getMonth() + 1;
            currentYear.value = val.getFullYear();
        }
    }
});

// Sidebar
const selectedDate = ref(null);
const sidebarVisible = ref(false);
const availableMembers = ref([]);
const loadingMembers = ref(false);
const errorMessage = ref(null);

// Postes
const postes = ref([]);

// Planning mensuel
const monthlyPlanning = ref([]);
const periodStatus = ref(null);

// Responsive
const isMobile = ref(window.innerWidth < 640);
window.addEventListener('resize', () => { isMobile.value = window.innerWidth < 640; });

// Couleurs pour les postes
const posteColors = [
    { bg: 'bg-blue-100', text: 'text-blue-700' },
    { bg: 'bg-purple-100', text: 'text-purple-700' },
    { bg: 'bg-teal-100', text: 'text-teal-700' },
    { bg: 'bg-pink-100', text: 'text-pink-700' },
    { bg: 'bg-amber-100', text: 'text-amber-700' },
    { bg: 'bg-cyan-100', text: 'text-cyan-700' },
    { bg: 'bg-indigo-100', text: 'text-indigo-700' },
    { bg: 'bg-rose-100', text: 'text-rose-700' }
];
const posteColorMap = {};
function getPosteColor(posteName) {
    if (!posteName) { return { bg: 'bg-surface-100', text: 'text-surface-500' }; }
    if (!posteColorMap[posteName]) {
        const idx = Object.keys(posteColorMap).length % posteColors.length;
        posteColorMap[posteName] = posteColors[idx];
    }
    return posteColorMap[posteName];
}

function groupByPoste(members) {
    const groups = {};
    for (const m of members) {
        const key = m.posteName || '-';
        if (!groups[key]) { groups[key] = []; }
        groups[key].push(m);
    }
    return groups;
}

// Calendar grid
const plannedByDate = computed(() => {
    const map = {};
    for (const prg of monthlyPlanning.value) {
        const prgLabel = prg.programShortName || prg.programName?.substring(0, 3);
        for (const d of prg.dates || []) {
            if (!map[d.date]) { map[d.date] = []; }
            let prgEntry = map[d.date].find(p => p.program === prgLabel);
            if (!prgEntry) {
                prgEntry = { program: prgLabel, services: [] };
                map[d.date].push(prgEntry);
            }
            for (const svc of d.services || []) {
                prgEntry.services.push({
                    service: svc.serviceName,
                    members: svc.members || []
                });
            }
        }
    }
    return map;
});

const calendarWeeks = computed(() => {
    return buildCalendarWeeks(currentMonth.value, currentYear.value, (dateStr) => {
        const hasDate = dates.value.some(d => d.date === dateStr);
        const planned = plannedByDate.value[dateStr] || [];
        return { hasDate, planned };
    });
});

// Mobile: flat list of days with dates
const daysWithDates = computed(() => {
    const days = [];
    for (const week of calendarWeeks.value) {
        for (const cell of week) {
            if (cell?.hasDate) days.push(cell);
        }
    }
    return days;
});

// Table view: members as rows, dates as columns
const tableDates = computed(() => {
    const dateSet = new Set();
    for (const prg of monthlyPlanning.value) {
        for (const d of prg.dates || []) {
            dateSet.add(d.date);
        }
    }
    return [...dateSet].sort();
});

const tableRows = computed(() => {
    // Collect all unique members with their assignments per date
    const memberMap = {};
    for (const prg of monthlyPlanning.value) {
        const prgLabel = prg.programShortName || prg.programName?.substring(0, 3);
        for (const d of prg.dates || []) {
            for (const svc of d.services || []) {
                for (const m of svc.members || []) {
                    if (!memberMap[m.memberName]) {
                        memberMap[m.memberName] = { memberName: m.memberName, posteName: m.posteName, assignments: {} };
                    }
                    if (!memberMap[m.memberName].assignments[d.date]) {
                        memberMap[m.memberName].assignments[d.date] = [];
                    }
                    memberMap[m.memberName].assignments[d.date].push({
                        program: prgLabel,
                        service: svc.serviceName,
                        indTraining: m.indTraining
                    });
                }
            }
        }
    }
    return Object.values(memberMap).sort((a, b) => a.memberName.localeCompare(b.memberName));
});

function formatShortDate(dateStr) {
    if (!dateStr) return '';
    const d = new Date(dateStr + 'T00:00:00');
    const day = d.getDate();
    const weekDay = weekDays[(d.getDay() + 6) % 7];
    return `${weekDay.substring(0, 3)} ${day}`;
}

const totalAvailableMembers = computed(() => {
    return availableMembers.value.reduce((sum, s) => sum + (s.availableMembers?.length || 0), 0);
});

// Sidebar tab
const sidebarTab = ref('available');
const selectedServiceFilter = ref(null);

// Services disponibles pour le filtre
const serviceFilterOptions = computed(() => {
    return availableMembers.value.map(s => ({
        label: s.serviceName,
        value: s.servicePrgId
    }));
});

// Membres filtrés par service
const filteredAvailableMembers = computed(() => {
    if (!selectedServiceFilter.value) {
        return availableMembers.value;
    }
    return availableMembers.value.filter(s => s.servicePrgId === selectedServiceFilter.value);
});

// Membres assignés pour la date sélectionnée (depuis plannedByDate)
const assignedByService = computed(() => {
    if (!selectedDate.value) return [];
    const entries = plannedByDate.value[selectedDate.value] || [];
    const result = [];
    for (const prg of entries) {
        for (const svc of prg.services) {
            result.push({
                program: prg.program,
                service: svc.service,
                members: svc.members || []
            });
        }
    }
    return result;
});

const totalAssigned = computed(() => {
    return assignedByService.value.reduce((sum, s) => sum + s.members.length, 0);
});

function formatDate(dateStr) {
    if (!dateStr) return '';
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString(locale.value, { weekday: 'long', day: 'numeric', month: 'long' });
}

function formatCreatedAt(dateStr) {
    if (!dateStr) return t('planning.noInfo');
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return t('planning.noInfo');
    return t('planning.availableSince') + ' ' + d.toLocaleString(locale.value, { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

async function fetchDates() {
    if (!props.departmentSelected) return;
    const { result } = await handleAsyncError(
        () => ServicePrgService.getDatesAsync(currentMonth.value, currentYear.value, props.departmentSelected),
        (val) => (loading.value = val)
    );
    dates.value = result || [];
}

async function fetchAvailableMembers(date) {
    if (!props.departmentSelected || !date) return;
    errorMessage.value = null;
    const { result, error } = await handleAsyncError(
        () => AvailabilityService.getAvailableMembersByDate(props.departmentSelected, date),
        (val) => (loadingMembers.value = val)
    );
    if (error?.statusCode === 403) {
        errorMessage.value = t('planning.forbidden');
        availableMembers.value = [];
        return;
    }
    availableMembers.value = result || [];
    // Pré-remplir les champs pour les membres déjà assignés
    for (const svc of availableMembers.value) {
        for (const m of svc.availableMembers || []) {
            if (m.isPlanned) {
                m.selectedPosteId = m.posteId;
                m.indTraining = m.isTraining;
            }
        }
    }
}

function onDateClicked(dateStr) {
    selectedDate.value = dateStr;
    sidebarVisible.value = true;
    fetchAvailableMembers(dateStr);
}

function closeSidebar() {
    sidebarVisible.value = false;
    selectedDate.value = null;
    availableMembers.value = [];
    errorMessage.value = null;
    sidebarTab.value = 'available';
    selectedServiceFilter.value = null;
}

function exportPdf() { window.print(); }
function sharePlanning() { navigator.clipboard.writeText(window.location.href); }
async function publishPlanning() {
    if (!props.departmentSelected) return;
    const { error } = await handleAsyncError(
        () => PlanningService.publish(props.departmentSelected, currentMonth.value, currentYear.value),
        null,
        true,
        'planning.publishSuccess'
    );
    if (error) {
        errorMessage.value = error.message;
        return;
    }
    fetchPeriodStatus();
}

async function assignMember(member, service) {
    if (!props.departmentSelected || !selectedDate.value) return;
    errorMessage.value = null;
    member.posteError = false;

    // Valider que le poste est sélectionné
    if (!member.selectedPosteId) {
        member.posteError = true;
        return;
    }

    await doAssign(member, service, false);
}

async function doAssign(member, service, force) {
    member.assigning = true;
    const { result, error } = await handleAsyncError(
        () => PlanningService.assign(props.departmentSelected, {
            availabilityId: member.availabilityId,
            posteId: member.selectedPosteId,
            indTraining: member.indTraining || false,
            forceAssign: force
        })
    );
    member.assigning = false;
    if (error?.statusCode === 403) {
        errorMessage.value = t('planning.forbidden');
        return;
    }
    // Extension 3g — Warning de chevauchement → popup de confirmation
    if (error?.IsWarning) {
        showConfirm({
            group: 'confirmDialog',
            message: error.message,
            header: 'planning.overlapTitle',
            acceptLabel: 'planning.forceAssign',
            acceptSeverity: 'warn',
            rejectLabel: 'Cancel',
            onAccept: () => doAssign(member, service, true)
        });
        return;
    }
    if (error) {
        errorMessage.value = error.message;
        return;
    }
    if (result?.planningId) {
        member.isPlanned = true;
        member.planningId = result.planningId;
        fetchMonthlyPlanning();
        fetchPeriodStatus();
    }
}

async function unassignMember(member) {
    if (!member.planningId) return;
    errorMessage.value = null;
    member.assigning = true;
    const { error } = await handleAsyncError(
        () => PlanningService.unassign(member.planningId),
        null,
        true,
        'planning.unassignSuccess'
    );
    member.assigning = false;
    if (error?.statusCode === 403) {
        errorMessage.value = t('planning.forbidden');
        return;
    }
    if (error) {
        errorMessage.value = error.message;
        return;
    }
    member.isPlanned = false;
    member.planningId = null;
    member.selectedPosteId = null;
    fetchMonthlyPlanning();
    fetchPeriodStatus();
}

async function updateMember(member) {
    if (!member.planningId) return;
    errorMessage.value = null;
    member.updating = true;
    const { error } = await handleAsyncError(
        () => PlanningService.update(member.planningId, {
            posteId: member.selectedPosteId,
            indTraining: member.indTraining || false,
            indObservation: false
        }),
        null,
        true,
        'planning.updateSuccess'
    );
    member.updating = false;
    if (error?.statusCode === 403) {
        errorMessage.value = t('planning.forbidden');
        return;
    }
    if (error) {
        errorMessage.value = error.message;
        return;
    }
    member.isTraining = member.indTraining;
    fetchMonthlyPlanning();
    fetchPeriodStatus();
}

async function fetchPostes() {
    if (!props.departmentSelected) return;
    const { result } = await handleAsyncError(() => DepartmentService.getPostes(props.departmentSelected));
    postes.value = result || [];
}

async function fetchMonthlyPlanning() {
    if (!props.departmentSelected) return;
    const { result } = await handleAsyncError(
        () => PlanningService.getMonthlyPlanning(currentMonth.value, currentYear.value, props.departmentSelected)
    );
    monthlyPlanning.value = result || [];
}

async function fetchPeriodStatus() {
    if (!props.departmentSelected) return;
    const { result } = await handleAsyncError(
        () => PlanningService.getStatus(currentMonth.value, currentYear.value, props.departmentSelected)
    );
    periodStatus.value = result;
}

onMounted(() => {
    if (props.departmentSelected) fetchPostes();
});

watch(() => props.departmentSelected, () => { dates.value = []; closeSidebar(); fetchDates(); fetchPostes(); fetchMonthlyPlanning(); fetchPeriodStatus(); });
watch([currentMonth, currentYear], () => { fetchDates(); fetchMonthlyPlanning(); fetchPeriodStatus(); });
</script>

<template>
    <div>
        <EmptyStateComponent v-if="!departmentSelected" icon="pi pi-sitemap" :title="$t('planning.selectDeptTitle')" :description="$t('planning.selectDeptDesc')" />

        <div v-else>
            <!-- Header -->
            <div class="flex items-center justify-between mb-4 flex-wrap gap-2">
                <div class="flex items-center gap-1">
                    <Button icon="pi pi-chevron-left" text rounded size="small" @click="navigateMonth(-1)" />
                    <DatePicker v-model="selectedMonthDate" view="month" dateFormat="MM yy" :showIcon="false" 
                        inputClass="font-semibold text-sm text-center capitalize cursor-pointer border-none bg-transparent w-[140px] p-1" />
                    <Button icon="pi pi-chevron-right" text rounded size="small" @click="navigateMonth(1)" />
                </div>
                <div class="flex items-center gap-2">
                    <SelectButton v-model="viewMode" :options="[
                        { value: 'calendar', icon: 'pi pi-calendar' },
                        { value: 'table', icon: 'pi pi-table' }
                    ]" optionValue="value" dataKey="value" size="small">
                        <template #option="{ option }">
                            <i :class="option.icon"></i>
                        </template>
                    </SelectButton>
                    <Button icon="pi pi-file-pdf" :label="isMobile ? '' : $t('planning.exportPdf')" outlined size="small" @click="exportPdf" v-tooltip.bottom="$t('planning.exportPdf')" />
                    <Button icon="pi pi-share-alt" :label="isMobile ? '' : $t('planning.share')" outlined size="small" @click="sharePlanning" v-tooltip.bottom="$t('planning.share')" />
                    <Button icon="pi pi-megaphone" :label="isMobile ? '' : (periodStatus?.indPublished ? $t('planning.published') : $t('planning.publish'))" 
                        :severity="periodStatus?.indPublished ? 'secondary' : 'success'" 
                        :outlined="periodStatus?.indPublished"
                        size="small" @click="publishPlanning" v-tooltip.bottom="$t('planning.publish')" />
                </div>
            </div>

            <!-- Banner modifications non publiées -->
            <Message v-if="periodStatus && !periodStatus.indPublished && periodStatus.publishedAt" severity="warn" :closable="false" class="mb-3">
                <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between w-full gap-2">
                    <div class="flex items-center gap-2">
                        <span class="text-sm">{{ $t('planning.unpublishedChanges') }}</span>
                        <i class="pi pi-info-circle text-surface-400 text-xs cursor-pointer" 
                           v-tooltip.top="$t('planning.unpublishedInfo')"></i>
                    </div>
                    <Button :label="$t('planning.publishNow')" size="small" severity="warn" @click="publishPlanning" class="w-full sm:w-auto" />
                </div>
            </Message>

            <!-- Loading -->
            <div v-if="loading" class="flex justify-center py-12">
              
                <ProgressSpinner />
            </div>

            <div v-else class="flex gap-4">
                <!-- Calendar view -->
                <template v-if="viewMode === 'calendar'">
                <div class="flex-1 min-w-0">
                    <!-- DESKTOP grid -->
                    <div class="hidden md:block">
                        <div class="grid grid-cols-7 gap-px bg-surface-200 dark:bg-surface-700 rounded-t-lg overflow-hidden">
                            <div v-for="day in weekDays" :key="day" class="bg-surface-50 dark:bg-surface-800 text-center py-2 text-xs font-semibold text-muted-color">{{ day }}</div>
                        </div>
                        <div class="grid grid-cols-7 gap-px bg-surface-200 dark:bg-surface-700 rounded-b-lg overflow-hidden">
                            <template v-for="(week, wi) in calendarWeeks" :key="wi">
                                <div
                                    v-for="(cell, ci) in week"
                                    :key="`${wi}-${ci}`"
                                    class="bg-surface-0 dark:bg-surface-900 min-h-[60px] p-1.5 transition-colors"
                                    :class="{
                                        'bg-surface-50/50 dark:bg-surface-800/50': !cell,
                                        'ring-2 ring-inset ring-primary/30': cell?.isToday && cell?.dateStr !== selectedDate,
                                        'ring-2 ring-inset ring-primary bg-primary/5': cell?.dateStr === selectedDate,
                                        'cursor-pointer hover:bg-primary/5': cell?.hasDate,
                                        'opacity-50': cell && !cell.hasDate
                                    }"
                                    @click="cell?.hasDate && onDateClicked(cell.dateStr)"
                                >
                                    <template v-if="cell">
                                        <span class="text-xs font-semibold mb-1 inline-block" :class="{ 'text-primary font-bold': cell.isToday, 'text-muted-color': !cell.hasDate && !cell.isToday }">{{ cell.day }}</span>
                                        <div v-if="cell.planned?.length > 0" class="flex flex-col gap-1.5 mt-1">
                                            <div v-for="(prg, pi) in cell.planned" :key="pi" class="border-l-2 border-primary pl-1">
                                                <div class="text-xs font-bold text-primary uppercase truncate bg-primary/5 rounded px-1">{{ prg.program }}</div>
                                                <div v-for="(svc, si) in prg.services" :key="si" class="mt-1">
                                                    <div class="text-xs font-semibold text-surface-700 truncate italic">↳ {{ svc.service }}</div>
                                                    <div v-for="(group, poste) in groupByPoste(svc.members)" :key="poste" class="pl-1 mt-0.5">
                                                        <span class="text-[0.65rem] rounded px-1 inline-block mb-0.5"
                                                            :class="[getPosteColor(poste).bg, getPosteColor(poste).text]">{{ poste }}</span>
                                                        <div v-for="(m, mi) in group" :key="mi" class="flex items-center gap-0.5 text-xs leading-snug pl-1">
                                                            <span class="truncate text-green-700">{{ m.memberName }}</span>
                                                            <span v-if="m.indTraining" class="text-[0.6rem] bg-orange-100 text-orange-700 rounded px-0.5 flex-shrink-0 font-bold" v-tooltip.top="$t('planning.training')">{{ $t('planning.trainingTag') }}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div v-else-if="cell.hasDate" class="bg-primary/10 rounded px-1.5 py-1">
                                            <div class="text-[0.6rem] font-semibold text-primary">{{ $t('planning.clickToAssign') }}</div>
                                        </div>
                                    </template>
                                </div>
                            </template>
                        </div>
                    </div>

                    <!-- MOBILE card list -->
                    <div class="md:hidden flex flex-col gap-2">
                        <div v-if="daysWithDates.length === 0" class="text-center py-8 text-muted-color text-sm">
                            {{ $t('planning.noAvailableMembers') }}
                        </div>
                        <div v-for="cell in daysWithDates" :key="cell.dateStr"
                            class="border border-surface-200 dark:border-surface-700 rounded-lg px-3 py-3 cursor-pointer hover:border-primary/50 transition-colors"
                            :class="{ 'ring-2 ring-primary/30': cell.isToday, 'ring-2 ring-primary bg-primary/5': cell.dateStr === selectedDate }"
                            @click="onDateClicked(cell.dateStr)"
                        >
                            <div class="flex items-center justify-between">
                                <span class="font-semibold text-sm" :class="{ 'text-primary': cell.isToday }">
                                    {{ weekDays[(new Date(cell.dateStr + 'T00:00:00').getDay() + 6) % 7] }} {{ cell.day }}
                                </span>
                                <i class="pi pi-chevron-right text-xs text-muted-color"></i>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Sidebar desktop -->
                <transition name="slide">
                    <div v-if="sidebarVisible && !isMobile"
                        class="w-96 flex-shrink-0 border border-surface-200 dark:border-surface-700 rounded-xl max-h-[calc(100vh-220px)] flex flex-col"
                    >
                        <!-- Header -->
                        <div class="flex items-center justify-between p-4 border-b border-surface-200 dark:border-surface-700">
                            <div>
                                <h3 class="font-semibold text-sm m-0 capitalize">{{ formatDate(selectedDate) }}</h3>
                                <span class="text-xs text-surface-400">{{ totalAvailableMembers }} {{ $t('planning.available').toLowerCase() }} · {{ totalAssigned }} {{ $t('planning.assigned').toLowerCase() }}</span>
                            </div>
                            <Button icon="pi pi-times" text rounded size="small" @click="closeSidebar" />
                        </div>

                        <!-- Tabs -->
                        <div class="px-4 pt-3">
                            <SelectButton v-model="sidebarTab" :options="[
                                { value: 'available', label: $t('planning.available') + ' (' + totalAvailableMembers + ')' },
                                { value: 'assigned', label: $t('planning.assigned') + ' (' + totalAssigned + ')' }
                            ]" optionValue="value" optionLabel="label" size="small" class="w-full" />
                        </div>

                        <!-- Content -->
                        <div class="flex-1 overflow-y-auto p-4">
                            <Message v-if="errorMessage" severity="error" :closable="true" @close="errorMessage = null" class="mb-3">{{ errorMessage }}</Message>

                            <!-- Tab Disponibles -->
                            <template v-if="sidebarTab === 'available'">
                            <Select v-if="serviceFilterOptions.length > 0"
                                v-model="selectedServiceFilter" 
                                :options="serviceFilterOptions" 
                                optionLabel="label" 
                                optionValue="value" 
                                :placeholder="$t('planning.allServices')" 
                                :showClear="true"
                                size="small" 
                                class="w-full mb-3" />
                            <div v-if="loadingMembers" class="flex justify-center py-8">
                                <ProgressSpinner style="width: 32px; height: 32px" />
                            </div>

                            <div v-else-if="filteredAvailableMembers.length === 0 && !errorMessage" class="flex flex-col items-center py-8 text-surface-400">
                                <i class="pi pi-users text-3xl mb-2"></i>
                                <span class="text-xs">{{ $t('planning.noAvailableMembers') }}</span>
                            </div>

                            <div v-else class="flex flex-col gap-4">
                                <div v-for="service in filteredAvailableMembers" :key="service.servicePrgId">
                                    <div class="flex items-center gap-2 mb-2">
                                        <i class="pi pi-bookmark-fill text-primary text-xs"></i>
                                        <span class="font-semibold text-xs uppercase tracking-wide text-surface-600">{{ service.serviceName }}</span>
                                    </div>
                                    <span class="text-xs text-surface-400 mb-2 block">
                                        {{ service.programName }} · {{ service.startTime }} - {{ service.endTime }}
                                    </span>
                                    <div class="flex flex-col gap-2">
                                        <div v-for="member in service.availableMembers" :key="member.availabilityId"
                                            class="rounded-lg border transition-all text-sm"
                                            :class="member.isPlanned
                                                ? 'border-green-300 bg-green-50 dark:bg-green-900/20 dark:border-green-700'
                                                : 'border-surface-200 dark:border-surface-700'"
                                        >
                                            <div class="flex items-center gap-2 px-3 py-2.5">
                                                <i v-if="member.isPlanned" class="pi pi-check-circle text-green-500 text-xs"></i>
                                                <i v-else class="pi pi-user text-surface-400 text-xs"></i>
                                                <i v-if="member.indTraining || member.isTraining" class="pi pi-graduation-cap text-orange-500 text-xs" v-tooltip.top="$t('planning.training')"></i>
                                                <span class="flex-1 font-medium" :class="member.isPlanned ? 'text-green-700 dark:text-green-400' : ''">{{ member.displayName }}</span>
                                                <i class="pi pi-info-circle text-surface-400 text-xs cursor-pointer hover:text-primary" 
                                                   v-tooltip.top="formatCreatedAt(member.createdAt)"></i>
                                            </div>
                                            <div class="flex flex-col gap-2 px-3 pb-2.5">
                                                <Select 
                                                    v-model="member.selectedPosteId" 
                                                    :options="postes" 
                                                    optionLabel="name" 
                                                    optionValue="id" 
                                                    :placeholder="$t('planning.selectPoste')" 
                                                    size="small"
                                                    :invalid="member.posteError"
                                                    @click.stop
                                                />
                                                <div v-if="!member.isPlanned" class="flex items-center justify-between">
                                                    <div class="flex items-center gap-2" @click.stop>
                                                        <ToggleSwitch v-model="member.indTraining" size="small" />
                                                        <span class="text-xs text-surface-500">{{ $t('planning.training') }}</span>
                                                    </div>
                                                    <Button 
                                                        icon="pi pi-plus" 
                                                        :label="$t('planning.assign')" 
                                                        size="small" 
                                                        severity="primary"
                                                        @click.stop="assignMember(member, service)"
                                                        :loading="member.assigning"
                                                    />
                                                </div>
                                                <div v-else class="flex flex-col gap-2">
                                                    <div class="flex items-center gap-2" @click.stop>
                                                        <ToggleSwitch v-model="member.indTraining" size="small" />
                                                        <span class="text-xs text-surface-500">{{ $t('planning.training') }}</span>
                                                    </div>
                                                    <div class="flex justify-end gap-2">
                                                        <Button 
                                                            icon="pi pi-pencil" 
                                                            :label="$t('btnUpdate')" 
                                                            size="small" 
                                                            severity="info" 
                                                            outlined
                                                            @click.stop="updateMember(member)"
                                                            :loading="member.updating"
                                                        />
                                                        <Button 
                                                            icon="pi pi-times" 
                                                            :label="$t('planning.unassign')" 
                                                            size="small" 
                                                            severity="danger" 
                                                            outlined
                                                            @click.stop="unassignMember(member)"
                                                            :loading="member.assigning"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            </template>

                            <!-- Tab Assignés -->
                            <template v-if="sidebarTab === 'assigned'">
                                <div v-if="assignedByService.length === 0" class="flex flex-col items-center py-8 text-surface-400">
                                    <i class="pi pi-users text-3xl mb-2"></i>
                                    <span class="text-xs">{{ $t('planning.noAssignments') }}</span>
                                </div>
                                <div v-else class="flex flex-col gap-4">
                                    <div v-for="(svc, si) in assignedByService" :key="si">
                                        <div class="flex items-center gap-2 mb-2">
                                            <i class="pi pi-bookmark-fill text-primary text-xs"></i>
                                            <span class="font-semibold text-xs uppercase tracking-wide text-surface-600">{{ svc.service }}</span>
                                            <Tag :value="svc.program" severity="info" class="text-[0.6rem]" />
                                        </div>
                                        <div class="flex flex-col gap-1.5">
                                            <div v-for="(group, poste) in groupByPoste(svc.members)" :key="poste">
                                                <span class="text-[0.65rem] rounded px-1 inline-block mb-0.5"
                                                    :class="[getPosteColor(poste).bg, getPosteColor(poste).text]">{{ poste }}</span>
                                                <div v-for="(m, mi) in group" :key="mi" class="flex items-center gap-1.5 text-sm pl-2 py-0.5">
                                                    <i class="pi pi-check-circle text-green-500 text-xs"></i>
                                                    <span class="text-green-700">{{ m.memberName }}</span>
                                                    <span v-if="m.indTraining" class="text-[0.6rem] bg-orange-100 text-orange-700 rounded px-0.5 font-bold">{{ $t('planning.trainingTag') }}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </template>
                        </div>
                    </div>
                </transition>

                <!-- Sidebar mobile (Drawer) -->
                <Drawer v-model:visible="sidebarVisible" v-if="isMobile" position="bottom" class="!h-[85vh]" :header="formatDate(selectedDate)">
                    <div class="flex flex-col gap-2 mb-3">
                        <span class="text-xs text-surface-400">{{ totalAvailableMembers }} {{ $t('planning.available').toLowerCase() }} · {{ totalAssigned }} {{ $t('planning.assigned').toLowerCase() }}</span>
                        <SelectButton v-model="sidebarTab" :options="[
                            { value: 'available', label: $t('planning.available') + ' (' + totalAvailableMembers + ')' },
                            { value: 'assigned', label: $t('planning.assigned') + ' (' + totalAssigned + ')' }
                        ]" optionValue="value" optionLabel="label" size="small" class="w-full" />
                    </div>

                    <Message v-if="errorMessage" severity="error" :closable="true" @close="errorMessage = null" class="mb-3">{{ errorMessage }}</Message>

                    <template v-if="sidebarTab === 'available'">
                    <Select v-if="serviceFilterOptions.length > 0"
                        v-model="selectedServiceFilter" 
                        :options="serviceFilterOptions" 
                        optionLabel="label" 
                        optionValue="value" 
                        :placeholder="$t('planning.allServices')" 
                        :showClear="true"
                        size="small" 
                        class="w-full mb-3" />
                    <div v-if="loadingMembers" class="flex justify-center py-8">
                        <ProgressSpinner style="width: 32px; height: 32px" />
                    </div>

                    <div v-else-if="filteredAvailableMembers.length === 0 && !errorMessage" class="flex flex-col items-center py-8 text-surface-400">
                        <i class="pi pi-users text-3xl mb-2"></i>
                        <span class="text-xs">{{ $t('planning.noAvailableMembers') }}</span>
                    </div>

                    <div v-else class="flex flex-col gap-4 overflow-y-auto">
                        <div v-for="service in filteredAvailableMembers" :key="service.servicePrgId">
                            <div class="flex items-center gap-2 mb-2">
                                <i class="pi pi-bookmark-fill text-primary text-xs"></i>
                                <span class="font-semibold text-xs uppercase tracking-wide text-surface-600">{{ service.serviceName }}</span>
                            </div>
                            <span class="text-xs text-surface-400 mb-2 block">
                                {{ service.programName }} · {{ service.startTime }} - {{ service.endTime }}
                            </span>
                            <div class="flex flex-col gap-2">
                                <div v-for="member in service.availableMembers" :key="member.availabilityId"
                                    class="rounded-lg border transition-all text-sm"
                                    :class="member.isPlanned
                                        ? 'border-green-300 bg-green-50 dark:bg-green-900/20 dark:border-green-700'
                                        : 'border-surface-200 dark:border-surface-700'"
                                >
                                    <div class="flex items-center gap-2 px-3 py-2.5">
                                        <i v-if="member.isPlanned" class="pi pi-check-circle text-green-500 text-xs"></i>
                                        <i v-else class="pi pi-user text-surface-400 text-xs"></i>
                                        <i v-if="member.indTraining || member.isTraining" class="pi pi-graduation-cap text-orange-500 text-xs" v-tooltip.top="$t('planning.training')"></i>
                                        <span class="flex-1 font-medium" :class="member.isPlanned ? 'text-green-700 dark:text-green-400' : ''">{{ member.displayName }}</span>
                                        <i class="pi pi-info-circle text-surface-400 text-xs cursor-pointer hover:text-primary" 
                                           v-tooltip.top="formatCreatedAt(member.createdAt)"></i>
                                    </div>
                                    <div class="flex flex-col gap-2 px-3 pb-2.5">
                                        <Select 
                                            v-model="member.selectedPosteId" 
                                            :options="postes" 
                                            optionLabel="name" 
                                            optionValue="id" 
                                            :placeholder="$t('planning.selectPoste')" 
                                            size="small"
                                            :invalid="member.posteError"
                                        />
                                        <div v-if="!member.isPlanned" class="flex items-center justify-between">
                                            <div class="flex items-center gap-2">
                                                <ToggleSwitch v-model="member.indTraining" size="small" />
                                                <span class="text-xs text-surface-500">{{ $t('planning.training') }}</span>
                                            </div>
                                            <Button 
                                                icon="pi pi-plus" 
                                                :label="$t('planning.assign')" 
                                                size="small" 
                                                severity="primary"
                                                @click="assignMember(member, service)"
                                                :loading="member.assigning"
                                            />
                                        </div>
                                        <div v-else class="flex flex-col gap-2">
                                            <div class="flex items-center gap-2">
                                                <ToggleSwitch v-model="member.indTraining" size="small" />
                                                <span class="text-xs text-surface-500">{{ $t('planning.training') }}</span>
                                            </div>
                                            <div class="flex justify-end gap-2">
                                                <Button 
                                                    icon="pi pi-pencil" 
                                                    :label="$t('btnUpdate')" 
                                                    size="small" 
                                                    severity="info" 
                                                    outlined
                                                    @click="updateMember(member)"
                                                    :loading="member.updating"
                                                />
                                                <Button 
                                                    icon="pi pi-times" 
                                                    :label="$t('planning.unassign')" 
                                                    size="small" 
                                                    severity="danger" 
                                                    outlined
                                                    @click="unassignMember(member)"
                                                    :loading="member.assigning"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    </template>

                    <!-- Tab Assignés mobile -->
                    <template v-if="sidebarTab === 'assigned'">
                        <div v-if="assignedByService.length === 0" class="flex flex-col items-center py-8 text-surface-400">
                            <i class="pi pi-users text-3xl mb-2"></i>
                            <span class="text-xs">{{ $t('planning.noAssignments') }}</span>
                        </div>
                        <div v-else class="flex flex-col gap-4">
                            <div v-for="(svc, si) in assignedByService" :key="si">
                                <div class="flex items-center gap-2 mb-2">
                                    <i class="pi pi-bookmark-fill text-primary text-xs"></i>
                                    <span class="font-semibold text-xs uppercase tracking-wide text-surface-600">{{ svc.service }}</span>
                                    <Tag :value="svc.program" severity="info" class="text-[0.6rem]" />
                                </div>
                                <div class="flex flex-col gap-1.5">
                                    <div v-for="(group, poste) in groupByPoste(svc.members)" :key="poste">
                                        <span class="text-[0.65rem] rounded px-1 inline-block mb-0.5"
                                            :class="[getPosteColor(poste).bg, getPosteColor(poste).text]">{{ poste }}</span>
                                        <div v-for="(m, mi) in group" :key="mi" class="flex items-center gap-1.5 text-sm pl-2 py-0.5">
                                            <i class="pi pi-check-circle text-green-500 text-xs"></i>
                                            <span class="text-green-700">{{ m.memberName }}</span>
                                            <span v-if="m.indTraining" class="text-[0.6rem] bg-orange-100 text-orange-700 rounded px-0.5 font-bold">{{ $t('planning.trainingTag') }}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </template>
                </Drawer>
                </template>

                <!-- Table view -->
                <template v-if="viewMode === 'table'">
                    <div class="flex-1 min-w-0 overflow-x-auto">
                        <p class="text-xs text-surface-400 mb-3 italic">{{ $t('planning.tableDesc') }}</p>
                        <div v-if="tableRows.length === 0" class="flex flex-col items-center py-12 text-surface-400">
                            <i class="pi pi-table text-3xl mb-2"></i>
                            <span class="text-sm">{{ $t('planning.noAvailableMembers') }}</span>
                        </div>
                        <table v-else class="w-full text-xs border-collapse">
                            <thead>
                                <tr>
                                    <th class="sticky left-0 z-10 bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 px-3 py-2 text-left font-semibold min-w-[140px]">
                                        {{ $t('planning.member') }}
                                    </th>
                                    <th v-for="date in tableDates" :key="date"
                                        class="border border-surface-200 dark:border-surface-700 px-2 py-2 text-center font-semibold min-w-[90px] bg-surface-50 dark:bg-surface-800"
                                        :class="{ 'bg-primary/10': date === new Date().toISOString().split('T')[0] }">
                                        {{ formatShortDate(date) }}
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="row in tableRows" :key="row.memberName">
                                    <td class="sticky left-0 z-10 bg-surface-0 dark:bg-surface-900 border border-surface-200 dark:border-surface-700 px-3 py-2 font-medium">
                                        <div class="flex items-center gap-1.5">
                                            <span>{{ row.memberName }}</span>
                                            <span v-if="row.posteName" class="text-[0.6rem] rounded px-1"
                                                :class="[getPosteColor(row.posteName).bg, getPosteColor(row.posteName).text]">{{ row.posteName }}</span>
                                        </div>
                                    </td>
                                    <td v-for="date in tableDates" :key="date"
                                        class="border border-surface-200 dark:border-surface-700 px-1.5 py-1.5 text-center align-top"
                                        :class="{ 'bg-primary/5': date === new Date().toISOString().split('T')[0] }">
                                        <div v-if="row.assignments[date]" class="flex flex-col gap-0.5">
                                            <div v-for="(a, ai) in row.assignments[date]" :key="ai"
                                                class="bg-green-50 dark:bg-green-900/20 rounded px-1 py-0.5 text-green-700 dark:text-green-400 text-[0.65rem] leading-tight">
                                                <span class="font-bold uppercase">{{ a.program }}</span>
                                                <span class="block italic text-surface-500 truncate">{{ a.service }}</span>
                                                <span v-if="a.indTraining" class="text-[0.55rem] bg-orange-100 text-orange-700 rounded px-0.5 font-bold">{{ $t('planning.trainingTag') }}</span>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </template>
            </div>
        </div>
    </div>
</template>

<style scoped>
.slide-enter-active, .slide-leave-active {
    transition: all 0.3s ease;
}
.slide-enter-from, .slide-leave-to {
    opacity: 0;
    transform: translateX(20px);
}
</style>
