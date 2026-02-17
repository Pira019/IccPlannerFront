
<template>
  <div class="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm mb-10 space-y-6">

    <div class="flex flex-col sm:flex-row gap-6">
        <!-- Barre de recherche -->
        <div class="flex-1 w-full">
            <div class="flex w-full gap-1">
            <div class="relative flex-grow w-full">
                <i class="pi pi-search absolute left-2 top-1/2 -translate-y-1/2 text-slate-400" aria-hidden="true"></i>
                <input
                v-model="filterCriteria.searchQuery"
                type="text"
                placeholder="Rechercher un programme..."
                class="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                />
            </div>
            </div>
        </div>

        <div class="flex flex-col gap-1">
            <SelectButton
            v-model="filterCriteria.filterType"
            :options="options"
            :optionLabel="option => $t(option.label)"
             optionValue="value"
             :allowEmpty="true"
            />
        </div>
        <div  class="flex flex-col gap-1" v-if="!filterCriteria.filterType">
            <DatePicker
            v-model="filterCriteria.selectedDate"
            view="month"
            dateFormat="mm/yy"
            placeholder="Mois/Année"
             input-class="w-full h-10 px-3 py-2"
             class="w-full h-10 rounded-lg border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            iconDisplay="input"
            showIcon
            />
        </div>

        <div class="flex-1 w-full">
            <MultiSelect
            v-model="filterCriteria.selectedDepts"
            :options="lstDepart"
            optionLabel="name"
            optionValue="id"
            :placeholder="$t('liDepart')"
            :loading="departmentLoading"
            class="w-full h-full"
            />
        </div>
    </div>

    <div class="flex items-center justify-between pt-2 border-t border-slate-100">
      <Button
        :label="$t('liReset')"
        icon="pi pi-filter-slash"
        text
        @click="resetFilters"
        size="small"
        class="text-indigo-600 font-bold"
      />
    </div>
</div>

  <LstService :payload="apiCriteria"/>
</template>

<script setup>
import DepartmentService from '@/service/DepartmentService';
import { useHandleAsyncError } from '@/utils/handleAsyncError';
import { computed, onMounted, ref } from 'vue';
import LstService from './LstService.vue';


const { handleAsyncError } = useHandleAsyncError();


const apiCriteria = computed(() => {
    const month = !filterCriteria.value.filterType && filterCriteria.value.selectedDate
      ? filterCriteria.value.selectedDate.getMonth() + 1
      : null;
    const year =  !filterCriteria.value.filterType &&  filterCriteria.value.selectedDate
      ? filterCriteria.value.selectedDate.getFullYear()
      : null;

    return {
      title: filterCriteria.value.searchQuery,
      indRecureent: filterCriteria.value.filterType ?? true,
      departmentIds: filterCriteria.value.selectedDepts,
      month,
      year
    };
  });

  //
 const options = [
  { label: 'liRecurrent', value: true },
  { label: 'liNonRecurrent', value: false }
];
const filterCriteria = ref({
      searchQuery: '',
      filterType: true,
      selectedDate: null,
      selectedDepts: []
})
//
const lstDepart = ref([]);
const errorReq = ref(null);



const departmentLoading = ref(false);

function resetFilters() {
  filterCriteria.value = {
    searchQuery: '',
    filterType: true,
    selectedDate: null,
    selectedDepts: []
  };
}
//
onMounted(async () => {

    filterCriteria.value.selectedDate=(new Date())
    const { error, result } = await handleAsyncError(
        () => DepartmentService.get(),
        (val) => (departmentLoading.value = val)
    );

    if(error)
    {
        errorReq.value = error;
        return;
    }
    lstDepart.value = result.departments;
});

</script>

<style scoped>
:deep(.p-select), :deep(.p-multiselect), :deep(.p-datepicker) {
  background: #f8fafc;
  border-radius: 0.5rem;
}
:deep(.p-datepicker-input) {
  background: transparent;
  border: none;
  font-size: 0.875rem;
}
</style>
