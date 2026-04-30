<script setup>
import PageComponent from '@/components/PageComponent.vue';
import DepartmentService from '@/service/DepartmentService';
import PosteService from '@/service/PosteService';
import { useHandleAsyncError } from '@/utils/handleAsyncError';
import { onMounted, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';

const { t, locale } = useI18n();
const { handleAsyncError } = useHandleAsyncError();
const router = useRouter();

const props = defineProps({
    id: { type: [String, Number], required: true }
});

const loading = ref(false);
const department = ref(null);

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

function invitationStatus(inv) {
    if (inv.indUsed) { return { label: t('invitation.used'), severity: 'success' }; }
    if (inv.isExpired) { return { label: t('invitation.expired'), severity: 'danger' }; }
    if (inv.indAct) { return { label: t('invitation.pending'), severity: 'warn' }; }
    return { label: t('invitation.inactive'), severity: 'secondary' };
}

// Postes
const showPostesDialog = ref(false);
const allPostes = ref([]);
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
    newPosteForm.value = { name: '', description: '', shortName: '', indGest: false };
    createPosteError.value = null;
    showCreatePosteDialog.value = true;
}

async function saveNewPoste() {
    createPosteError.value = null;
    const { error } = await handleAsyncError(
        () => PosteService.create(newPosteForm.value),
        (val) => (savingNewPoste.value = val),
        true
    );
    if (error) { createPosteError.value = error.message; return; }
    showCreatePosteDialog.value = false;
    // Rafraichir la liste des postes
    const { result } = await handleAsyncError(() => PosteService.getAll());
    if (result) { allPostes.value = result; }
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
    const { error } = await handleAsyncError(
        () => DepartmentService.assignPostesToMember(props.id, selectedMember.value.departmentMemberId, selectedMemberPosteIds.value),
        (val) => (savingMemberPostes.value = val),
        true
    );
    if (!error) {
        showMemberPostesDialog.value = false;
        fetchData();
    }
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
                    <Tag v-for="prg in department.programs" :key="prg.programId"
                        :value="prg.shortName || prg.programName"
                        :severity="prg.indRecurrent ? 'info' : 'secondary'" rounded />
                </div>
            </div>

            <!-- Postes tags -->
            <div class="mb-6">
                <div class="flex items-center justify-between mb-2">
                    <h3 class="text-sm font-semibold text-muted-color">Postes ({{ department.postes?.length || 0 }})</h3>
                    <div class="flex gap-1">
                        <Button icon="pi pi-plus" size="small" rounded text @click="openCreatePosteDialog" v-tooltip="'Creer un poste'" />
                        <Button icon="pi pi-link" size="small" rounded text @click="openPostesDialog" v-tooltip="'Affecter des postes'" />
                    </div>
                </div>
                <div v-if="department.postes?.length > 0" class="flex flex-wrap gap-2">
                    <Tag v-for="p in department.postes" :key="p.id" :value="p.name" severity="info" rounded />
                </div>
                <div v-else class="text-sm text-muted-color">Aucun poste affecte.</div>
            </div>

            <!-- Tabs: Membres | Invitations -->
            <Tabs value="members">
                <TabList>
                    <Tab value="members">
                        <i class="pi pi-users mr-2"></i>{{ $t('Members') }} ({{ department.memberCount }})
                    </Tab>
                    <Tab value="invitations">
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
                                <Button icon="pi pi-plus" text rounded size="small" @click="openMemberPostesDialog(m)" v-tooltip="'Attribuer poste'" />
                            </div>
                        </div>
                    </TabPanel>

                    <!-- Invitations -->
                    <TabPanel value="invitations">
                        <div v-if="!department.invitations?.length" class="text-sm text-muted-color py-4">{{ $t('invitation.none') }}</div>
                        <div v-else class="flex flex-col gap-2 mt-4">
                            <div v-for="inv in department.invitations" :key="inv.id"
                                class="flex items-center gap-3 p-3 rounded-lg border border-surface-200 dark:border-surface-700">
                                <div class="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                    <i class="pi pi-envelope text-sm"></i>
                                </div>
                                <div class="flex-1 min-w-0">
                                    <div class="font-medium text-sm">{{ inv.firstName }}</div>
                                    <div class="text-xs text-muted-color truncate">{{ inv.email }}</div>
                                </div>
                                <div class="text-xs text-muted-color text-right hidden sm:block">
                                    {{ formatDateTime(inv.dateSend) }}
                                </div>
                                <Tag :value="invitationStatus(inv).label" :severity="invitationStatus(inv).severity" class="text-[0.6rem]" />
                            </div>
                        </div>
                    </TabPanel>
                </TabPanels>
            </Tabs>
        </template>

        <!-- Dialog affecter postes au departement -->
        <Dialog v-model:visible="showPostesDialog" header="Affecter des postes" modal :style="{ width: '400px' }">
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
        <Dialog v-model:visible="showMemberPostesDialog" :header="'Attribuer poste - ' + (selectedMember?.displayName || '')" modal :style="{ width: '400px' }">
            <div class="flex flex-col gap-4">
                <MultiSelect v-model="selectedMemberPosteIds" :options="allPostes" optionLabel="name" optionValue="id"
                    placeholder="Selectionner les postes" filter display="chip" class="w-full" />
            </div>
            <template #footer>
                <Button :label="$t('Cancel')" text @click="showMemberPostesDialog = false" />
                <Button :label="$t('Save')" icon="pi pi-check" :loading="savingMemberPostes" @click="saveMemberPostes" />
            </template>
        </Dialog>

        <!-- Dialog creer un poste -->
        <Dialog v-model:visible="showCreatePosteDialog" header="Creer un poste" modal :style="{ width: '400px' }">
            <div class="flex flex-col gap-4">
                <div class="flex flex-col gap-1">
                    <label class="font-semibold text-sm">{{ $t('Name') }} *</label>
                    <InputText v-model="newPosteForm.name" />
                </div>
                <div class="flex flex-col gap-1">
                    <label class="font-semibold text-sm">{{ $t('Description') }}</label>
                    <Textarea v-model="newPosteForm.description" rows="2" />
                </div>
                <div class="flex flex-col gap-1">
                    <label class="font-semibold text-sm">Abreviation</label>
                    <InputText v-model="newPosteForm.shortName" maxlength="15" />
                </div>
                <Message v-if="createPosteError" severity="error" size="small">{{ createPosteError }}</Message>
            </div>
            <template #footer>
                <Button :label="$t('Cancel')" text @click="showCreatePosteDialog = false" />
                <Button :label="$t('Save')" icon="pi pi-check" :loading="savingNewPoste" @click="saveNewPoste" :disabled="!newPosteForm.name" />
            </template>
        </Dialog>
    </PageComponent>
</template>
