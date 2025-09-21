<script setup>
import PermissionService from '@/service/PermissionService';
import RoleService from '@/service/RoleService';
import { useHandleAsyncError } from '@/utils/handleAsyncError';
import { addRoleValidation } from '@/validations/Admin/addRoleValidation';
import { FilterMatchMode } from '@primevue/core/api';
import { useToast } from 'primevue/usetoast';
import { useForm } from 'vee-validate';
import { onMounted, ref } from 'vue';

const { handleAsyncError } = useHandleAsyncError();

onMounted(async () => {
    const { result, error } = await handleAsyncError(
        () => RoleService.getAll(),
        (val) => (loading.value = val)
    );
    errorReq.value = error;
    roles.value = result;
});

const toast = useToast();
const dt = ref();
const roles = ref();
const loading = ref(false);
const errorReq = ref();
const selectedRole = ref();
const role = ref({});
const permissionsList = ref([]);
const roleDialog = ref(false);
const roleForm = ref(null);

const loadingPermissions = ref(false);

const loadingSave = ref(false);
const errorMsgSave = ref(null);

const products = ref();
const deleteRoleDialog = ref(false);
const deleteProductsDialog = ref(false);
const product = ref({});
const selectedProducts = ref();
const filters = ref({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS }
});
const submitted = ref(false);

async function getPermissions() {
    const { result } = await handleAsyncError(
        () => PermissionService.getAll(),
        (val) => (loadingPermissions.value = val)
    );
    permissionsList.value = result;
}

async function openNew() {
    await getPermissions();
    role.value = {};
    errorMsgSave.value = null;
    resetForm();
    roleDialog.value = true;
}

function hideDialog() {
    resetForm();
    roleDialog.value = false;
}

async function createRole() {
    const { result, error } = await handleAsyncError(
        () => RoleService.create(role.value),
        (val) => (loadingSave.value = val),
        true
    );

    if (error?.message != null) {
        errorMsgSave.value = error.message;
        return;
    }

    role.value.id = result?.id;
    role.value.nbrUsers = 0;
    role.value.permissions = permissionsList.value.filter((p) => permissionIds.value.includes(p.id));
    roles.value.push(role.value);
    role.value = {};
    roleDialog.value = false;
}

function editRole(prod) {
    errorMsgSave.value = null;
    role.value = { ...prod };
    roleDialog.value = true;
}

function confirmDeleteRole(role) {
    role.value = role;
    deleteRoleDialog.value = true;
}

function deleteRole() {
    products.value = products.value.filter((val) => val.id !== product.value.id);
    deleteRoleDialog.value = false;
    product.value = {};
    toast.add({ severity: 'success', summary: 'Successful', detail: 'Product Deleted', life: 3000 });
}

function confirmDeleteSelected() {
    deleteProductsDialog.value = true;
}

function deleteSelectedProducts() {
    products.value = products.value.filter((val) => !selectedProducts.value.includes(val));
    deleteProductsDialog.value = false;
    selectedProducts.value = null;
    toast.add({ severity: 'success', summary: 'Successful', detail: 'Products Deleted', life: 3000 });
}

function submitForm() {
    // Déclenche la soumission du form
    roleForm.value?.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
}

const { errors, defineField, handleSubmit, resetForm } = useForm({
    validationSchema: addRoleValidation
});

const saveRole = handleSubmit.withControlled(async (values) => {
    role.value = values;
    if (role?.value.name?.trim()) {
        if (role.value?.id) {
        } else {
            createRole();
        }
    }
});

const [name] = defineField('name');
const [description] = defineField('description');
const [permissionIds] = defineField('permissionIds');
</script>

