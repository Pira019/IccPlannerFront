<script setup lang="ts">
import CalendarComponent from '@/components/CalendarComponent.vue';
import HeaderComponent from '@/components/HeaderComponent.vue';

import { useDialog } from 'primevue/usedialog';
import { defineAsyncComponent } from 'vue';

const dialog = useDialog();
const dynamicComponent = defineAsyncComponent(() => import('@/views/Availability/AddAvailability.vue'));

const show = () => {
    dialog.open(dynamicComponent, {
        props: {
            header: 'Product List',
            modal: true
        },
        emits: {
            OnClose: (e) => {
                console.log('TEST');
            }
        }
    });
};
</script>

<template>
    <HeaderComponent title-page="Titre de la page" />

    <div class="card">
        <CalendarComponent @show-modal="show" />
    </div>

    <Button label="Select a Product" icon="pi pi-search" @click="show" />
    <DynamicDialog />
</template>
