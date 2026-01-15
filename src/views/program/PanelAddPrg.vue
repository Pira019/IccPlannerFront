<script setup lang="ts">
import AddDepartPrg from '@/views/department/AddDepartPrg.vue';
import { inject, ref } from 'vue';
import EditProgram from './EditProgram.vue';

const emit = defineEmits(['cancel', 'save']);
const dialogRef = inject('dialogRef');

const departPanel = ref(false);
const valuePanel = ref('0');

const closeDialog = () => {
    dialogRef.value.close();
};

function openAddDepartPanel(result) {
    if (result.programId) {
        valuePanel.value = '1';
        departPanel.value = true;
    }
}
</script>

<template>
    <div>
        <Tabs v-model:value="valuePanel" scrollable>
            <TabList>
                <Tab value="0">{{ $t('AddProgram') }}</Tab>
                <Tab value="1">Header II</Tab>
            </TabList>
            <TabPanels>
                <TabPanel value="0">
                    <EditProgram @closeDialog="closeDialog" @saved="openAddDepartPanel" />
                </TabPanel>
                <TabPanel value="1">
                    <p class="m-0">
                        <AddDepartPrg @closeDialog="closeDialog"/>
                    </p>
                </TabPanel>
            </TabPanels>
        </Tabs>
    </div>
</template>
