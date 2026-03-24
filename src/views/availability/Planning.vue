<script setup>
import { useHandleAsyncError } from '@/utils/handleAsyncError';
import { ref } from 'vue';
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

// Members panel
const selectedDate = ref(null);
const membersDialogVisible = ref(false);
const membersLoading = ref(false);
const members = ref([]);
const assignments = ref([]);
const assignLoading = ref(false);

// Fetch planning events
async function fetchPlanning() {
    if (!props.departmentSelected || !currentMonthYear.value) return;

    const { result, error } = await handleAsyncError(
        () => DepartmentService.getPlanning(
            props.departmentSelected,
            currentMonthYear.value.month,
            currentMonthYear.value.year
        ),
        (val) => (loading.value = val)
    );

    errorReq.value = error;
    if (error) return;
    lstEvents.value = result || [];
}

// Fetch members + availability for a date
async function fetchMembersForDate(date) {
    if (!props.departmentSelected) return;

    const { result, error } = await handleAsyncError(
        () => DepartmentService.getMembersAvailability(props.departmentSelected, date),
        (val) => (membersLoading.value = val)
    );

    if (error) {
        members.value = [];
        assignments.value = [];
        return;
    }

    members.value = result?.members || [];
    assignments.value = result?.assignments || [];
}

function onDateClicked(date) {
    selectedDate.value = date;
    membersDialogVisible.value = true;
    fetchMembersForDate(date);
}

async function assignMember(memberId) {
    const { error } = await handleAsyncError(
        () => DepartmentService.assignMember(props.departmentSelected, {
            memberId,
            date: selectedDate.value
        }),
        (val) => (assignLoading.value = val),
        true,
        'planning.assignSuccess'
    );

    if (!error) {
        await fetchMembersForDate(selectedDate.value);
    }
}

async function unassignMember(assignmentId) {
    const { error } = await handleAsyncError(
        () => DepartmentService.unassignMember(props.departmentSelected, assignmentId),
        (val) => (assignLoading.value = val),
        true,
        'planning.unassignSuccess'
    );

    if (!error) {
        await fetchMembersForDate(selectedDate.value);
    }
}

function onMonthYearChanged(data) {
    currentMonthYear.value = data;
}

function closeDialog() {
    membersDialogVisible.value = false;
    selectedDate.value = null;
}

const membersWithStatus = computed(() => {
    return members.value.map((m) => {
        const assigned = assignments.value.find((a) => a.memberId === m.id);
        return {
            ...m,
            isAssigned: !!assigned,
            assignmentId: assigned?.id || null
        };
    });
});

const availableCount = computed(() => members.value.filter((m) => m.isAvailable).length);
const assignedCount = computed(() => assignments.value.length);

// Reload on department or month change
watch(() => props.departmentSelected, () => {
    lstEvents.value = [];
    fetchPlanning();
});

watch(currentMonthYear, () => {
    fetchPlanning();
});
</script>

