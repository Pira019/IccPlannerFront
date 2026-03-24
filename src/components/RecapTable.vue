<script setup>
import MemberChip from '@/components/MemberChip.vue';
import { buildCalendarWeeks, WEEK_DAYS } from '@/utils/composables/useCalendar';
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

const props = defineProps({
    members: { type: Array, required: true },
    assignments: { type: Array, required: true },
    availabilities: { type: Array, required: true },
    serviceDates: { type: Array, required: true },
    loading: { type: Boolean, default: false },
    searchQuery: { type: String, default: '' },
    selectedDate: { type: String, default: '' },
    month: { type: Number, required: true },
    year: { type: Number, required: true }
});

const emit = defineEmits(['cell-click']);

const weekDays = WEEK_DAYS;

// Construire la grille calendrier (semaines × 7 jours)
const calendarWeeks = computed(() => {
    return buildCalendarWeeks(props.month, props.year, (dateStr) => {
        const sd = props.serviceDates.find((s) => s.date === dateStr);
        const dayAssignments = props.assignments.filter((a) => a.date === dateStr);

        const serviceGroups = [];
        if (dayAssignments.length > 0) {
            const svcMap = new Map();
            for (const a of dayAssignments) {
                if (!svcMap.has(a.serviceId)) {
                    svcMap.set(a.serviceId, { serviceId: a.serviceId, serviceName: a.serviceName, startTime: a.startTime, endTime: a.endTime, members: [] });
                }
                const member = props.members.find((m) => m.id === a.memberId);
                if (member) svcMap.get(a.serviceId).members.push(member);
            }
            serviceGroups.push(...svcMap.values());
        } else if (sd?.services?.length) {
            for (const svc of sd.services) {
                if (svc.id) serviceGroups.push({ serviceId: svc.id, serviceName: svc.title, startTime: svc.startTime, endTime: svc.endTime, members: [] });
            }
        }

        return { hasServices: serviceGroups.length > 0, serviceGroups };
    });
});

// Stats
const totalAssignments = computed(() => props.assignments.length);

// Empty state
const isEmpty = computed(() => props.serviceDates.length === 0 && props.members.length === 0);

// Flat list of days with services (for mobile view)
const daysWithServices = computed(() => {
    const days = [];
    for (const week of calendarWeeks.value) {
        for (const cell of week) {
            if (cell && cell.hasServices) days.push(cell);
        }
    }
    return days;
});

function onCellClick(dateStr) {
    emit('cell-click', dateStr);
}
</script>

