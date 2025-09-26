<script setup>
import PageComponent from '@/components/PageComponent.vue';
import ResponseComponent from '@/components/ResponseComponent.vue';
import { useHandleAsyncError } from '@/utils/handleAsyncError';
import { FilterMatchMode } from '@primevue/core/api';
import { onMounted, ref } from 'vue';
import DepartmentService from '../../service/DepartmentService';
import AddDepartment from './AddDepartment.vue';

const { handleAsyncError } = useHandleAsyncError();

const loading = ref(false);
const errorReq = ref();
const selectedDepart = ref();
const departsList = ref({});

const depart = ref({});
const departDialog = ref(false);

const filters = ref({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS }
});

// ajoute dans la liste
function addDepart(newDepart) {
    departsList.value.departments?.push(newDepart);
}
onMounted(async () => {
    const { result, error } = await handleAsyncError(
        () => DepartmentService.get(),
        (val) => (loading.value = val)
    );
    errorReq.value = error;
    departsList.value = result;
});
</script>

<template>
    <PageComponent :title-page="$t('liDepart')">
        <div>
            <Toolbar class="mb-6">
                <template #start>
                    <Button :label="$t('Add')" icon="pi pi-plus" severity="secondary" class="mr-2" @click="() => (departDialog = true)" />
                </template>
            </Toolbar>

            <DataTable ref="dt" selectionMode="single" :metaKeySelection="false" v-model:selection="selectedDepart" :value="departsList?.departments" dataKey="id" :filters="filters" :loading="loading">
                <template #header>
                    <div class="flex flex-wrap gap-2 items-center justify-between">
                        <h4 class="m-0">{{ $t('liListDepart') }}</h4>
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
                        <Message v-if="!loading && !errorReq" severity="info" icon="pi pi-info-circle">{{ $t('noDepart') }}</Message>
                    </div>
                </template>

                <Column field="name" :header="$t('colDepartNam')" sortable style="min-width: 12rem">
                    <template #body="slotProps" class="font-semibold">
                        <span class="font-bold uppercase">{{ slotProps.data.name }}</span>
                    </template>
                </Column>
                <Column field="manager" :header="$t('colDepartResp')" style="min-width: 16rem"></Column>
                <Column field="nbrMember" :header="$t('colDepartNbrMemb')" sortable style="min-width: 10rem">
                    <template #body="slotProps" class="font-semibold">
                        <p v-if="departsList?.showInfo || slotProps.data.nbrMember > 0">
                            {{ slotProps.data.nbrMember }}
                        </p>
                        <i v-else class="pi pi-eye-slash" v-tooltip="{ value: $t('liOnlyMembersCanView') }" style="font-size: 1.5rem"></i>
                    </template>
                </Column>
            </DataTable>
        </div>
    </PageComponent>

    <!-- Modal -->
    <Dialog v-model:visible="departDialog" :header="depart.value == null ? $t('liAjDepart') : $t('liMjDepart')" :modal="true" :style="{ width: '50rem' }" :breakpoints="{ '1199px': '75vw', '575px': '90vw' }">
        <AddDepartment @closeModal="() => (departDialog = false)" @new-depart="(newDepar) => addDepart(newDepar)" />
    </Dialog>
</template>
