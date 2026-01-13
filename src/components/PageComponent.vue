<script setup>
import HeaderComponent from '@/components/HeaderComponent.vue';

const props = defineProps({
    titlePage: { type: String, required: true },
    showAddBtn: { type: Boolean, default: true }
});
</script>
<template>
    <div className="card">
        <HeaderComponent class="mb-10" :title-page="titlePage">
            <template #btn-add v-if="showAddBtn">
                <Button type="button" :label="$t('Add')" icon="pi pi-plus" @click="$emit('btn-add')" />
            </template>
        </HeaderComponent>
        <slot></slot>
    </div>
</template>