<template>
    <div>
        <!-- Loading -->
        <div v-if="loading" class="flex justify-center items-center py-12">
            <ProgressSpinner aria-label="Loading" />
        </div>

        <!-- Empty state -->
        <div v-else-if="isEmpty" class="flex flex-col items-center justify-center py-12 text-center">
            <div class="flex items-center justify-center w-20 h-20 rounded-full bg-surface-100 dark:bg-surface-700 mb-5">
                <i class="pi pi-table !text-4xl text-muted-color"></i>
            </div>
            <p class="text-muted-color text-sm">{{ t('planning.noAssignments') }}</p>
        </div>

        <div v-else>
            <!-- Stats -->
            <div class="flex items-center gap-4 mb-3 text-xs text-muted-color">
                <span class="flex items-center gap-1">
                    <i class="pi pi-users"></i>
                    {{ totalAssignments }} {{ t('planning.totalAssignments') }}
                </span>
            </div>

            <!-- ===== DESKTOP: Calendar grid (≥768px) ===== -->
            <div class="hidden md:block">
                <!-- Week day headers -->
                <div class="grid grid-cols-7 gap-px bg-surface-200 dark:bg-surface-700 rounded-t-lg overflow-hidden">
                    <div v-for="day in weekDays" :key="day" class="bg-surface-50 dark:bg-surface-800 text-center py-2 text-xs font-semibold text-muted-color">
                        {{ day }}
                    </div>
                </div>

                <!-- Calendar weeks -->
                <div class="grid grid-cols-7 gap-px bg-surface-200 dark:bg-surface-700 rounded-b-lg overflow-hidden">
                    <template v-for="(week, wi) in calendarWeeks" :key="wi">
                        <div
                            v-for="(cell, ci) in week"
                            :key="`${wi}-${ci}`"
                            class="bg-surface-0 dark:bg-surface-900 min-h-[100px] p-1.5 relative transition-colors"
                            :class="{
                                'bg-surface-50/50 dark:bg-surface-800/50': !cell,
                                'cursor-pointer hover:bg-primary/5': cell?.hasServices,
                                'ring-2 ring-inset ring-primary/30': cell?.isToday && cell?.dateStr !== selectedDate,
                                'ring-2 ring-inset ring-primary bg-primary/10': cell?.dateStr === selectedDate
                            }"
                            @click="cell?.hasServices && onCellClick(cell.dateStr)"
                        >
                            <template v-if="cell">
                                <span class="text-xs font-semibold mb-1 inline-block" :class="{ 'text-primary font-bold': cell.isToday, 'text-muted-color': !cell.hasServices && !cell.isToday }">
                                    {{ cell.day }}
                                </span>
                                <div v-for="group in cell.serviceGroups" :key="group.serviceId" class="mb-1.5 last:mb-0">
                                    <div class="text-[0.6rem] text-muted-color truncate mb-0.5 flex items-center gap-0.5">
                                        <i class="pi pi-clock" style="font-size: 0.5rem"></i>
                                        {{ group.serviceName }}
                                    </div>
                                    <div v-if="group.members.length" class="flex flex-wrap gap-0.5">
                                        <MemberChip v-for="member in group.members" :key="member.id" :first-name="member.firstName" :last-name="member.lastName" :tag="member.fonction" size="small" />
                                    </div>
                                    <span v-else class="text-[0.6rem] text-surface-400 italic">—</span>
                                </div>
                            </template>
                        </div>
                    </template>
                </div>
            </div>

            <!-- ===== MOBILE: Card list (<768px) ===== -->
            <div class="md:hidden flex flex-col gap-2">
                <div
                    v-for="cell in daysWithServices"
                    :key="cell.dateStr"
                    class="border border-surface-200 dark:border-surface-700 rounded-lg overflow-hidden cursor-pointer hover:border-primary/50 transition-colors"
                    :class="{ 'ring-2 ring-primary/30': cell.isToday && cell.dateStr !== selectedDate, 'ring-2 ring-primary bg-primary/5': cell.dateStr === selectedDate }"
                    @click="onCellClick(cell.dateStr)"
                >
                    <!-- Date header -->
                    <div class="bg-surface-50 dark:bg-surface-800 px-3 py-2 border-b border-surface-200 dark:border-surface-700 flex items-center justify-between">
                        <span class="font-semibold text-sm" :class="{ 'text-primary': cell.isToday }">
                            {{ weekDays[(new Date(cell.dateStr + 'T00:00:00').getDay() + 6) % 7] }} {{ cell.day }}
                        </span>
                        <i class="pi pi-chevron-right text-xs text-muted-color"></i>
                    </div>
                    <!-- Services -->
                    <div class="p-3">
                        <div v-for="group in cell.serviceGroups" :key="group.serviceId" class="mb-2 last:mb-0">
                            <div class="flex items-center gap-1 mb-1.5 text-xs text-muted-color">
                                <i class="pi pi-clock" style="font-size: 0.6rem"></i>
                                <span class="truncate">{{ group.serviceName }}</span>
                                <span v-if="group.startTime">· {{ group.startTime }}</span>
                            </div>
                            <div v-if="group.members.length" class="flex flex-wrap gap-1">
                                <MemberChip v-for="member in group.members" :key="member.id" :first-name="member.firstName" :last-name="member.lastName" :tag="member.fonction" size="small" />
                            </div>
                            <span v-else class="text-xs text-surface-400 italic">—</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
