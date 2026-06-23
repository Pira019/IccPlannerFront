<script setup>
import PageComponent from '@/components/PageComponent.vue';
import { Permission } from '@/model/Enum/Permission';
import DepartmentService from '@/service/DepartmentService';
import PosteService from '@/service/PosteService';
import { useHandleAsyncError } from '@/utils/handleAsyncError';
import { hasPermission } from '@/utils/hasPermission';
import { useConfirmDialog } from '@/utils/useConfirmDialog';
import { computed, onMounted, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';

const canManage = computed(() => hasPermission(Permission.DEPART_MANAGER) || hasPermission(Permission.CAN_MANAG_DEPART));

// Invitation filter
const invitationFilter = ref(null);
const invitationFilterOptions = computed(() => [
    { label: t('invitation.pending'), value: 'pending' },
    { label: t('invitation.used'), value: 'used' },
    { label: t('invitation.expired'), value: 'expired' },
]);

const filteredInvitations = computed(() => {
    const invitations = department.value?.invitations || [];
    if (!invitationFilter.value) return invitations;

    return invitations.filter(inv => {
        if (invitationFilter.value === 'used') return inv.indUsed;
        if (invitationFilter.value === 'expired') return inv.isExpired && !inv.indUsed;
        if (invitationFilter.value === 'pending') return inv.indAct && !inv.indUsed && !inv.isExpired;
        return true;
    });
});

const { t, locale } = useI18n();
const { handleAsyncError } = useHandleAsyncError();
const { showConfirm } = useConfirmDialog();
const router = useRouter();

const props = defineProps({
    id: { type: [String, Number], required: true }
});

const loading = ref(false);
const department = ref(null);
const showAllPrograms = ref(false);

async function fetchData() {
    const { result } = await handleAsyncError(() => DepartmentService.getDetail(props.id), (val) => (loading.value = val));
    if (result) { department.value = result; }
}

function formatDate(dateStr) {
    if (!dateStr) { return '—'; }
    return new Date(dateStr + 'T00:00:00').toLocaleDateString(locale.value, { day: 'numeric', month: 'long', year: 'numeric' });
}

function formatDateTime(dateStr) {
    if (!dateStr) { return '—'; }
    return new Date(dateStr).toLocaleDateString(locale.value, { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function maskEmail(email) {
    if (!email) return '';
    const [local, domain] = email.split('@');
    const masked = local.substring(0, 2) + 'xxxxxxx';
    return `${masked}@${domain}`;
}

function invitationStatus(inv) {
    if (inv.indUsed) { return { label: t('invitation.used'), severity: 'success' }; }
    if (inv.isExpired) { return { label: t('invitation.expired'), severity: 'danger' }; }
    if (inv.indAct) { return { label: t('invitation.pending'), severity: 'warn' }; }
    return { label: t('invitation.inactive'), severity: 'secondary' };
}

// Postes
const showPostesDialog = ref(false);
const allPostes = ref([]);
const systemPostes = computed(() => allPostes.value.filter(p => p.indSystem));
const selectedPosteIds = ref([]);
const savingPostes = ref(false);

// Create poste
const showCreatePosteDialog = ref(false);
const newPosteForm = ref({ name: '', description: '', shortName: '', indGest: false });
const savingNewPoste = ref(false);
const createPosteError = ref(null);

// Member postes assignment
const showMemberPostesDialog = ref(false);
const selectedMember = ref(null);
const selectedMemberPosteIds = ref([]);
const savingMemberPostes = ref(false);
const memberPostesError = ref(null);

const viewedPoste = ref(null);
const showPosteDetailDialog = ref(false);

function viewPosteDetail(poste) {
    viewedPoste.value = poste;
    showPosteDetailDialog.value = true;
}

async function removePoste(posteId) {
    showConfirm({
        group: 'deleteDialog',
        message: 'liMsgDel',
        header: 'btnDel',
        acceptLabel: 'btnDel',
        acceptSeverity: 'danger',
        onAccept: async () => {
            await handleAsyncError(
                () => DepartmentService.removePoste(props.id, posteId),
                null,
                true
            );
            fetchData();
        }
    });
}

async function openPostesDialog() {
    const { result } = await handleAsyncError(() => PosteService.getAll());
    if (result) { allPostes.value = result; }
    selectedPosteIds.value = department.value?.postes?.map(p => p.id) || [];
    showPostesDialog.value = true;
}

async function savePostes() {
    const { error } = await handleAsyncError(
        () => DepartmentService.assignPostes(props.id, selectedPosteIds.value),
        (val) => (savingPostes.value = val),
        true
    );
    if (!error) {
        showPostesDialog.value = false;
        fetchData();
    }
}

function openCreatePosteDialog() {
    newPosteForm.value = { name: '', description: '', shortName: '', indGest: false, assignToDept: true };
    createPosteError.value = null;
    showCreatePosteDialog.value = true;
}

async function saveNewPoste() {
    createPosteError.value = null;
    if (!newPosteForm.value.name?.trim()) {
        createPosteError.value = t('validation.displayNameRequired');
        return;
    }
    if (!newPosteForm.value.description?.trim()) {
        createPosteError.value = t('validation.descriptionRequired');
        return;
    }
    const { error, result } = await handleAsyncError(
        () => PosteService.create({ name: newPosteForm.value.name, description: newPosteForm.value.description, shortName: newPosteForm.value.shortName, indGest: newPosteForm.value.indGest }),
        (val) => (savingNewPoste.value = val),
        true
    );
    if (error) { createPosteError.value = error.message; return; }

    // Affecter au département si demandé
    if (newPosteForm.value.assignToDept && result?.id) {
        const currentPosteIds = department.value?.postes?.map(p => p.id) || [];
        await handleAsyncError(
            () => DepartmentService.assignPostes(props.id, [...currentPosteIds, result.id])
        );
    }

    showCreatePosteDialog.value = false;
    // Rafraichir la liste des postes
    const { result: postes } = await handleAsyncError(() => PosteService.getAll());
    if (postes) { allPostes.value = postes; }
    fetchData();
}

async function openMemberPostesDialog(member) {
    selectedMember.value = member;
    if (allPostes.value.length === 0) {
        const { result } = await handleAsyncError(() => PosteService.getAll());
        if (result) { allPostes.value = result; }
    }
    // Trouver les postes actuels du membre par nom
    selectedMemberPosteIds.value = allPostes.value
        .filter(p => member.postes?.includes(p.name))
        .map(p => p.id);
    showMemberPostesDialog.value = true;
}

async function saveMemberPostes() {
    if (!selectedMember.value?.departmentMemberId) return;
    memberPostesError.value = null;
    const { error } = await handleAsyncError(
        () => DepartmentService.assignPostesToMember(props.id, selectedMember.value.departmentMemberId, selectedMemberPosteIds.value),
        (val) => (savingMemberPostes.value = val),
        true
    );
    if (error) {
        memberPostesError.value = error.message || error;
        return;
    }
    showMemberPostesDialog.value = false;
    fetchData();
}

onMounted(() => fetchData());
watch(() => props.id, () => fetchData());
</script>

<template>
    <PageComponent :title-page="department?.name || $t('liDepart')" :show-add-btn="false"
        :breadcrumbs="[{ label: $t('liDepart'), route: '/departments' }, { label: department?.name || '' }]">
        <div v-if="loading" class="flex justify-center py-12">
            <ProgressSpinner />
        </div>

        <template v-else-if="department">
            <!-- Info cards -->
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                <div class="bg-primary/10 rounded-xl p-5 flex items-center gap-4 cursor-pointer hover:bg-primary/20 transition"
                    @click="router.push('/members')">
                    <div class="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                        <i class="pi pi-users text-primary text-xl"></i>
                    </div>
                    <div>
                        <div class="text-2xl font-bold">{{ department.memberCount }}</div>
                        <div class="text-sm text-muted-color">{{ $t('Members') }}</div>
                    </div>
                </div>
                <div class="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-5 flex items-center gap-4">
                    <div class="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-800/30 flex items-center justify-center">
                        <i class="pi pi-id-card text-blue-600 text-xl"></i>
                    </div>
                    <div>
                        <div class="text-2xl font-bold">{{ department.postes.length }}</div>
                        <div class="text-sm text-muted-color">Postes</div>
                    </div>
                </div>
                <div class="bg-green-50 dark:bg-green-900/20 rounded-xl p-5 flex items-center gap-4">
                    <div class="w-12 h-12 rounded-full bg-green-100 dark:bg-green-800/30 flex items-center justify-center">
                        <i class="pi pi-calendar text-green-600 text-xl"></i>
                    </div>
                    <div>
                        <div class="text-sm text-muted-color">{{ $t('liDateStart') }}</div>
                        <div class="text-sm font-semibold">{{ formatDate(department.startDate) }}</div>
                    </div>
                </div>
            </div>

            <!-- Ministry -->
            <div v-if="department.ministryName" class="mb-4 text-sm text-muted-color">
                <i class="pi pi-building mr-1"></i> {{ department.ministryName }}
            </div>

            <!-- Description -->
            <div v-if="department.description" class="mb-6 p-4 bg-surface-50 dark:bg-surface-800 rounded-xl">
                <h3 class="text-sm font-semibold text-muted-color mb-2">{{ $t('Description') }}</h3>
                <p class="text-sm m-0">{{ department.description }}</p>
            </div>

            <!-- Programs tags -->
            <div v-if="department.programs.length > 0" class="mb-6">
                <h3 class="text-sm font-semibold text-muted-color mb-2">{{ $t('Programs') }} ({{ department.programCount }})</h3>
                <div class="flex flex-wrap gap-2">
                    <Tag v-for="prg in department.programs.slice(0, showAllPrograms ? department.programs.length : 5)" :key="prg.programId"
                        :value="prg.shortName || prg.programName"
                        :severity="prg.indRecurrent ? 'info' : 'secondary'" rounded />
                    <Button v-if="department.programs.length > 5 && !showAllPrograms" 
                        :label="`+${department.programs.length - 5}`" 
                        size="small" text rounded @click="showAllPrograms = true" />
                    <Button v-if="showAllPrograms && department.programs.length > 5" 
                        :label="$t('bntClose')" 
                        size="small" text rounded @click="showAllPrograms = false" />
                </div>
            </div>

            <!-- Postes tags -->
            <div class="mb-6">
                <div class="flex items-center justify-between mb-2">
                    <h3 class="text-sm font-semibold text-muted-color">Postes ({{ department.postes?.length || 0 }})</h3>
                    <div class="flex gap-1" v-if="canManage">
                        <Button icon="pi pi-plus" size="small" rounded text @click="openCreatePosteDialog" v-tooltip="'Creer un poste'" />
                        <Button icon="pi pi-link" size="small" rounded text @click="openPostesDialog" v-tooltip="'Affecter des postes'" />
                    </div>
                </div>
                <div v-if="department.postes?.length > 0" class="flex flex-wrap gap-2">
                    <span v-for="p in department.postes" :key="p.id" class="relative group inline-flex items-center">
                        <Tag 
                            :value="p.shortName || p.name" 
                            v-tooltip="p.shortName ? p.name : ''"
                            severity="info" rounded />
                        <button v-if="canManage" 
                            class="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[0.5rem] items-center justify-center hidden group-hover:flex"
                            @click="removePoste(p.id)">
                            <i class="pi pi-times text-[0.5rem]"></i>
                        </button>
                        <button 
                            class="absolute -top-1 -left-1 w-4 h-4 rounded-full bg-primary text-white text-[0.5rem] items-center justify-center hidden group-hover:flex"
                            @click="viewPosteDetail(p)">
                            <i class="pi pi-eye text-[0.5rem]"></i>
                        </button>
                    </span>
                </div>
                <div v-else class="text-sm text-muted-color">Aucun poste affecte.</div>
            </div>

            <!-- Tabs: Membres | Invitations -->
            <Tabs value="members">
                <TabList>
                    <Tab value="members">
                        <i class="pi pi-users mr-2"></i>{{ $t('Members') }} ({{ department.memberCount }})
                    </Tab>
                    <Tab value="invitations" v-if="canManage">
                        <i class="pi pi-envelope mr-2"></i>{{ $t('invitation.title') }} ({{ department.invitations?.length || 0 }})
                    </Tab>
                </TabList>

                <TabPanels>
                    <!-- Members -->
                    <TabPanel value="members">
                        <div v-if="department.members.length === 0" class="text-sm text-muted-color py-4">{{ $t('liNoMembers') }}</div>
                        <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-4">
                            <div v-for="(m, idx) in department.members" :key="idx"
                                class="flex items-center gap-3 p-3 rounded-lg border border-surface-200 dark:border-surface-700">
                                <div class="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                                    {{ (m.displayName?.[0] || '?').toUpperCase() }}
                                </div>
                                <div class="flex-1 min-w-0">
                                    <div class="font-medium text-sm truncate">{{ m.displayName }}</div>
                                    <div class="flex flex-wrap gap-1 mt-0.5">
                                        <Tag v-for="p in m.postes" :key="p" :value="p" severity="secondary" class="text-[0.6rem]" />
                                        <Tag v-if="m.status" :value="m.status" :severity="m.status === 'Active' ? 'success' : 'warn'" class="text-[0.6rem]" />
                                    </div>
                                </div>
                                <Button v-if="canManage" icon="pi pi-plus" text rounded size="small" @click="openMemberPostesDialog(m)" v-tooltip="'Attribuer poste'" />
                            </div>
                        </div>
                    </TabPanel>

                    <!-- Invitations -->
                    <TabPanel value="invitations" v-if="canManage">
                        <div v-if="!department.invitations?.length" class="text-sm text-muted-color py-4">{{ $t('invitation.none') }}</div>
                        <template v-else>
                            <!-- Filtre par état -->
                            <div class="flex gap-2 mt-4 mb-4">
                                <SelectButton v-model="invitationFilter" :options="invitationFilterOptions" optionLabel="label" optionValue="value" :allowEmpty="true" />
                            </div>
                            <div class="flex flex-col gap-2">
                                <div v-for="inv in filteredInvitations" :key="inv.id"
                                    class="flex items-center gap-3 p-3 rounded-lg border border-surface-200 dark:border-surface-700">
                                    <div class="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                        <i class="pi pi-envelope text-sm"></i>
                                    </div>
                                    <div class="flex-1 min-w-0">
                                        <div class="font-medium text-sm">{{ inv.firstName }}</div>
                                        <div class="text-xs text-muted-color">{{ maskEmail(inv.email) }}</div>
                                        <div class="text-xs text-muted-color">{{ $t('invitation.sentOn') }} {{ formatDateTime(inv.dateSend) }}</div>
                                        <div v-if="inv.dateUsed" class="text-xs text-green-600">{{ $t('invitation.usedOn') }} {{ formatDateTime(inv.dateUsed) }}</div>
                                    </div>
                                    <Tag :value="invitationStatus(inv).label" :severity="invitationStatus(inv).severity" class="text-[0.6rem]" />
                                </div>
                                <div v-if="filteredInvitations.length === 0" class="text-sm text-muted-color py-2">{{ $t('NoResultsFound') }}</div>
                            </div>
                        </template>
                    </TabPanel>
                </TabPanels>
            </Tabs>
        </template>

        <!-- Dialog affecter postes au departement -->
        <Dialog v-model:visible="showPostesDialog" header="Affecter des postes" modal :style="{ width: '400px' }" :breakpoints="{ '575px': '90vw' }">
            <div class="flex flex-col gap-4">
                <MultiSelect v-model="selectedPosteIds" :options="allPostes" optionLabel="name" optionValue="id"
                    placeholder="Selectionner les postes" filter display="chip" class="w-full" />
            </div>
            <template #footer>
                <Button :label="$t('Cancel')" text @click="showPostesDialog = false" />
                <Button :label="$t('Save')" icon="pi pi-check" :loading="savingPostes" @click="savePostes" />
            </template>
        </Dialog>

        <!-- Dialog affecter postes a un membre -->
        <Dialog v-model:visible="showMemberPostesDialog" :header="'Attribuer poste - ' + (selectedMember?.displayName || '')" modal :style="{ width: '400px' }" :breakpoints="{ '575px': '90vw' }">
            <div class="flex flex-col gap-4">
                <MultiSelect v-model="selectedMemberPosteIds" :options="systemPostes" optionLabel="name" optionValue="id"
                    placeholder="Selectionner les postes" filter display="chip" class="w-full" />
                <Message v-if="memberPostesError" severity="error" size="small">{{ memberPostesError }}</Message>
            </div>
            <template #footer>
                <Button :label="$t('Cancel')" text @click="showMemberPostesDialog = false" />
                <Button :label="$t('Save')" icon="pi pi-check" :loading="savingMemberPostes" @click="saveMemberPostes" />
            </template>
        </Dialog>

        <!-- Dialog creer un poste -->
        <Dialog v-model:visible="showCreatePosteDialog" header="Creer un poste" modal :style="{ width: '400px' }" :breakpoints="{ '575px': '90vw' }">
            <div class="flex flex-col gap-4">
                <div class="flex flex-col gap-1">
                    <label class="font-semibold text-sm">{{ $t('Name') }} *</label>
                    <InputText v-model="newPosteForm.name" />
                </div>
                <div class="flex flex-col gap-1">
                    <label class="font-semibold text-sm">{{ $t('Description') }} *</label>
                    <Textarea v-model="newPosteForm.description" rows="2" />
                </div>
                <div class="flex flex-col gap-1">
                    <label class="font-semibold text-sm">Abreviation</label>
                    <InputText v-model="newPosteForm.shortName" maxlength="15" />
                </div>
                <div class="flex items-center gap-2">
                    <Checkbox v-model="newPosteForm.assignToDept" inputId="assignToDept" :binary="true" />
                    <label for="assignToDept" class="text-sm">Affecter au département</label>
                </div>
                <Message v-if="createPosteError" severity="error" size="small">{{ createPosteError }}</Message>
            </div>
            <template #footer>
                <Button :label="$t('Cancel')" text @click="showCreatePosteDialog = false" />
                <Button :label="$t('Save')" icon="pi pi-check" :loading="savingNewPoste" @click="saveNewPoste" :disabled="!newPosteForm.name || !newPosteForm.description" />
            </template>
        </Dialog>

        <!-- Dialog detail poste -->
        <Dialog v-model:visible="showPosteDetailDialog" :header="viewedPoste?.name" modal :style="{ width: '400px' }" :breakpoints="{ '575px': '90vw' }">
            <div class="flex flex-col gap-3" v-if="viewedPoste">
                <div>
                    <span class="text-xs font-semibold text-muted-color">{{ $t('Name') }}</span>
                    <p class="m-0 font-medium">{{ viewedPoste.name }}</p>
                </div>
                <div v-if="viewedPoste.shortName">
                    <span class="text-xs font-semibold text-muted-color">{{ $t('ShortName') }}</span>
                    <p class="m-0">{{ viewedPoste.shortName }}</p>
                </div>
                <div v-if="viewedPoste.description">
                    <span class="text-xs font-semibold text-muted-color">{{ $t('Description') }}</span>
                    <p class="m-0 text-sm">{{ viewedPoste.description }}</p>
                </div>
            </div>
        </Dialog>
    </PageComponent>
</template>
