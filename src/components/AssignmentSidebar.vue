<script setup>
import MemberChip from '@/components/MemberChip.vue';
import DepartmentService from '@/service/DepartmentService';
import { useHandleAsyncError } from '@/utils/handleAsyncError';
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const { handleAsyncError } = useHandleAsyncError();

const props = defineProps({
    visible: { type: Boolean, required: true },
    departmentId: { type: [String, Number], required: true },
    selectedDate: { type: String, required: true }
});

const emit = defineEmits(['update:visible', 'assignment-changed']);

// State
const members = ref([]);
const assignments = ref([]);
const membersLoading = ref(false);
const assignLoading = ref(false);
const searchQuery = ref('');
const isDesktop = ref(window.innerWidth >= 1024);

// Responsive detection
function onResize() {
    isDesktop.value = window.innerWidth >= 1024;
}

onMounted(() => {
    window.addEventListener('resize', onResize);
    fetchMembers();
});

onUnmounted(() => {
    window.removeEventListener('resize', onResize);
});

// Computed
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

const filteredMembers = computed(() => {
    const query = searchQuery.value.toLowerCase().trim();
    if (!query) return membersWithStatus.value;
    return membersWithStatus.value.filter((m) => {
        const fullName = `${m.firstName} ${m.lastName}`.toLowerCase();
        return fullName.includes(query);
    });
});

const availableCount = computed(() => members.value.filter((m) => m.isAvailable).length);
const assignedCount = computed(() => assignments.value.length);

// --- MOCK DATA (à retirer quand l'API est prête) ---
function generateMockMembers(date) {
    const allMembers = [
        { id: 1, firstName: 'Jean', lastName: 'Dupont', fonction: 'Live', isAvailable: true },
        { id: 2, firstName: 'Marie', lastName: 'Kouassi', fonction: 'Chorale', isAvailable: true },
        { id: 3, firstName: 'Paul', lastName: 'Mbeki', fonction: 'Son', isAvailable: true },
        { id: 4, firstName: 'Sarah', lastName: 'Ndiaye', fonction: 'Accueil', isAvailable: false },
        { id: 5, firstName: 'David', lastName: 'Okafor', fonction: 'Camera', isAvailable: true },
        { id: 6, firstName: 'Ruth', lastName: 'Bamba', fonction: 'Chorale', isAvailable: true },
        { id: 7, firstName: 'Samuel', lastName: 'Traoré', fonction: 'Régie', isAvailable: false },
        { id: 8, firstName: 'Esther', lastName: 'Diallo', fonction: 'Live', isAvailable: true }
    ];
    // Quelques membres déjà assignés
    const mockAssignments = [
        { id: 101, memberId: 1, date, serviceId: 1, serviceName: 'Culte de célébration' },
        { id: 102, memberId: 2, date, serviceId: 1, serviceName: 'Culte de célébration' },
        { id: 103, memberId: 5, date, serviceId: 2, serviceName: 'École du dimanche' }
    ];
    return { members: allMembers, assignments: mockAssignments };
}

// Methods
async function fetchMembers() {
    if (!props.departmentId || !props.selectedDate) return;

    const { result, error } = await handleAsyncError(
        () => DepartmentService.getMembersAvailability(props.departmentId, props.selectedDate),
        (val) => (membersLoading.value = val)
    );

    if (error || !result) {
        // Fallback mock data pour le développement
        const mock = generateMockMembers(props.selectedDate);
        members.value = mock.members;
        assignments.value = mock.assignments;
        return;
    }

    members.value = result?.members || [];
    assignments.value = result?.assignments || [];
}

async function assignMember(memberId) {
    const { error } = await handleAsyncError(
        () =>
            DepartmentService.assignMember(props.departmentId, {
                memberId,
                date: props.selectedDate
            }),
        (val) => (assignLoading.value = val),
        true,
        'planning.assignSuccess'
    );

    if (!error) {
        await fetchMembers();
        emit('assignment-changed');
    }
}

