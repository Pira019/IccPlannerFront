<script setup>
import PageComponent from '@/components/PageComponent.vue';
import ResponseComponent from '@/components/ResponseComponent.vue';
import { useHandleAsyncError } from '@/utils/handleAsyncError';
import { computed, onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import DepartmentService from '../../service/DepartmentService';
import AddDepartment from './AddDepartment.vue';

const { handleAsyncError } = useHandleAsyncError();
const { t } = useI18n();
const router = useRouter();

const loading = ref(false);
const errorReq = ref();
const selectedDepart = ref();
const departsList = ref({});

const menus = ref({});

const getItems = (rowData) => [
    {
        label: t('liDetail'),
        icon: 'pi pi-eye',
        command: () => {
            router.push({ name: 'department-details', params: { id: rowData.id } });
        }
    },
    {
        label: 'Delete',
        icon: 'pi pi-times',
        command: () => {
            console.log('dfdinio');
        }
    },
    {
        separator: true
    },
    {
        label: 'Quit',
        icon: 'pi pi-power-off',
        command: () => {
            window.location.href = 'https://vuejs.org/';
        }
    }
];

const pageSize = ref(10);
const totalRecords = ref(null);
const first = ref(0);

const depart = ref({});
const departDialog = ref(false);

const filters = ref({
    global: { value: '' }
});

// ajoute dans la liste
async function addDepart() {
    await getDept();
}

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
                <Column field="nbrMember" class="text-center" style="min-width: 12rem" :header="$t('colDepartNbrMemb')"></Column>
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
    <Dialog v-model:visible="departDialog" :header="depart.value == null ? $t('liAjDepart') : $t('liMjDepart')" :modal="true" :style="{ width: '50rem' }" :breakpoints="{ '1199px': '75vw', '575px': '90vw' }">
        <AddDepartment @closeModal="() => (departDialog = false)" @new-depart="(newDepar) => addDepart(newDepar)" />
    </Dialog>
</template>
