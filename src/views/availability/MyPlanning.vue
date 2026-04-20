<script setup>
import PageComponent from '@/components/PageComponent.vue';
import DepartmentService from '@/service/DepartmentService';
import PlanningService from '@/service/PlanningService';
import { useMonthNavigation, WEEK_DAYS } from '@/utils/composables/useCalendar';
import { useHandleAsyncError } from '@/utils/handleAsyncError';
import { computed, onMounted, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

const { locale, t } = useI18n();
const { handleAsyncError } = useHandleAsyncError();
const { month: currentMonth, year: currentYear, navigateMonth } = useMonthNavigation();

const props = defineProps({
    departmentSelected: { type: [String, Number], default: null },
    showHeader: { type: Boolean, default: true }
});

const loading = ref(false);
const assignments = ref([]);
const teamData = ref([]);
const departments = ref([]);
const selectedDept = ref(null);
const loadingDepts = ref(false);
const activeTab = ref('mine');

const weekDays = WEEK_DAYS;
const viewMode = ref('month'); // 'month' ou 'week'
const currentWeekStart = ref(getWeekStart(new Date()));

// DatePicker mois/année
const selectedMonthDate = computed({
    get() { return new Date(currentYear.value, currentMonth.value - 1, 1); },
    set(val) {
        if (val) {
            currentMonth.value = val.getMonth() + 1;
            currentYear.value = val.getFullYear();
        }
    }
});

// Département effectif (prop ou sélection locale)
const effectiveDept = computed(() => props.departmentSelected || selectedDept.value);

function getWeekStart(date) {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff));
}

function getWeekEnd(start) {
    const d = new Date(start);
    d.setDate(d.getDate() + 6);
    return d;
}

function formatDateISO(date) {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

const weekLabel = computed(() => {
    const start = currentWeekStart.value;
    const end = getWeekEnd(start);
    const opts = { day: 'numeric', month: 'short' };
    return `${start.toLocaleDateString(locale.value, opts)} - ${end.toLocaleDateString(locale.value, opts)} ${end.getFullYear()}`;
});

function navigateWeek(dir) {
    const d = new Date(currentWeekStart.value);
    d.setDate(d.getDate() + dir * 7);
    currentWeekStart.value = d;
}

function goToday() {
    const now = new Date();
    currentMonth.value = now.getMonth() + 1;
    currentYear.value = now.getFullYear();
    currentWeekStart.value = getWeekStart(now);
}

// Filtrer par semaine si mode semaine
const filteredByView = computed(() => {
    if (viewMode.value === 'week') {
        const startStr = formatDateISO(currentWeekStart.value);
        const endStr = formatDateISO(getWeekEnd(currentWeekStart.value));
        return assignments.value.filter(a => a.date >= startStr && a.date <= endStr);
    }
    return assignments.value;
});

// Grouper par date
const groupedByDate = computed(() => {
    const map = {};
    for (const a of filteredByView.value) {
        if (!map[a.date]) { map[a.date] = []; }
        map[a.date].push(a);
    }
    return Object.entries(map)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([date, items]) => ({ date, items }));
});

const totalAssignments = computed(() => filteredByView.value.length);

// Team: grouper par date → service → membres
const teamGroupedByDate = computed(() => {
    const filtered = viewMode.value === 'week'
        ? teamData.value.filter(a => {
            const startStr = formatDateISO(currentWeekStart.value);
            const endStr = formatDateISO(getWeekEnd(currentWeekStart.value));
            return a.date >= startStr && a.date <= endStr;
        })
        : teamData.value;

    const map = {};
    for (const a of filtered) {
        if (!map[a.date]) { map[a.date] = {}; }
        const svcKey = `${a.programShortName || a.programName?.substring(0, 3)} - ${a.serviceName}`;
        if (!map[a.date][svcKey]) { map[a.date][svcKey] = { program: a.programShortName || a.programName?.substring(0, 3), service: a.serviceName, members: [] }; }
        map[a.date][svcKey].members.push(a);
    }
    return Object.entries(map)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([date, services]) => ({ date, services: Object.values(services) }));
});

const todayStr = computed(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
});

function isToday(dateStr) { return dateStr === todayStr.value; }
function isPast(dateStr) { return dateStr < todayStr.value; }

function formatDateLong(dateStr) {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString(locale.value, { weekday: 'long', day: 'numeric', month: 'long' });
}

function formatDayShort(dateStr) {
    const d = new Date(dateStr + 'T00:00:00');
    return { day: d.getDate(), weekDay: weekDays[(d.getDay() + 6) % 7] };
}

