<script setup>
import PageComponent from '@/components/PageComponent.vue';
import ResponseComponent from '@/components/ResponseComponent.vue';
import { Permission } from '@/model/Enum/Permission';
import { useHandleAsyncError } from '@/utils/handleAsyncError';
import { hasPermission } from '@/utils/hasPermission';
import { useConfirmDialog } from '@/utils/useConfirmDialog';
import { computed, onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import DepartmentService from '../../service/DepartmentService';
import SendInviation from '../membre/invitation/SendInviation.vue';
import AddDepartment from './AddDepartment.vue';

const canCreateDepartment = computed(() => hasPermission(Permission.CAN_MANAG_DEPART));

const { handleAsyncError } = useHandleAsyncError();
const { t } = useI18n();
const router = useRouter();

const { showConfirm } = useConfirmDialog();

const dt = ref(null);

const errorReq = ref();
const loading = ref(false);

const departDialog = ref(false);
const loadingDel = ref(false);
const showDeleteLoadingDiag = ref(false);

const menus = ref({});

const selectedDepart = ref();
const departsList = ref({});

const showSendInvitEdit = ref(false);

var deptEdtId = ref(null);

// menu
const canManageDepartment = computed(() => hasPermission(Permission.DEPART_MANAGER));

const getItems = (rowData) => {
    const items = [
        {
            label: t('liDetail'),
            icon: 'pi pi-eye',
            command: () => {
                router.push({ name: 'department-details', params: { id: rowData.id } });
            }
        }
    ];

    if (canManageDepartment.value) {
        items.push({
            label: t('liSendInv'),
            icon: 'pi pi-user-plus',
            command: () => {
                deptEdtId.value = rowData.id;
                showSendInvitEdit.value = true;
            }
        });
    }

    if (canCreateDepartment.value || canManageDepartment.value) {
        items.push({ separator: true });
        items.push({
            label: t('btnUpdate'),
            icon: 'pi pi-pencil',
            command: () => {
                deptEdtId.value = rowData.id;
                departDialog.value = true;
            }
        });
    }

    if (canCreateDepartment.value) {
        items.push({
            label: t('btnDel'),
            icon: 'pi pi-trash',
            command: () => {
                showConfirm({
                    group: 'deleteDialog',
                    message: 'liMsgDel',
                    header: 'liDeptDel',
                    acceptLabel: 'btnDel',
                    acceptSeverity: 'danger',
                    onAccept: () => deleteById(rowData.id)
                });
            }
        });
    }

    return items;
};

const pageSize = ref(10);
const totalRecords = ref(null);
const first = ref(0);

const dialogVisible = computed({
    get() {
        return departDialog.value || showDeleteLoadingDiag.value || showSendInvitEdit.value;
    },
    set(val) {
        // fermer le dialog → on reset les deux flags si nécessaire
        if (!val) {
            departDialog.value = false;
            showDeleteLoadingDiag.value = false;
            showSendInvitEdit.value = false;
        }
    }
});

const dialogHeader = computed(() => {
  if (showDeleteLoadingDiag.value) return null

  if (showSendInvitEdit.value) {
    return t('liSendInv')
  }

  if (!deptEdtId.value) {
    return t('liAjDepart')
  }

  return t('liMjDepart')
})

const filters = ref({
    global: { value: '' }
});

/**
 * Supprimer le department.
 * @param id
 */
async function deleteById(id) {
    showDeleteLoadingDiag.value = true;
    const { error } = await handleAsyncError(
        () => DepartmentService.deleteById(id),
        (val) => (loadingDel.value = val),
        true
    );

    if (error) {
        errorDelete.value = error;
        return;
    }
    // Actualise
    // 2. Mettre à jour le total
    const newTotal = totalRecords.value - 1;

    // Si la liste devient vide
    if (newTotal === 0) {
        first.value = 0;
        totalRecords.value = 0;
        filteredDepartments.value = [];
        return;
    }

    // Calculer la page actuelle (1-based)
    const currentPage = Math.floor(first.value / pageSize.value) + 1;

    // Calculer le nombre total de pages après suppression
    const totalPages = Math.ceil(newTotal / pageSize.value);

    /// Si la page actuelle n'existe plus, aller à la dernière page
    let pageToLoad = currentPage;
    if (currentPage > totalPages) {
        pageToLoad = totalPages;
        first.value = (totalPages - 1) * pageSize.value;
    }

    // Mettre à jour le total et recharger
    totalRecords.value = newTotal;
    await getDept(pageToLoad, pageSize.value);
    // Votre fonction de chargement
    showDeleteLoadingDiag.value = false;
}

// Liste des départements.
async function addDepart() {
    await getDept();
}

// ouvre le modal
function onAddDepartment() {
    deptEdtId.value = null;
    departDialog.value = true;
}

// pagination
const onPage = async (event) => {
    first.value = event.first;
    pageSize.value = event.rows;

    const page = event.page + 1;

    await getDept(page, pageSize.value);
};

onMounted(async () => {
    await getDept();
});

async function getDept(pageNumber = 1, pageSize = 10) {
    const { result, error } = await handleAsyncError(
        () => DepartmentService.get(pageNumber, pageSize),
        (val) => (loading.value = val)
    );
    errorReq.value = error;

    if (error) {
        return;
    }
    departsList.value = result;
    totalRecords.value = result.totalCount;
}

const filteredDepartments = computed(() => {
    const value = filters.value.global.value?.toLowerCase();
    if (!value) return departsList.value.departments;

    return departsList.value.departments.filter((d) => d.name.toLowerCase().includes(value) || d.shortName.toLowerCase().includes(value));
});

const toggle = (event, id) => {
    if (menus.value[id]) {
        menus.value[id].toggle(event);
    }
};
</script>

<template>
    <PageComponent :title-page="$t('liDepart')" @btn-add="onAddDepartment()"
        :showAddBtn="canCreateDepartment"
        :breadcrumbs="[{ label: $t('liDepart') }]">
        <div>
            <DataTable
                :onPage="onPage"
                :ref="dt"
                paginator
                :first="first"
                :rows="pageSize"
                :totalRecords="totalRecords"
                :rowsPerPageOptions="[10, 20, 50]"
                selectionMode="single"
                :metaKeySelection="false"
                v-model:selection="selectedDepart"
                :value="filteredDepartments"
                dataKey="id"
                :filters="filters"
                :loading="loading"
                lazy
            >
                <template #header>
                    <div class="flex justify-end">
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
                        <ResponseComponent show-success-message="false" :error="errorReq" />
                        <EmptyStateComponent
                            v-if="!loading && !errorReq"
                            icon="pi pi-sitemap"
                            title="empty.departments"
                            description="empty.departmentsDesc"
                            action-label="Add"
                            @action="onAddDepartment"
                        />
                    </div>
                </template>

                <Column field="name" :header="$t('colDepartNam')" style="min-width: 12rem">
                    <template #body="slotProps">
                        <span class="font-bold uppercase cursor-pointer text-primary hover:underline" @click="router.push({ name: 'department-details', params: { id: slotProps.data.id } })">{{ slotProps.data.name }}</span>
                        <Tag severity="Primary" class="uppercase mx-2"> {{ slotProps.data.shortName }} </Tag>
                    </template>
                </Column>
                <Column field="nbrMember" class="text-center" style="min-width: 12rem" :header="$t('colDepartNbrMemb')">
                    <template #body="slotProps">
                        <span class="cursor-pointer text-primary hover:underline" @click="router.push({ path: '/members', query: { departmentId: slotProps.data.id } })">{{ slotProps.data.nbrMember }}</span>
                    </template>
                </Column>
                <Column field="nbrProgram" :header="$t('colNbrPrg')"></Column>
                <Column style="min-width: 1rem">
                    <template #body="slotProps">
                        <div>
                            <Button type="button" icon="pi pi-ellipsis-h" @click="toggle($event, slotProps.data.id)" aria-haspopup="true" :aria-controls="'overlay_menu_' + slotProps.data.id" />
                            <Menu :ref="(el) => (menus[slotProps.data.id] = el)" :id="'overlay_menu_' + slotProps.data.id" :model="getItems(slotProps.data)" :popup="true" />
                        </div>
                    </template>
                </Column>
            </DataTable>
        </div>
    </PageComponent>

    <!-- Modal -->
    <Dialog v-model:visible="dialogVisible" :header="dialogHeader" :modal="true" :style="{ width: '50rem' }" :breakpoints="{ '1199px': '75vw', '575px': '90vw' }">
        <AddDepartment @closeModal="() => (departDialog = false)" :id-dept="deptEdtId" @new-depart="(newDepar) => addDepart(newDepar)" @update-depart="() => getDept()" v-if="departDialog" />
        <LoadingDialogComponent :onLoading="loadingDel" :errorReq="errorReq" @closeModal="() => (showDeleteLoadingDiag = false)" v-if="showDeleteLoadingDiag" />
        <SendInviation v-if="showSendInvitEdit" :id-dept="deptEdtId" @closeDialog="() => (showSendInvitEdit = false)"/>
    </Dialog>
</template>
