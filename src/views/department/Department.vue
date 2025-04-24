<script setup>
import { ref } from 'vue';
import AddDepartment from './AddDepartment.vue';

const displayAddModal = ref(false);

function openAdd() {
    displayAddModal.value = true;
}
function close() {
    displayAddModal.value = false;
}
</script>

<template>
    <div className="card">
        <div class="font-semibold text-xl mb-4">
            <h1>{{ $t('Department') }}</h1>
        </div>
    </div>

    <div className="card">
        <div class="place-items-end mb-2">
            <div>
                <Button type="button" class="mr-2 mb-2" :label="$t('Add')" icon="pi pi-plus" @click="openAdd" />
            </div>
        </div>
        <Dialog :header="$t('AddDepartment')" :style="{ width: '50vw' }" v-model:visible="displayAddModal" :modal="true">
            <AddDepartment @closeModal="close" />
        </Dialog>
    </div>
</template>
