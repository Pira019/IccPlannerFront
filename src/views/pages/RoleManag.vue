<script setup>
import PageComponent from '@/components/PageComponent.vue';
import { Role } from '@/model/Enum/Role';
import PermissionService from '@/service/PermissionService';
import RoleService from '@/service/RoleService';
import { useAuthStore } from '@/store/Auth';
import { useHandleAsyncError } from '@/utils/handleAsyncError';
import { addRoleValidation } from '@/validations/Admin/addRoleValidation';
import { FilterMatchMode } from '@primevue/core/api';
import { useToast } from 'primevue/usetoast';
import { useForm } from 'vee-validate';
import { computed, onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const { handleAsyncError } = useHandleAsyncError();
const toast = useToast();
const auth = useAuthStore();

const isAdmin = computed(() => auth.claims?.roles?.includes(Role.Admin));

// Roles
const roles = ref([]);
const loading = ref(false);
const errorReq = ref();
const role = ref({});
const permissionsList = ref([]);
const roleDialog = ref(false);
const roleForm = ref(null);
const loadingPermissions = ref(false);
const loadingSave = ref(false);
const errorMsgSave = ref(null);
const filters = ref({ global: { value: null, matchMode: FilterMatchMode.CONTAINS } });

// Users
const users = ref([]);
const loadingUsers = ref(false);
const userFilters = ref({ global: { value: null, matchMode: FilterMatchMode.CONTAINS } });
const assignDialog = ref(false);
const selectedUser = ref(null);
const selectedRoleName = ref(null);
const loadingAssign = ref(false);

onMounted(async () => {
    const { result, error } = await handleAsyncError(() => RoleService.getAll(), (val) => (loading.value = val));
    errorReq.value = error;
    roles.value = result || [];
});

async function loadUsers() {
    if (users.value.length > 0) { return; }
    const { result } = await handleAsyncError(() => RoleService.getUsersWithRoles(), (val) => (loadingUsers.value = val));
    users.value = result || [];
}

async function getPermissions() {
    const { result } = await handleAsyncError(() => PermissionService.getAll(), (val) => (loadingPermissions.value = val));
    permissionsList.value = result;
}

async function openNew() {
    await getPermissions();
    role.value = {};
    errorMsgSave.value = null;
    resetForm();
    roleDialog.value = true;
}

function hideDialog() { resetForm(); roleDialog.value = false; }

async function createRole() {
    const { result, error } = await handleAsyncError(() => RoleService.create(role.value), (val) => (loadingSave.value = val), true);
    if (error?.message != null) { errorMsgSave.value = error.message; return; }
    role.value.id = result?.id;
    role.value.nbrUsers = 0;
    role.value.permissions = permissionsList.value.filter((p) => permissionIds.value.includes(p.id));
    roles.value.push(role.value);
    role.value = {};
    roleDialog.value = false;
}

function editRole(prod) { errorMsgSave.value = null; role.value = { ...prod }; roleDialog.value = true; }

function submitForm() { roleForm.value?.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true })); }

const { errors, defineField, handleSubmit, resetForm } = useForm({ validationSchema: addRoleValidation });
const saveRole = handleSubmit(async (values) => {
    role.value = values;
    if (role?.value.name?.trim()) { if (!role.value?.id) { createRole(); } }
});
const [name] = defineField('name');
const [description] = defineField('description');
const [permissionIds] = defineField('permissionIds');

// Assign/Unassign
function openAssignDialog(user) { selectedUser.value = user; selectedRoleName.value = null; assignDialog.value = true; }

async function assignRole() {
    if (!selectedRoleName.value) { return; }
    const { error } = await handleAsyncError(
        () => RoleService.assignRole(selectedUser.value.userId, selectedRoleName.value),
        (val) => (loadingAssign.value = val), true, 'roles.assigned'
    );
    if (!error) { selectedUser.value.roles.push(selectedRoleName.value); assignDialog.value = false; }
}