<template>
    <div>
        <div class="card">
            <Toolbar class="mb-6">
                <template #start>
                    <Button :label="$t('liAjtRole')" icon="pi pi-plus" severity="secondary" class="mr-2" @click="openNew" />
                </template>
            </Toolbar>

            <DataTable ref="dt" selectionMode="single" :metaKeySelection="false" v-model:selection="selectedRole" :value="roles" dataKey="id" :filters="filters" :loading="loading">
                <template #header>
                    <div class="flex flex-wrap gap-2 items-center justify-between">
                        <h4 class="m-0">{{ $t('liMagRole') }}</h4>
                        <IconField>
                            <InputIcon>
                                <i class="pi pi-search" />
                            </InputIcon>
                            <InputText v-model="filters['global'].value" :placeholder="$t('search')" />
                        </IconField>
                    </div>
                </template>

                <template #empty>
                    <div>
                        <Message v-if="errorReq" severity="error" icon="pi pi-times-circle">{{ errorReq.message }}</Message>
                        <Message v-else-if="!loading" severity="info" icon="pi pi-info-circle">{{ $t('liAucunRole') }}</Message>
                    </div>
                </template>

                <Column field="name" :header="$t('liRole')" sortable style="min-width: 12rem">
                    <template #body="slotProps" class="font-semibold">
                        <span class="font-bold uppercase">{{ slotProps.data.name }}</span>
                    </template>
                </Column>
                <Column field="description" :header="$t('liDesc')" style="min-width: 16rem"></Column>
                <Column field="nbrUsers" :header="$t('liNbrUti')" sortable style="min-width: 10rem">
                    <template #body="slotProps" class="font-semibold">
                        <span class="font-semibold">{{ slotProps.data.nbrUsers }}</span>
                    </template>
                </Column>
                <Column field="permissions" :header="$t('liPerm')" sortable style="min-width: 10rem">
                    <template #body="slotProps" class="font-semibold">
                        <p v-for="(item, index) in slotProps.data.permissions" :key="index">({{ item?.name }}) {{ item?.description }}</p>
                    </template>
                </Column>
                <Column :exportable="false" style="min-width: 12rem">
                    <template #body="slotProps">
                        <Button icon="pi pi-pencil" outlined rounded class="mr-2" @click="editRole(slotProps.data)" />
                        <Button icon="pi pi-trash" v-if="slotProps.data.name != 'Admin'" outlined rounded severity="danger" @click="confirmDeleteRole(slotProps.data)" />
                    </template>
                </Column>
            </DataTable>
        </div>

        <Dialog v-model:visible="roleDialog" :style="{ width: '450px' }" :header="role.value == null ? $t('liAjtRole') : $t('liModifRole')" :modal="true">
            <form ref="roleForm" @submit.prevent="saveRole">
                <div class="flex flex-col gap-6">
                    <div class="mt-2" v-if="errorMsgSave">
                        <Message severity="error">{{ errorMsgSave }}</Message>
                    </div>
                    <div>
                        <label for="name" class="block font-bold mb-3" :class="{ 'text-red-500': errors.name }">{{ $t('Name') }}</label>
                        <InputText id="name" v-model.trim="name" required="true" autofocus :invalid="!!errors.name" fluid />
                        <Message size="small" severity="error" variant="simple" class="mb-6" v-if="errors.name"> {{ errors.name }}</Message>
                    </div>
                    <div>
                        <label for="description" class="block font-bold mb-3" :class="{ 'text-red-500': errors.name }">{{ $t('liDesc') }}</label>
                        <Textarea id="description" v-model="description" :invalid="!!errors.description" required="true" rows="3" cols="20" fluid />
                        <Message size="small" severity="error" variant="simple" class="mb-6" v-if="errors.description"> {{ errors.description }}</Message>
                    </div>

                    <div v-if="permissionsList?.length > 0 && !loadingPermissions">
                        <span class="block font-bold mb-4">{{ $t('liPermission') }}</span>
                        <div class="grid grid-cols-12 gap-4">
                            <div class="flex items-center gap-2 col-span-6" v-for="permission in permissionsList" :key="permission?.id || `perm-${index}`">
                                <Checkbox :inputId="'permission-' + permission.id" v-model="permissionIds" name="permission" :value="permission.id" />
                                <label :for="'permission-' + permission.id">{{ permission?.name }} <i class="pi pi-info-circle px-2" title="'Enter your username'"></i></label>
                            </div>
                        </div>
                    </div>
                    <ProgressSpinner v-if="loadingPermissions" />
                </div>
            </form>
            <template #footer>
                <Button :label="t('Cancel')" icon="pi pi-times" text @click="hideDialog" />
                <Button :label="t('Add')" icon="pi pi-check" type="submit" @click="submitForm" :loading="loadingSave" />
            </template>
        </Dialog>

        <Dialog v-model:visible="deleteRoleDialog" :style="{ width: '450px' }" header="Confirm" :modal="true">
            <div class="flex items-center gap-4">
                <i class="pi pi-exclamation-triangle !text-3xl" />
                <span v-if="product"
                    >Are you sure you want to delete <b>{{ product.name }}</b
                    >?</span
                >
            </div>
            <template #footer>
                <Button label="No" icon="pi pi-times" text @click="deleteRoleDialog = false" />
                <Button label="Yes" icon="pi pi-check" @click="deleteRole" />
            </template>
        </Dialog>

        <Dialog v-model:visible="deleteProductsDialog" :style="{ width: '450px' }" header="Confirm" :modal="true">
            <div class="flex items-center gap-4">
                <i class="pi pi-exclamation-triangle !text-3xl" />
                <span v-if="product">Are you sure you want to delete the selected products?</span>
            </div>
            <template #footer>
                <Button label="No" icon="pi pi-times" text @click="deleteProductsDialog = false" />
                <Button label="Yes" icon="pi pi-check" text @click="deleteSelectedProducts" />
            </template>
        </Dialog>
    </div>
</template>
