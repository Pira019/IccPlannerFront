<script setup>
import { ref } from 'vue';
import Add from './Add.vue';

const displayAddMinistry = ref(false);

function openAdd() {
    displayAddMinistry.value = true;
}
</script>

<template>
    <div className="card">
        <div class="font-semibold text-xl mb-4">
            <h1>{{ $t('Ministries') }}</h1>
        </div>
    </div>

    <div className="card">
        <div class="place-items-end mb-2">
            <div>
                <Button type="button" class="mr-2 mb-2" :label="$t('Add')" icon="pi pi-plus" @click="openAdd" />
            </div>
        </div>
        <Dialog :header="$t('AddMinistry')" :breakpoints="{ '960px': '75vw' }" :style="{ width: '30vw' }" v-model:visible="displayAddMinistry" :model="true">
            <Add />
        </Dialog>
    </div>
</template>
