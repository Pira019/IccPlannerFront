<template>
   <page-component :title-page="$t('planning.menuLabel')" :showAddBtn="false"
        :breadcrumbs="[{ label: $t('planning.menuLabel') }]">
        <div class="mb-5">
             <Fieldset class="w-full block">
                <div class="flex flex-col md:flex-row gap-4 md:justify-between md:items-center">
                    <DepartmentSelect @update:selected="departValue=$event"/>
                </div>
              </Fieldset>
        </div>
        <PlanningBoard :department-selected="departValue" />
   </page-component>
</template>

<script setup>
import DepartmentSelect from '@/components/DepartmentSelect.vue';
import { ref } from 'vue';
import PlanningBoard from './PlanningBoard.vue';

const departValue = ref(null);
</script>
