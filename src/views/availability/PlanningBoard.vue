<script setup>
import AvailabilityService from '@/service/AvailabilityService';
import DepartmentService from '@/service/DepartmentService';
import ServicePrgService from '@/service/ServicePrgService';
import { buildCalendarWeeks, useMonthNavigation, WEEK_DAYS } from '@/utils/composables/useCalendar';
import { useHandleAsyncError } from '@/utils/handleAsyncError';
import { computed, onMounted, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

const { locale, t } = useI18n();
const { handleAsyncError } = useHandleAsyncError();

const props = defineProps({
    departmentSelected: [String, Number]
});

const { month: currentMonth, year: currentYear, monthLabel, navigateMonth } = useMonthNavigation();
const loading = ref(false);
const dates = ref([]);
const weekDays = WEEK_DAYS;

// Sidebar
const selectedDate = ref(null);
const sidebarVisible = ref(false);
const availableMembers = ref([]);
const loadingMembers = ref(false);

// Postes
const postes = ref([]);

// Responsive
const isMobile = ref(window.innerWidth < 640);
window.addEventListener('resize', () => { isMobile.value = window.innerWidth < 640; });

// Calendar grid
const calendarWeeks = computed(() => {
    return buildCalendarWeeks(currentMonth.value, currentYear.value, (dateStr) => {
        const hasDate = dates.value.some(d => d.date === dateStr);
        return { hasDate };
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

const totalAvailableMembers = computed(() => {
    return availableMembers.value.reduce((sum, s) => sum + (s.availableMembers?.length || 0), 0);
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
    const { result } = await handleAsyncError(
        () => AvailabilityService.getAvailableMembersByDate(props.departmentSelected, date),
        (val) => (loadingMembers.value = val)
    );
    availableMembers.value = result || [];
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
}

function exportPdf() { window.print(); }
function sharePlanning() { navigator.clipboard.writeText(window.location.href); }
function publishPlanning() { /* TODO */ }

async function assignMember(member, service) {
    if (!props.departmentSelected || !selectedDate.value) return;
    member.assigning = true;
    const { result } = await handleAsyncError(
        () => DepartmentService.assignMember(props.departmentSelected, {
            availabilityId: member.availabilityId,
            posteId: member.selectedPosteId || null
        })
    );
    member.assigning = false;
    if (result !== undefined) {
        member.isPlanned = true;
    }
}

async function unassignMember(member) {
    if (!props.departmentSelected) return;
    member.assigning = true;
    const { result } = await handleAsyncError(
        () => DepartmentService.unassignMember(props.departmentSelected, member.availabilityId)
    );
    member.assigning = false;
    if (result !== undefined) {
        member.isPlanned = false;
        member.selectedPosteId = null;
    }
}

async function fetchPostes() {
    if (!props.departmentSelected) return;
    const { result } = await handleAsyncError(() => DepartmentService.getPostes(props.departmentSelected));
    postes.value = result || [];
}

onMounted(() => {
    if (props.departmentSelected) fetchPostes();
});

watch(() => props.departmentSelected, () => { dates.value = []; closeSidebar(); fetchDates(); fetchPostes(); });
watch([currentMonth, currentYear], () => { fetchDates(); });
</script>

<template>
    <div>
        <EmptyStateComponent v-if="!departmentSelected" icon="pi pi-sitemap" :title="$t('planning.selectDeptTitle')" :description="$t('planning.selectDeptDesc')" />

        <div v-else>
            <!-- Header -->
            <div class="flex items-center justify-between mb-4 flex-wrap gap-2">
                <div class="flex items-center gap-2">
                    <Button icon="pi pi-chevron-left" text rounded size="small" @click="navigateMonth(-1)" />
                    <span class="font-semibold text-sm min-w-[140px] text-center capitalize">{{ monthLabel }}</span>
                    <Button icon="pi pi-chevron-right" text rounded size="small" @click="navigateMonth(1)" />
                </div>
                <div class="flex items-center gap-2">
                    <Button icon="pi pi-file-pdf" :label="isMobile ? '' : $t('planning.exportPdf')" outlined size="small" @click="exportPdf" v-tooltip.bottom="$t('planning.exportPdf')" />
                    <Button icon="pi pi-share-alt" :label="isMobile ? '' : $t('planning.share')" outlined size="small" @click="sharePlanning" v-tooltip.bottom="$t('planning.share')" />
                    <Button icon="pi pi-megaphone" :label="isMobile ? '' : $t('planning.publish')" severity="success" size="small" @click="publishPlanning" v-tooltip.bottom="$t('planning.publish')" />
                </div>
            </div>

            <!-- Loading -->
            <div v-if="loading" class="flex justify-center py-12">
              
                <ProgressSpinner />
            </div>

            <div v-else class="flex gap-4">
                <!-- Calendar -->
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
                                    class="bg-surface-0 dark:bg-surface-900 min-h-[90px] p-1.5 transition-colors"
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
                                        <div v-if="cell.hasDate" class="bg-primary/10 rounded px-1.5 py-1">
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
                                <span class="text-xs text-surface-400">{{ $t('planning.assignMembers') }} · {{ totalAvailableMembers }} {{ $t('planning.available').toLowerCase() }}</span>
                            </div>
                            <Button icon="pi pi-times" text rounded size="small" @click="closeSidebar" />
                        </div>

                        <!-- Content -->
                        <div class="flex-1 overflow-y-auto p-4">
                            <div v-if="loadingMembers" class="flex justify-center py-8">
                                <ProgressSpinner style="width: 32px; height: 32px" />
                            </div>

                            <div v-else-if="availableMembers.length === 0" class="flex flex-col items-center py-8 text-surface-400">
                                <i class="pi pi-users text-3xl mb-2"></i>
                                <span class="text-xs">{{ $t('planning.noAvailableMembers') }}</span>
                            </div>

                            <div v-else class="flex flex-col gap-4">
                                <div v-for="service in availableMembers" :key="service.servicePrgId">
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
                                                <i v-if="member.isTraining" class="pi pi-graduation-cap text-orange-500 text-xs" v-tooltip.top="'Formation'"></i>
                                                <span class="flex-1 font-medium" :class="member.isPlanned ? 'text-green-700 dark:text-green-400' : ''">{{ member.displayName }}</span>
                                                <i class="pi pi-info-circle text-surface-400 text-xs cursor-pointer hover:text-primary" 
                                                   v-tooltip.top="formatCreatedAt(member.createdAt)"></i>
                                            </div>
                                            <div class="flex items-center gap-2 px-3 pb-2.5">
                                                <Select 
                                                    v-model="member.selectedPosteId" 
                                                    :options="postes" 
                                                    optionLabel="name" 
                                                    optionValue="id" 
                                                    :placeholder="$t('planning.selectPoste')" 
                                                    size="small"
                                                    class="flex-1"
                                                    @click.stop
                                                />
                                                <Button 
                                                    v-if="!member.isPlanned"
                                                    icon="pi pi-plus" 
                                                    :label="$t('planning.assign')" 
                                                    size="small" 
                                                    severity="primary"
                                                    @click.stop="assignMember(member, service)"
                                                    :loading="member.assigning"
                                                />
                                                <Button 
                                                    v-else
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
                </transition>

                <!-- Sidebar mobile (Drawer) -->
                <Drawer v-model:visible="sidebarVisible" v-if="isMobile" position="bottom" class="!h-[85vh]" :header="formatDate(selectedDate)">
                    <div class="flex flex-col gap-1 mb-2">
                        <span class="text-xs text-surface-400">{{ $t('planning.assignMembers') }} · {{ totalAvailableMembers }} {{ $t('planning.available').toLowerCase() }}</span>
                    </div>

                    <div v-if="loadingMembers" class="flex justify-center py-8">
                        <ProgressSpinner style="width: 32px; height: 32px" />
                    </div>

                    <div v-else-if="availableMembers.length === 0" class="flex flex-col items-center py-8 text-surface-400">
                        <i class="pi pi-users text-3xl mb-2"></i>
                        <span class="text-xs">{{ $t('planning.noAvailableMembers') }}</span>
                    </div>

                    <div v-else class="flex flex-col gap-4 overflow-y-auto">
                        <div v-for="service in availableMembers" :key="service.servicePrgId">
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
                                        <i v-if="member.isTraining" class="pi pi-graduation-cap text-orange-500 text-xs"></i>
                                        <span class="flex-1 font-medium" :class="member.isPlanned ? 'text-green-700 dark:text-green-400' : ''">{{ member.displayName }}</span>
                                        <i class="pi pi-info-circle text-surface-400 text-xs cursor-pointer hover:text-primary" 
                                           v-tooltip.top="formatCreatedAt(member.createdAt)"></i>
                                    </div>
                                    <div class="flex items-center gap-2 px-3 pb-2.5">
                                        <Select 
                                            v-model="member.selectedPosteId" 
                                            :options="postes" 
                                            optionLabel="name" 
                                            optionValue="id" 
                                            :placeholder="$t('planning.selectPoste')" 
                                            size="small"
                                            class="flex-1"
                                        />
                                        <Button 
                                            v-if="!member.isPlanned"
                                            icon="pi pi-plus" 
                                            :label="$t('planning.assign')" 
                                            size="small" 
                                            severity="primary"
                                            @click="assignMember(member, service)"
                                            :loading="member.assigning"
                                        />
                                        <Button 
                                            v-else
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
                </Drawer>
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