async function unassignMember(assignmentId) {
    const { error } = await handleAsyncError(
        () => DepartmentService.unassignMember(props.departmentId, assignmentId),
        (val) => (assignLoading.value = val),
        true,
        'planning.unassignSuccess'
    );

    if (!error) {
        await fetchMembers();
        emit('assignment-changed');
    }
}

function closeSidebar() {
    emit('update:visible', false);
}

// Watchers
watch(
    () => props.selectedDate,
    () => {
        searchQuery.value = '';
        fetchMembers();
    }
);

watch(
    () => props.visible,
    (val) => {
        if (val) {
            searchQuery.value = '';
            fetchMembers();
        }
    }
);
</script>

<template>
    <!-- Desktop: fixed panel -->
    <div v-if="isDesktop && visible" class="assignment-sidebar border-l border-surface-200 bg-surface-0 dark:bg-surface-900 dark:border-surface-700 flex flex-col h-full" style="width: 380px; min-width: 380px">
        <div class="flex flex-col h-full overflow-hidden">
            <!-- Header -->
            <div class="flex items-center justify-between p-4 border-b border-surface-200 dark:border-surface-700">
                <div class="flex items-center gap-3">
                    <div class="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10">
                        <i class="pi pi-users text-primary text-lg"></i>
                    </div>
                    <div>
                        <h3 class="m-0 text-base font-bold">{{ t('planning.assignMembers') }}</h3>
                        <span class="text-sm text-surface-400">{{ selectedDate }}</span>
                    </div>
                </div>
                <Button icon="pi pi-times" severity="secondary" text rounded size="small" @click="closeSidebar" />
            </div>

            <!-- Content -->
            <div class="flex flex-col flex-1 overflow-hidden p-4 gap-3">
                <!-- Loading -->
                <LoadingDialogComponent :onLoading="membersLoading" />

                <template v-if="!membersLoading">
                    <!-- Stats -->
                    <div class="flex flex-wrap gap-2">
                        <Tag severity="info" :value="`${members.length} ${t('planning.totalMembers')}`" rounded />
                        <Tag severity="success" :value="`${availableCount} ${t('planning.available')}`" rounded />
                        <Tag severity="warn" :value="`${assignedCount} ${t('planning.assigned')}`" rounded />
                    </div>

                    <!-- Search -->
                    <IconField>
                        <InputIcon class="pi pi-search" />
                        <InputText v-model="searchQuery" :placeholder="t('planning.searchMembers')" class="w-full" size="small" />
                    </IconField>

                    <!-- Members list -->
                    <div class="flex flex-col gap-2 flex-1 overflow-y-auto">
                        <div
                            v-for="member in filteredMembers"
                            :key="member.id"
                            class="flex items-center justify-between p-3 rounded-xl border transition-all duration-200"
                            :class="
                                member.isAssigned
                                    ? 'border-primary/30 bg-primary/5'
                                    : member.isAvailable
                                      ? 'border-green-200 bg-green-50/50 dark:border-green-800 dark:bg-green-900/20'
                                      : 'border-surface-200 bg-surface-50 opacity-60 dark:border-surface-700 dark:bg-surface-800'
                            "
                        >
                            <div class="flex items-center gap-3 min-w-0 flex-1">
                                <MemberChip :firstName="member.firstName" :lastName="member.lastName" size="normal" />
                                <div class="flex flex-col min-w-0">
                                    <span class="text-xs text-surface-400 truncate">{{ member.fonction || '' }}</span>
                                </div>
                                <Tag v-if="member.isAssigned" severity="primary" :value="t('planning.assigned')" class="text-xs ml-auto" />
                                <Tag v-else-if="member.isAvailable" severity="success" :value="t('planning.available')" class="text-xs ml-auto" />
                                <Tag v-else severity="secondary" :value="t('planning.unavailable')" class="text-xs ml-auto" />
                            </div>

                            <div class="flex-shrink-0 ml-2">
                                <Button v-if="member.isAvailable && !member.isAssigned" icon="pi pi-plus" severity="success" size="small" rounded outlined :disabled="assignLoading" @click="assignMember(member.id)" :title="t('planning.assign')" />
                                <Button v-else-if="member.isAssigned" icon="pi pi-times" severity="danger" size="small" rounded outlined :disabled="assignLoading" @click="unassignMember(member.assignmentId)" :title="t('planning.unassign')" />
                            </div>
                        </div>

                        <!-- Empty state -->
                        <div v-if="filteredMembers.length === 0" class="flex flex-col items-center gap-3 py-8 text-surface-400">
                            <i class="pi pi-users text-4xl"></i>
                            <span class="text-sm">{{ t('planning.noMembersForDate') }}</span>
                        </div>
                    </div>
                </template>
            </div>
        </div>
    </div>

    <!-- Mobile: Drawer -->
    <Drawer v-if="!isDesktop" :visible="visible" @update:visible="(val) => emit('update:visible', val)" position="right" :header="t('planning.assignMembers')" class="!w-full sm:!w-[400px]">
        <div class="flex flex-col gap-3 h-full overflow-hidden">
            <div class="text-sm text-surface-400">{{ selectedDate }}</div>

            <!-- Loading -->
            <LoadingDialogComponent :onLoading="membersLoading" />

            <template v-if="!membersLoading">
                <!-- Stats -->
                <div class="flex flex-wrap gap-2">
                    <Tag severity="info" :value="`${members.length} ${t('planning.totalMembers')}`" rounded />
                    <Tag severity="success" :value="`${availableCount} ${t('planning.available')}`" rounded />
                    <Tag severity="warn" :value="`${assignedCount} ${t('planning.assigned')}`" rounded />
                </div>

                <!-- Search -->
                <IconField>
                    <InputIcon class="pi pi-search" />
                    <InputText v-model="searchQuery" :placeholder="t('planning.searchMembers')" class="w-full" size="small" />
                </IconField>

                <!-- Members list -->
                <div class="flex flex-col gap-2 flex-1 overflow-y-auto">
                    <div
                        v-for="member in filteredMembers"
                        :key="member.id"
                        class="flex items-center justify-between p-3 rounded-xl border transition-all duration-200"
                        :class="
                            member.isAssigned
                                ? 'border-primary/30 bg-primary/5'
                                : member.isAvailable
                                  ? 'border-green-200 bg-green-50/50 dark:border-green-800 dark:bg-green-900/20'
                                  : 'border-surface-200 bg-surface-50 opacity-60 dark:border-surface-700 dark:bg-surface-800'
                        "
                    >
                        <div class="flex items-center gap-3 min-w-0 flex-1">
                            <MemberChip :firstName="member.firstName" :lastName="member.lastName" size="normal" />
                            <div class="flex flex-col min-w-0">
                                <span class="text-xs text-surface-400 truncate">{{ member.fonction || '' }}</span>
                            </div>
                            <Tag v-if="member.isAssigned" severity="primary" :value="t('planning.assigned')" class="text-xs ml-auto" />
                            <Tag v-else-if="member.isAvailable" severity="success" :value="t('planning.available')" class="text-xs ml-auto" />
                            <Tag v-else severity="secondary" :value="t('planning.unavailable')" class="text-xs ml-auto" />
                        </div>

                        <div class="flex-shrink-0 ml-2">
                            <Button v-if="member.isAvailable && !member.isAssigned" icon="pi pi-plus" severity="success" size="small" rounded outlined :disabled="assignLoading" @click="assignMember(member.id)" :title="t('planning.assign')" />
                            <Button v-else-if="member.isAssigned" icon="pi pi-times" severity="danger" size="small" rounded outlined :disabled="assignLoading" @click="unassignMember(member.assignmentId)" :title="t('planning.unassign')" />
                        </div>
                    </div>

                    <!-- Empty state -->
                    <div v-if="filteredMembers.length === 0" class="flex flex-col items-center gap-3 py-8 text-surface-400">
                        <i class="pi pi-users text-4xl"></i>
                        <span class="text-sm">{{ t('planning.noMembersForDate') }}</span>
                    </div>
                </div>
            </template>
        </div>
    </Drawer>
</template>

<style scoped>
.assignment-sidebar {
    transition: all 0.3s ease;
}
</style>
