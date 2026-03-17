<template>
     <Select :options="departmentLst" v-model="departmentSelected"
            optionValue="id" :loading="departLoading" filter optionLabel="name"
            :placeholder="$t('liSelectDepart')"
            class="w-full md:w-[350px] bg-white border border-gray-300 rounded-lg shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 transition">
            <template #option="slotProps">
                <div class="flex items-center">
                    <div>{{ slotProps.option.name }}</div>
                </div>
            </template>
      </Select>
</template>

<script setup>
import DepartmentService from '@/service/DepartmentService';
import { useHandleAsyncError } from '@/utils/handleAsyncError';
import { onMounted, ref, watch } from 'vue';

const emit = defineEmits(['update:selected']);

const { handleAsyncError } = useHandleAsyncError();


const departmentLst  = ref([]);
const departLoading = ref(false)

const departmentSelected = ref(null);

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

watch(departmentSelected, (newVal) => {
    emit('update:selected', newVal);
});
</script>
