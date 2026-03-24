<script setup>
import MemberService from '@/service/MemberService';
import { buildCalendarWeeks, createSeededRandom, getSundays, useMonthNavigation, WEEK_DAYS } from '@/utils/composables/useCalendar';
import { useHandleAsyncError } from '@/utils/handleAsyncError';
import { computed, onMounted, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const { handleAsyncError } = useHandleAsyncError();

const { month: currentMonth, year: currentYear, monthLabel, navigateMonth } = useMonthNavigation();
const loading = ref(false);
const planningData = ref(null);

const weekDays = WEEK_DAYS;

// Build calendar grid
const calendarWeeks = computed(() => {
    if (!planningData.value) return [];
    return buildCalendarWeeks(currentMonth.value, currentYear.value, (dateStr) => {
        const dayAssignments = (planningData.value?.assignments || []).filter((a) => a.date === dateStr);

        const services = [];
        for (const a of dayAssignments) {
            if (!services.some((s) => s.serviceId === a.serviceId)) {
                services.push({ serviceId: a.serviceId, serviceName: a.serviceName, startTime: a.startTime, endTime: a.endTime, departmentName: a.departmentName || '' });
            }
        }
        return { services };
    });
});

// Flat list for mobile
const daysWithAssignments = computed(() => {
    const days = [];
    for (const week of calendarWeeks.value) {
        for (const cell of week) {
            if (cell && cell.services.length > 0) days.push(cell);
        }
    }
    return days;
});

const totalAssignments = computed(() => planningData.value?.assignments?.length || 0);

// Mock data
function generateMockMyPlanning(month, year) {
    const sundays = getSundays(month, year);
    const assignments = [];
    let id = 1;
    const rand = createSeededRandom(month * 100 + year);

    for (const sunday of sundays) {
        if (rand() > 0.2) {
            assignments.push({ id: id++, date: sunday, serviceId: 1, serviceName: 'Culte de célébration', startTime: '09:00', endTime: '12:00', departmentName: 'Louange' });
        }
        if (rand() > 0.6) {
            assignments.push({ id: id++, date: sunday, serviceId: 3, serviceName: 'Culte du soir', startTime: '17:00', endTime: '19:00', departmentName: 'Technique' });
        }
    }
    return { assignments };
}

async function fetchMyPlanning() {
    const { result, error } = await handleAsyncError(
        () => MemberService.getMyPlanning(currentMonth.value, currentYear.value),
        (val) => (loading.value = val)
    );
    if (!error && result) {
        planningData.value = result;
    } else {
        planningData.value = generateMockMyPlanning(currentMonth.value, currentYear.value);
    }
}

onMounted(() => fetchMyPlanning());
watch([currentMonth, currentYear], () => fetchMyPlanning());
</script>

<template>
    <div class="card">
        <!-- Header -->
        <div class="flex items-center justify-between mb-4 flex-wrap gap-2">
            <div>
                <h2 class="text-xl font-bold m-0">{{ t('myPlanning.title') }}</h2>
                <p class="text-sm text-muted-color mt-1 m-0">{{ t('myPlanning.subtitle') }}</p>
            </div>
            <div class="flex items-center gap-2">
                <Button icon="pi pi-chevron-left" text rounded size="small" @click="navigateMonth(-1)" />
                <span class="font-semibold text-sm min-w-[140px] text-center capitalize">{{ monthLabel }}</span>
                <Button icon="pi pi-chevron-right" text rounded size="small" @click="navigateMonth(1)" />
            </div>
        </div>

        <!-- Loading -->
        <div v-if="loading" class="flex justify-center py-12">
            <ProgressSpinner />
        </div>

        <template v-else-if="planningData">
            <!-- Stats -->
            <div class="flex items-center gap-3 mb-4 text-sm">
                <Tag severity="primary" :value="`${totalAssignments} ${t('myPlanning.assignments')}`" rounded />
            </div>

            <!-- DESKTOP: Calendar grid -->
            <div class="hidden md:block">
                <div class="grid grid-cols-7 gap-px bg-surface-200 dark:bg-surface-700 rounded-t-lg overflow-hidden">
                    <div v-for="day in weekDays" :key="day" class="bg-surface-50 dark:bg-surface-800 text-center py-2 text-xs font-semibold text-muted-color">{{ day }}</div>
                </div>
                <div class="grid grid-cols-7 gap-px bg-surface-200 dark:bg-surface-700 rounded-b-lg overflow-hidden">
                    <template v-for="(week, wi) in calendarWeeks" :key="wi">
                        <div
                            v-for="(cell, ci) in week"
                            :key="`${wi}-${ci}`"
                            class="bg-surface-0 dark:bg-surface-900 min-h-[90px] p-1.5"
                            :class="{ 'bg-surface-50/50 dark:bg-surface-800/50': !cell, 'ring-2 ring-inset ring-primary/30': cell?.isToday }"
                        >
                            <template v-if="cell">
                                <span class="text-xs font-semibold mb-1 inline-block" :class="{ 'text-primary font-bold': cell.isToday, 'text-muted-color': cell.services.length === 0 && !cell.isToday }">{{ cell.day }}</span>
                                <div v-for="svc in cell.services" :key="svc.serviceId" class="mb-1 last:mb-0 bg-primary/10 rounded px-1.5 py-1">
                                    <div class="text-[0.6rem] font-semibold text-primary truncate">{{ svc.serviceName }}</div>
                                    <div class="text-[0.55rem] text-muted-color">{{ svc.startTime }} - {{ svc.endTime }}</div>
                                    <div v-if="svc.departmentName" class="text-[0.5rem] text-muted-color italic">{{ svc.departmentName }}</div>
                                </div>
                            </template>
                        </div>
                    </template>
                </div>
            </div>

            <!-- MOBILE: Card list -->
            <div class="md:hidden flex flex-col gap-2">
                <div v-if="daysWithAssignments.length === 0" class="text-center py-8 text-muted-color text-sm">
                    {{ t('myPlanning.noAssignments') }}
                </div>
                <div v-for="cell in daysWithAssignments" :key="cell.dateStr" class="border border-surface-200 dark:border-surface-700 rounded-lg overflow-hidden" :class="{ 'ring-2 ring-primary/30': cell.isToday }">
                    <div class="bg-surface-50 dark:bg-surface-800 px-3 py-2 border-b border-surface-200 dark:border-surface-700">
                        <span class="font-semibold text-sm" :class="{ 'text-primary': cell.isToday }">{{ weekDays[(new Date(cell.dateStr + 'T00:00:00').getDay() + 6) % 7] }} {{ cell.day }}</span>
                    </div>
                    <div class="p-3 flex flex-col gap-2">
                        <div v-for="svc in cell.services" :key="svc.serviceId" class="bg-primary/10 rounded-lg px-3 py-2">
                            <div class="text-sm font-semibold text-primary">{{ svc.serviceName }}</div>
                            <div class="text-xs text-muted-color flex items-center gap-1 mt-0.5">
                                <i class="pi pi-clock" style="font-size: 0.6rem"></i>
                                {{ svc.startTime }} - {{ svc.endTime }}
                            </div>
                            <div v-if="svc.departmentName" class="text-xs text-muted-color italic mt-0.5">{{ svc.departmentName }}</div>
                        </div>
                    </div>
                </div>
            </div>
        </template>
    </div>
</template>
