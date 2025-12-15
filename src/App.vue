<script setup>
import ToastComponent from './components/ToastComponent.vue';
</script>

<template>
    <router-view />
    <ToastComponent />

    <ConfirmDialog group="deleteDialog" />
    <ConfirmDialog group="confirmDialog" :style="{ width: '500px', maxWidth: '1000vw' }">
        <template #message="slotProps">
            <div class="flex flex-col items-center w-full gap-4 border-b border-surface-200 dark:border-surface-700">
                <i :class="slotProps.message.icon" class="!text-6xl text-primary-500"></i>
                <Message severity="warn">
                    <p>{{ slotProps.message.message }}</p>
                </Message>
            </div>
        </template>
    </ConfirmDialog>
</template>

<style scoped></style>
