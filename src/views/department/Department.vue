<script setup>
import PageComponent from '@/components/PageComponent.vue';
import ResponseComponent from '@/components/ResponseComponent.vue';
import { useHandleAsyncError } from '@/utils/handleAsyncError';
import { computed, onMounted, ref } from 'vue';
import DepartmentService from '../../service/DepartmentService';
import AddDepartment from './AddDepartment.vue';

const { handleAsyncError } = useHandleAsyncError();

const loading = ref(false);
const errorReq = ref();
const selectedDepart = ref();
const departsList = ref({});

const pageSize = ref(10);
const totalRecords = ref(null);
const first = ref(0);

const depart = ref({});
const departDialog = ref(false);

const filters = ref({
    global: { value: '' }
});

// ajoute dans la liste
function addDepart(newDepart) {
    departsList.value.departments?.push(newDepart);
}

const onPage = (event) => {
    first.value = event.first;
    pageSize.value = event.rows;

    const page = event.page + 1;

    getDept(page, pageSize.value);
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
</script>

<template>
    <PageComponent :title-page="$t('liDepart')" @btn-add="() => (departDialog = true)">
        <div>
            <DataTable
                :onPage="onPage"
                ref="dt"
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
                        <Message v-if="!loading && !errorReq" severity="info" icon="pi pi-info-circle">{{ $t('noDepart') }}</Message>
                    </div>
                </template>

                <Column field="name" :header="$t('colDepartNam')" style="min-width: 12rem">
                    <template #body="slotProps" class="font-semibold">
                        <span class="font-bold uppercase">{{ slotProps.data.name }}</span>
                        <Tag severity="Primary" class="uppercase mx-2"> {{ slotProps.data.shortName }} </Tag>
                    </template>
                </Column>
                <Column field="nbrMember" :header="$t('colDepartNbrMemb')"></Column>
                <Column field="nbrProgram" :header="$t('colNbrPrg')"></Column>
            </DataTable>
        </div>
    </PageComponent>

    <!-- Modal -->
    <Dialog v-model:visible="departDialog" :header="depart.value == null ? $t('liAjDepart') : $t('liMjDepart')" :modal="true" :style="{ width: '50rem' }" :breakpoints="{ '1199px': '75vw', '575px': '90vw' }">
        <AddDepartment @closeModal="() => (departDialog = false)" @new-depart="(newDepar) => addDepart(newDepar)" />
    </Dialog>
</template>
