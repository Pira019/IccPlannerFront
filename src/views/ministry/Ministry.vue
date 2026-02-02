<script setup>
import LoadingDialogComponent from '@/components/LoadingDialogComponent.vue';
import MinistryService from '@/service/MinistryService';
import { useHandleAsyncError } from '@/utils/handleAsyncError';
import { useConfirmDialog } from '@/utils/useConfirmDialog';
import { FilterMatchMode } from '@primevue/core/api';
import { computed, onMounted, ref } from 'vue';
import Add from './Add.vue';

const { showConfirm } = useConfirmDialog();

const displayAddMinistry = ref(false);
const { handleAsyncError } = useHandleAsyncError();

const loading = ref(false);

const errorDelete = ref();
const loadingDelete = ref(false);
const showDeleteLoadingDiag = ref(false);

const modalTitle = ref('AddMinistry');
const errorReq = ref();
const selectedMinistry = ref(null);
const ministryList = ref([]);

const filters = ref({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS }
});

//
function openAdd(payload) {
    modalTitle.value = payload?.id ? 'EditMinistry' : 'AddMinistry';

    selectedMinistry.value = payload;
    displayAddMinistry.value = true;
}

function deletedMinistry(idMinistry) {
    showConfirmDialog('deleteDialog', 'liMsgDel', 'lblDeleteMinistry', 'btnDel', () => confirmDelete(idMinistry), 'danger');
}

function showConfirmDialog(group, message, header, acceptLabel, onAccept, acceptSeverity = null) {
    showConfirm({
        group: group,
        message: message,
        header: header,
        acceptLabel: acceptLabel,
        acceptSeverity: acceptSeverity,
        onAccept: onAccept
    });
}
async function confirmDelete(idMinistry, isConfirmed = false) {
    showDeleteLoadingDiag.value = true;

    const { error } = await handleAsyncError(
        () => MinistryService.delete(idMinistry, isConfirmed),
        (val) => (loadingDelete.value = val),
        true
    );

    if (error?.IsWarning && !isConfirmed) {
        showDeleteLoadingDiag.value = false;
        showConfirmDialog('confirmDialog', error.message, 'Confirmation', 'btnDel', () => confirmDelete(idMinistry, true));
    }

    if (error) {
        errorDelete.value = error;
        return;
    }
    closeDeleteDialogWithDelay();
    const index = ministryList.value.findIndex((m) => m.id === idMinistry);
    if (index !== -1) {
        ministryList.value.splice(index, 1);
    }
}

const dialogVisible = computed({
    get() {
        return displayAddMinistry.value || showDeleteLoadingDiag.value;
    },
    set(val) {
        // fermer le dialog → on reset les deux flags si nécessaire
        if (!val) {
            displayAddMinistry.value = false;
            showDeleteLoadingDiag.value = false;
        }
    }
});

function close() {
    displayAddMinistry.value = false;
}

function updatedMin(updatedMinistry) {
    const index = ministryList.value.findIndex((m) => m.id === updatedMinistry?.id);
    if (index !== -1) {
        ministryList.value[index] = updatedMinistry;
    }
}

function addedMinistry(newMinistry) {
    ministryList.value.push(newMinistry);

    ministryList.value.sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }));
}

function closeDeleteDialogWithDelay(delay = 1000) {
    loadingDelete.value = true;
    setTimeout(() => {
        loadingDelete.value = false;
        showDeleteLoadingDiag.value = false;
    }, delay);
}

onMounted(async () => {
    const { result, error } = await handleAsyncError(
        () => MinistryService.getMinistries(),
        (val) => (loading.value = val)
    );
    errorReq.value = error;
    ministryList.value = result;
});
</script>

<template>
    <PageComponent :title-page="$t('Ministries')" @btn-add="openAdd">
        <div>
            <DataTable ref="dt" dataKey="id" selectionMode="single" :metaKeySelection="false" :value="ministryList" tableStyle="min-width: 50rem" stripedRows :filters="filters" :loading="loading">
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
                    <div id="msg">
                        <ResponseComponent show-success-message="false" :error="errorReq" />
                        <Message v-if="!loading && !errorReq" severity="info" icon="pi pi-info-circle">{{ $t('liNoElement') }}</Message>
                    </div>
                </template>

                <Column field="name" :header="$t('colName')" sortable style="width: 25%" headerClass="header-name"></Column>
                <Column field="description" :header="$t('colDesc')" style="width: 80%"></Column>
                <Column style="min-width: 10rem">
                    <template #body="slotProps">
                        <ButtonGroup>
                            <Button icon="pi pi-pencil" variant="outlined" @click="openAdd(slotProps.data)" />
                            <Button icon="pi pi-trash" variant="outlined" severity="danger" @click="deletedMinistry(slotProps.data.id)" />
                        </ButtonGroup>
                    </template>
                </Column>
            </DataTable>
        </div>

        <Dialog :header="showDeleteLoadingDiag ? null : $t(modalTitle)" :breakpoints="{ '960px': '75vw' }" :style="{ width: '30vw' }" v-model:visible="dialogVisible" :modal="true">
            <Add @closeModal="close" :selected-ministry="selectedMinistry" @updatedMin="updatedMin" @addedMinistry="addedMinistry" v-if="displayAddMinistry" />
            <LoadingDialogComponent :onLoading="loadingDelete" :errorReq="errorDelete" @closeModal="() => (showDeleteLoadingDiag = false)" v-if="showDeleteLoadingDiag" />
        </Dialog>
    </PageComponent>
</template>
