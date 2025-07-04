<template>
    <Toast />
</template>

<script setup>
import { useToastStore } from '@/store/Index';
import { useToast } from 'primevue/usetoast';
import { watch } from 'vue';

const toast = useToast();
const toastStore = useToastStore();

watch(
    () => toastStore.isSucceed,
    () => {
        if (toastStore.isSucceed != null) {
            toast.add({ severity: 'success', summary: 'Info', detail: toastStore?.msg, life: 3000 });
        }
        toastStore.toastReset()
    }
);
</script>