async function fetchMyPlanning() {
    const { result } = await handleAsyncError(
        () => PlanningService.getMyPlanning(currentMonth.value, currentYear.value, effectiveDept.value),
        (val) => (loading.value = val)
    );
    assignments.value = result || [];
}

async function fetchTeamPlanning() {
    if (!effectiveDept.value) { teamData.value = []; return; }
    const { result } = await handleAsyncError(
        () => PlanningService.getTeamPlanning(effectiveDept.value, currentMonth.value, currentYear.value)
    );
    teamData.value = result || [];
}

async function fetchDepartments() {
    if (props.departmentSelected) { return; }
    const { result } = await handleAsyncError(
        () => DepartmentService.get(),
        (val) => (loadingDepts.value = val)
    );
    departments.value = result?.departments || [];
}

onMounted(async () => {
    await fetchDepartments();
    await fetchMyPlanning();
    await fetchTeamPlanning();
});

watch([currentMonth, currentYear, effectiveDept], () => { fetchMyPlanning(); fetchTeamPlanning(); });
</script>

<template>
    <component :is="showHeader ? PageComponent : 'div'" v-bind="showHeader ? { titlePage: t('myPlanning.title'), subtitle: t('myPlanning.subtitle'), showAddBtn: false } : {}">
        <!-- Navigation -->
        <div class="flex flex-wrap items-center justify-between gap-2 mb-4">
            <div class="flex items-center gap-1">
                <SelectButton v-model="viewMode" :options="[
                    { value: 'month', label: t('liMonth') },
                    { value: 'week', label: t('liWeek') }
                ]" optionValue="value" optionLabel="label" size="small" />
                <Button :label="t('liToDay')" size="small" outlined @click="goToday" />
            </div>

            <div class="flex items-center gap-1">
                <Button icon="pi pi-chevron-left" text rounded size="small" @click="viewMode === 'month' ? navigateMonth(-1) : navigateWeek(-1)" />
                <DatePicker v-if="viewMode === 'month'" v-model="selectedMonthDate" view="month" dateFormat="MM yy" :showIcon="false"
                    inputClass="font-semibold text-sm text-center capitalize cursor-pointer border-none bg-transparent w-[140px] p-1" />
                <span v-else class="font-semibold text-sm min-w-[180px] text-center capitalize">{{ weekLabel }}</span>
                <Button icon="pi pi-chevron-right" text rounded size="small" @click="viewMode === 'month' ? navigateMonth(1) : navigateWeek(1)" />
            </div>

            <div class="flex items-center gap-2">
                <Select v-if="!departmentSelected && departments.length > 0"
                    v-model="selectedDept" 
                    :options="departments" 
                    optionLabel="name" 
                    optionValue="id" 
                    :placeholder="t('liSelectDepart')"
                    :showClear="true"
                    :loading="loadingDepts"
                    class="w-48"
                    size="small"
                />
                <Tag severity="primary" :value="`${totalAssignments} ${t('myPlanning.assignments')}`" rounded />
            </div>
        </div>

        <!-- Loading -->
        <div v-if="loading" class="flex justify-center py-12">
            <ProgressSpinner />
        </div>

        <!-- === MON PLANNING === -->
        <template v-else-if="activeTab === 'mine'">
        <!-- Empty -->
        <div v-if="groupedByDate.length === 0" class="flex flex-col items-center py-16 text-surface-400">
            <i class="pi pi-calendar text-5xl mb-3"></i>
            <span class="text-lg font-medium">{{ t('myPlanning.noAssignments') }}</span>
        </div>

        <!-- Timeline view -->
        <div v-else class="flex flex-col gap-4">
            <div v-for="group in groupedByDate" :key="group.date"
                class="rounded-xl border overflow-hidden transition-all"
                :class="{
                    'border-primary bg-primary/5 shadow-md': isToday(group.date),
                    'border-surface-200 dark:border-surface-700': !isToday(group.date),
                    'opacity-60': isPast(group.date) && !isToday(group.date)
                }">
                <!-- Date header -->
                <div class="flex items-center gap-3 px-5 py-3 border-b"
                    :class="{
                        'bg-primary/10 border-primary/20': isToday(group.date),
                        'bg-surface-50 dark:bg-surface-800 border-surface-200 dark:border-surface-700': !isToday(group.date)
                    }">
                    <div class="flex flex-col items-center min-w-[50px]">
                        <span class="text-2xl font-bold" :class="isToday(group.date) ? 'text-primary' : ''">{{ formatDayShort(group.date).day }}</span>
                        <span class="text-xs uppercase font-semibold" :class="isToday(group.date) ? 'text-primary' : 'text-muted-color'">{{ formatDayShort(group.date).weekDay }}</span>
                    </div>
                    <div class="flex-1">
                        <span class="text-sm font-semibold capitalize" :class="isToday(group.date) ? 'text-primary' : ''">{{ formatDateLong(group.date) }}</span>
                        <Tag v-if="isToday(group.date)" :value="t('liToDay')" severity="primary" class="ml-2 text-xs" />
                    </div>
                    <Tag :value="`${group.items.length}`" severity="secondary" rounded class="text-xs" />
                </div>

                <!-- Services -->
                <div class="divide-y divide-surface-100 dark:divide-surface-800">
                    <div v-for="(item, idx) in group.items" :key="idx" class="flex items-start gap-4 px-5 py-3">
                        <div class="flex flex-col items-center min-w-[60px] pt-0.5">
                            <i class="pi pi-clock text-xs text-muted-color mb-0.5"></i>
                        </div>
                        <div class="flex-1">
                            <div class="flex items-center gap-2 flex-wrap">
                                <span class="font-bold text-base">{{ item.serviceName }}</span>
                                <Tag :value="item.programShortName || item.programName?.substring(0, 3)" severity="info" class="text-xs" />
                                <Tag v-if="item.indTraining" :value="t('planning.trainingTag')" severity="warn" class="text-xs" />
                            </div>
                            <div class="text-sm text-muted-color mt-1">
                                {{ item.departmentName }}
                            </div>
                            <div v-if="item.posteName" class="mt-1">
                                <Tag :value="item.posteName" severity="secondary" class="text-xs" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        </template>

        <!-- === ÉQUIPE === -->
        <template v-if="!loading && activeTab === 'team'">
            <div v-if="!effectiveDept" class="flex flex-col items-center py-16 text-surface-400">
                <i class="pi pi-users text-5xl mb-3"></i>
                <span class="text-lg font-medium">{{ t('planning.selectDeptTitle') }}</span>
            </div>
            <div v-else-if="teamGroupedByDate.length === 0" class="flex flex-col items-center py-16 text-surface-400">
                <i class="pi pi-users text-5xl mb-3"></i>
                <span class="text-lg font-medium">{{ t('myPlanning.noAssignments') }}</span>
            </div>
            <div v-else class="flex flex-col gap-4">
                <div v-for="group in teamGroupedByDate" :key="group.date"
                    class="rounded-xl border overflow-hidden"
                    :class="{
                        'border-primary bg-primary/5 shadow-md': isToday(group.date),
                        'border-surface-200 dark:border-surface-700': !isToday(group.date),
                        'opacity-60': isPast(group.date) && !isToday(group.date)
                    }">
                    <div class="flex items-center gap-3 px-5 py-3 border-b"
                        :class="{
                            'bg-primary/10 border-primary/20': isToday(group.date),
                            'bg-surface-50 dark:bg-surface-800 border-surface-200 dark:border-surface-700': !isToday(group.date)
                        }">
                        <div class="flex flex-col items-center min-w-[50px]">
                            <span class="text-2xl font-bold" :class="isToday(group.date) ? 'text-primary' : ''">{{ formatDayShort(group.date).day }}</span>
                            <span class="text-xs uppercase font-semibold" :class="isToday(group.date) ? 'text-primary' : 'text-muted-color'">{{ formatDayShort(group.date).weekDay }}</span>
                        </div>
                        <span class="text-sm font-semibold capitalize flex-1" :class="isToday(group.date) ? 'text-primary' : ''">{{ formatDateLong(group.date) }}</span>
                        <Tag v-if="isToday(group.date)" :value="t('liToDay')" severity="primary" class="text-xs" />
                    </div>
                    <div class="divide-y divide-surface-100 dark:divide-surface-800">
                        <div v-for="(svc, si) in group.services" :key="si" class="px-5 py-3">
                            <div class="flex items-center gap-2 mb-2">
                                <Tag :value="svc.program" severity="info" class="text-xs" />
                                <span class="font-semibold text-sm">{{ svc.service }}</span>
                            </div>
                            <div class="flex flex-wrap gap-2">
                                <div v-for="(m, mi) in svc.members" :key="mi" class="flex items-center gap-1.5 bg-surface-50 dark:bg-surface-800 rounded-lg px-3 py-1.5">
                                    <i class="pi pi-user text-xs text-primary"></i>
                                    <span class="text-sm font-medium">{{ m.memberName }}</span>
                                    <Tag v-if="m.posteName" :value="m.posteName" severity="secondary" class="text-[0.6rem]" />
                                    <Tag v-if="m.indTraining" :value="t('planning.trainingTag')" severity="warn" class="text-[0.6rem]" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </template>
    </component>
</template>
