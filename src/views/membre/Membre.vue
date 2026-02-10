<template>
    <PageComponent :title-page="$t('Members')" @btn-add="openModalEdit">
    </PageComponent>

    <Dialog v-model:visible="modalEditOpen" :header="$t('SendInvitation')" :modal="true" :style="{ width: '50rem' }" :breakpoints="{ '1199px': '75vw', '575px': '90vw' }">
        <SendInviation/>
    </Dialog>
</template>

<script setup>
import PageComponent from '@/components/PageComponent.vue';
import { ref } from 'vue';
import SendInviation from './invitation/SendInviation.vue';

function openModalEdit() {
    modalEditOpen.value = true;
}
const modalEditOpen = ref(false);

</script>

