<script setup>
import { ref } from 'vue';
import Add from './Add.vue';

const displayAddMinistry = ref(false);

function openAdd() {
    displayAddMinistry.value = true;
}

function close() {
    displayAddMinistry.value = false;
}
</script>

<template>
    <PageComponent :title-page="$t('Programs')">
        <template #btn-add>
            <Button type="button" :label="$t('Add')" icon="pi pi-plus" @click="openAdd" />
        </template>

        <div>
            <h2>Mes deonnes</h2>
        </div>

        <Dialog :header="$t('AddMinistry')" :breakpoints="{ '960px': '75vw' }" :style="{ width: '30vw' }" v-model:visible="displayAddMinistry" :modal="true">
            <Add @closeModal="close" />
        </Dialog>
    </PageComponent>
</template>