<template>
    <div>
        <!-- No department selected -->
        <EmptyStateComponent
            v-if="!departmentSelected"
            icon="pi pi-sitemap"
            :title="$t('planning.selectDeptTitle')"
            :description="$t('planning.selectDeptDesc')"
            :show-action="false"
        />

        <!-- Calendar -->
        <div v-else class="my-calendar">
            <CalendarEventComponent
                :add-calendar-content="true"
                :loading="loading"
                :error-req="errorReq"
                :lst-events="lstEvents"
                @CurrentMonthYear="onMonthYearChanged"
                @clickedDate="onDateClicked"
            >
                <template v-slot:fullCalendarContent="{ arg }">
                    <div class="flex flex-col gap-1 p-1" v-if="arg.event.id">
                        <p class="font-semibold text-xs truncate m-0">{{ arg.event.title }}</p>
                        <span class="flex items-center text-xs">
                            <i class="pi pi-clock mr-1"></i>
                            {{ arg.event.extendedProps.startTime }} - {{ arg.event.extendedProps.endTime }}
                        </span>
                        <div v-if="arg.event.extendedProps.assignedCount != null" class="flex items-center gap-1 text-xs">
                            <i class="pi pi-users"></i>
                            <span>{{ arg.event.extendedProps.assignedCount }}</span>
                        </div>
                    </div>
                </template>
            </CalendarEventComponent>
        </div>

        <!-- Members assignment dialog -->
        <Dialog
            v-model:visible="membersDialogVisible"
            :modal="true"
            :style="{ width: '55rem' }"
            :breakpoints="{ '1199px': '75vw', '575px': '90vw' }"
            @hide="closeDialog"
        >
            <template #header>
                <div class="flex items-center gap-3">
                    <div class="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10">
                        <i class="pi pi-users text-primary text-lg"></i>
                    </div>
                    <div>
                        <h3 class="m-0 text-lg font-bold">{{ $t('planning.assignMembers') }}</h3>
                        <span class="text-sm text-surface-400">{{ selectedDate }}</span>
                    </div>
                </div>
            </template>

            <LoadingDialogComponent :onLoading="membersLoading" />

            <!-- Stats -->
            <div v-if="!membersLoading" class="flex gap-3 mb-4">
                <Tag severity="info" :value="`${members.length} ${$t('Members')}`" rounded />
                <Tag severity="success" :value="`${availableCount} ${$t('planning.available')}`" rounded />
                <Tag severity="warn" :value="`${assignedCount} ${$t('planning.assigned')}`" rounded />
            </div>

            <!-- Members list -->
            <div v-if="!membersLoading" class="flex flex-col gap-2 max-h-[55vh] overflow-y-auto">
                <div
                    v-for="member in membersWithStatus"
                    :key="member.id"
                    class="flex items-center justify-between p-3 rounded-xl border transition-all duration-200"
                    :class="member.isAssigned
                        ? 'border-primary/30 bg-primary/5'
                        : member.isAvailable
                            ? 'border-green-200 bg-green-50/50'
                            : 'border-surface-200 bg-surface-50 opacity-60'"
                >
                    <div class="flex items-center gap-3 min-w-0 flex-1">
                        <!-- Avatar -->
                        <div
                            class="w-9 h-9 rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0"
                            :class="member.isAssigned ? 'bg-primary text-white' : 'bg-surface-200 text-surface-600'"
                        >
                            {{ (member.firstName?.[0] || '') + (member.lastName?.[0] || '') }}
                        </div>
                        <div class="flex flex-col min-w-0">
                            <span class="font-medium text-sm truncate">{{ member.firstName }} {{ member.lastName }}</span>
                            <span class="text-xs text-surface-400">{{ member.fonction || '' }}</span>
                        </div>
                        <!-- Availability badge -->
                        <Tag v-if="member.isAvailable" severity="success" :value="$t('planning.available')" class="text-xs" />
                        <Tag v-else severity="secondary" :value="$t('planning.unavailable')" class="text-xs" />
                    </div>

                    <!-- Action -->
                    <div class="flex-shrink-0 ml-2">
                        <Button
                            v-if="!member.isAssigned"
                            icon="pi pi-plus"
                            severity="primary"
                            size="small"
                            rounded
                            outlined
                            :disabled="assignLoading"
                            @click="assignMember(member.id)"
                            :title="$t('planning.assign')"
                        />
                        <Button
                            v-else
                            icon="pi pi-times"
                            severity="danger"
                            size="small"
                            rounded
                            outlined
                            :disabled="assignLoading"
                            @click="unassignMember(member.assignmentId)"
                            :title="$t('planning.unassign')"
                        />
                    </div>
                </div>

                <!-- Empty -->
                <div v-if="members.length === 0" class="flex flex-col items-center gap-3 py-8 text-surface-400">
                    <i class="pi pi-users text-4xl"></i>
                    <span class="text-sm">{{ $t('liNoMembers') }}</span>
                </div>
            </div>

            <template #footer>
                <Button :label="$t('bntClose')" severity="secondary" outlined @click="closeDialog" />
            </template>
        </Dialog>
    </div>
</template>

<style scoped>
.my-calendar {
    min-height: 70vh;
}
</style>