async function unassignRole(user, roleName) {
    const { error } = await handleAsyncError(
        () => RoleService.unassignRole(user.userId, roleName), null, true, 'roles.unassigned'
    );
    if (!error) { user.roles = user.roles.filter(r => r !== roleName); }
}
</script>

<template>
    <PageComponent :title-page="$t('liMagRole')" :show-add-btn="false">
        <Tabs value="roles">
            <TabList>
                <Tab value="roles"><i class="pi pi-shield mr-2"></i>{{ $t('roles.tabRoles') }}</Tab>
                <Tab v-if="isAdmin" value="users" @click="loadUsers"><i class="pi pi-users mr-2"></i>{{ $t('roles.tabUsers') }}</Tab>
            </TabList>

            <TabPanels>
                <!-- Tab Rôles -->
                <TabPanel value="roles">
                    <Toolbar class="mb-4 mt-2">
                        <template #start>
                            <Button :label="$t('liAjtRole')" icon="pi pi-plus" severity="secondary" size="small" @click="openNew" />
                        </template>
                    </Toolbar>

                    <DataTable :value="roles" dataKey="id" :filters="filters" :loading="loading">
                        <template #header>
                            <div class="flex flex-wrap gap-2 items-center justify-between">
                                <h4 class="m-0">{{ $t('liMagRole') }}</h4>
                                <IconField>
                                    <InputIcon><i class="pi pi-search" /></InputIcon>
                                    <InputText v-model="filters['global'].value" :placeholder="$t('search')" />
                                </IconField>
                            </div>
                        </template>
                        <template #empty>
                            <Message v-if="errorReq" severity="error">{{ errorReq.message }}</Message>
                            <Message v-else-if="!loading" severity="info">{{ $t('liAucunRole') }}</Message>
                        </template>
                        <Column field="name" :header="$t('liRole')" sortable style="min-width: 10rem">
                            <template #body="{ data }"><span class="font-bold uppercase">{{ data.name }}</span></template>
                        </Column>
                        <Column field="description" :header="$t('liDesc')" style="min-width: 14rem"></Column>
                        <Column field="nbrUsers" :header="$t('liNbrUti')" sortable style="width: 8rem">
                            <template #body="{ data }"><span class="font-semibold">{{ data.nbrUsers }}</span></template>
                        </Column>
                        <Column field="permissions" :header="$t('liPerm')">
                            <template #body="{ data }">
                                <div class="flex flex-wrap gap-1">
                                    <Tag v-for="p in data.permissions" :key="p.id" :value="p.name" severity="info" class="text-[0.65rem]" />
                                </div>
                            </template>
                        </Column>
                        <Column :exportable="false" style="width: 8rem">
                            <template #body="{ data }">
                                <Button icon="pi pi-pencil" outlined rounded size="small" class="mr-2" @click="editRole(data)" />
                            </template>
                        </Column>
                    </DataTable>
                </TabPanel>

                <!-- Tab Utilisateurs (Admin seulement) -->
                <TabPanel v-if="isAdmin" value="users">
                    <div v-if="loadingUsers" class="flex justify-center py-8"><ProgressSpinner /></div>
                    <template v-else>
                        <DataTable :value="users" dataKey="userId" :filters="userFilters" class="mt-2">
                            <template #header>
                                <div class="flex flex-wrap gap-2 items-center justify-between">
                                    <h4 class="m-0">{{ $t('roles.usersTitle') }}</h4>
                                    <IconField>
                                        <InputIcon><i class="pi pi-search" /></InputIcon>
                                        <InputText v-model="userFilters['global'].value" :placeholder="$t('search')" />
                                    </IconField>
                                </div>
                            </template>
                            <template #empty><Message severity="info">{{ $t('liNoMembers') }}</Message></template>
                            <Column field="displayName" :header="$t('Name')" sortable>
                                <template #body="{ data }">
                                    <div>
                                        <div class="font-medium">{{ data.displayName }}</div>
                                        <div class="text-xs text-muted-color">{{ data.email }}</div>
                                    </div>
                                </template>
                            </Column>
                            <Column :header="$t('liRole')">
                                <template #body="{ data }">
                                    <div class="flex flex-wrap gap-1">
                                        <Tag v-for="r in data.roles" :key="r" severity="success" rounded class="text-[0.65rem]">
                                            {{ r }}
                                            <i class="pi pi-times ml-1 cursor-pointer text-[0.5rem]" @click="unassignRole(data, r)"></i>
                                        </Tag>
                                        <span v-if="data.roles.length === 0" class="text-xs text-muted-color">{{ $t('roles.noRole') }}</span>
                                    </div>
                                </template>
                            </Column>
                            <Column style="width: 5rem">
                                <template #body="{ data }">
                                    <Button icon="pi pi-plus" size="small" rounded outlined @click="openAssignDialog(data)" v-tooltip="$t('roles.assign')" />
                                </template>
                            </Column>
                        </DataTable>
                    </template>
                </TabPanel>
            </TabPanels>
        </Tabs>

        <!-- Dialog créer rôle -->
        <Dialog v-model:visible="roleDialog" :style="{ width: '450px' }" :header="role.id ? $t('liModifRole') : $t('liAjtRole')" :modal="true">
            <form ref="roleForm" @submit.prevent="saveRole">
                <div class="flex flex-col gap-6">
                    <div class="mt-2" v-if="errorMsgSave"><Message severity="error">{{ errorMsgSave }}</Message></div>
                    <div>
                        <label for="name" class="block font-bold mb-3" :class="{ 'text-red-500': errors.name }">{{ $t('Name') }}</label>
                        <InputText id="name" v-model.trim="name" autofocus :invalid="!!errors.name" fluid />
                        <Message size="small" severity="error" variant="simple" v-if="errors.name">{{ errors.name }}</Message>
                    </div>
                    <div>
                        <label for="description" class="block font-bold mb-3">{{ $t('liDesc') }}</label>
                        <Textarea id="description" v-model="description" :invalid="!!errors.description" rows="3" fluid />
                        <Message size="small" severity="error" variant="simple" v-if="errors.description">{{ errors.description }}</Message>
                    </div>
                    <div v-if="permissionsList?.length > 0 && !loadingPermissions">
                        <span class="block font-bold mb-4">{{ $t('liPermission') }}</span>
                        <div class="grid grid-cols-12 gap-4">
                            <div class="flex items-center gap-2 col-span-6" v-for="permission in permissionsList" :key="permission.id">
                                <Checkbox :inputId="'permission-' + permission.id" v-model="permissionIds" name="permission" :value="permission.id" />
                                <label :for="'permission-' + permission.id">{{ permission?.name }}</label>
                            </div>
                        </div>
                    </div>
                    <ProgressSpinner v-if="loadingPermissions" />
                </div>
            </form>
            <template #footer>
                <Button :label="$t('Cancel')" icon="pi pi-times" text @click="hideDialog" />
                <Button :label="$t('Add')" icon="pi pi-check" @click="submitForm" :loading="loadingSave" />
            </template>
        </Dialog>

        <!-- Dialog assigner rôle -->
        <Dialog v-model:visible="assignDialog" :style="{ width: '400px' }" :header="$t('roles.assignTitle')" :modal="true">
            <div class="flex flex-col gap-4">
                <p class="text-sm">{{ selectedUser?.displayName }} — {{ selectedUser?.email }}</p>
                <Select v-model="selectedRoleName" :options="roles" optionLabel="name" optionValue="name" :placeholder="$t('roles.selectRole')" fluid />
            </div>
            <template #footer>
                <Button :label="$t('Cancel')" icon="pi pi-times" text @click="assignDialog = false" />
                <Button :label="$t('roles.assign')" icon="pi pi-check" :loading="loadingAssign" :disabled="!selectedRoleName" @click="assignRole" />
            </template>
        </Dialog>
    </PageComponent>
</template>
