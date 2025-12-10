<script setup>
import { ref } from 'vue';
    import Add from './Add.vue'; 
    import HeaderComponent from '@/components/HeaderComponent.vue';

const displayAddMinistry = ref(false);

function openAdd() {
    displayAddMinistry.value = true;
}

function close() {
    displayAddMinistry.value = false;
}
</script>

<template>

    <HeaderComponent :title-page ="$t('Ministries')" />
    <div className="card">
        <div class="place-items-end mb-2">
            <div>
                <Button type="button" class="mr-2 mb-2" :label="$t('Add')" icon="pi pi-plus" @click="openAdd" />
            </div>
        </div>
        <Dialog :header="$t('AddMinistry')" :breakpoints="{ '960px': '75vw' }" :style="{ width: '30vw' }" v-model:visible="displayAddMinistry" :modal="true">
            <Add @closeModal="close" />
        </Dialog>
    </div>
</template>
