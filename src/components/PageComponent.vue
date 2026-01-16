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
                <Button class="text-[clamp(0.875rem,2vw,1.25rem)]
                               px-[clamp(0.75rem,2vw,1rem)]
                               py-[clamp(0.5rem,1vw,0.75rem)] rounded-md" type="button" :label="$t('Add')" icon="pi pi-plus" @click="$emit('btn-add')" />
            </template>
        </HeaderComponent>
        <slot></slot>
    </div>
</template>
