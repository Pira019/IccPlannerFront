<template>
    <PageComponent :title-page="$t('Members')" :show-add-btn="false">
        <DataTable ref="dt" dataKey="idDepartMember" selectionMode="single"
        :metaKeySelection="false" :value="membersLst"
        scrollable scrollHeight="flex" class="w-full"
        :filters="filters"
        stripedRows :loading="membersLoading">
            <template #header>
                <div class="flex flex-col md:flex-row gap-3 md:justify-between md:items-center">
                    <Select v-model="departmentSelected" :options="departmentLst"
                         optionValue="id" :loading="departLoading" filter optionLabel="name"
                         :placeholder="$t('liSelectDepart')"
                         class="w-full md:w-64 bg-white border border-gray-300 rounded-lg shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 transition">
                        <template #option="slotProps">
                            <div class="flex items-center">
                                <div>{{ slotProps.option.name }}</div>
                            </div>
                        </template>
                    </Select>
                        <IconField class="w-full md:w-64">
                            <InputIcon>
                                <i class="pi pi-search" />
                            </InputIcon>
                            <InputText :placeholder="$t('search')" v-model="filters['global'].value"/>
                        </IconField>
                    </div>
                </template>
                 <template #empty>
                    <div>
                        <ResponseComponent show-success-message="false" :error="errorReq" />
                        <Message v-if="!membersLoading && !errorReq" severity="info" icon="pi pi-info-circle">
                            {{ $t('liNoMembers') }}</Message>
                    </div>
                </template>
                <Column field="name" :header="'#'">
                    <template #body="slotProps">
                        <div>
                        {{ slotProps.index +1 }}
                        </div>
                </template>
                </Column>
                <Column field="name" :header="$t('colName')" sortable>
                    <template #body="slotProps">
                        <span class="font-bold uppercase">{{ slotProps.data.name }}</span>
                    </template>
                </Column>
                <Column :header="$t('liDisplayName')">
                    <template #body="slotProps">
                       <div class="px-5">{{ slotProps.data.nickName }}</div>
                     </template>
                </Column>
                <Column field="sex" :header="$t('liSex')">
                <template #body="slotProps">
                       <div class="px-5">{{ slotProps.data.sex }}</div>
                     </template>
                </Column>
                <Column :header="$t('colFonction')"  class="px-5">
                      <template #body="slotProps">
                        <ul class="px-5">
                            <li v-for="(post, index) in slotProps.data.postes" :key="index">
                                <span class="semi-bold">{{ post }}</span>
                            </li>
                        </ul>
                    </template>
                </Column>
                <Column field="status" :header="$t('colStat')">
                      <template #body="slotProps">
                        <Tag severity="Primary" class="uppercase mx-5"> {{ slotProps.data.status }} </Tag>
                    </template>
                </Column>
        </DataTable>
    </PageComponent>
</template>

<script setup>
import PageComponent from '@/components/PageComponent.vue';
import DepartmentService from '@/service/DepartmentService';
import MemberService from '@/service/MemberService';
import { useHandleAsyncError } from '@/utils/handleAsyncError';
import { FilterMatchMode } from '@primevue/core/api';
import { onMounted, ref, watch } from 'vue';

const { handleAsyncError } = useHandleAsyncError();

const departmentLst  = ref([]);
const membersLst  = ref([]);

const departmentSelected = ref(null);

const departLoading = ref(false)
const membersLoading = ref(false)

const errorReq =  ref(null);

const filters = ref({
    global: { value: null, matchMode: FilterMatchMode .CONTAINS }
});


onMounted(async () => {
    const { error, result } = await handleAsyncError(
        () => DepartmentService.get(),
        (val) => (departLoading.value = val)
    );

    if(!error)
    {
        departmentLst.value = result.departments;

         // Sélection automatique du premier
        if (departmentLst.value.length > 0) {
            departmentSelected.value = departmentLst.value[0].id;
        }
    }
});

watch(departmentSelected, async (newVal) => {
    if (!newVal) {
        membersLst.value = [];
        return;
    }

    const { error, result } = await handleAsyncError(
        () => MemberService.GetByDepartmentIdAsync(newVal),
        (val) => (membersLoading.value = val)
    );

    if (!error) {
        membersLst.value = result.members;
        return
    }
    errorReq.value = error


});
</script>

