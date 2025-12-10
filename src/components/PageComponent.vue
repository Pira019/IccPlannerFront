<script setup>
import HeaderComponent from '@/components/HeaderComponent.vue';

const props = defineProps({
    titlePage: { type: String, required: true }
});
</script>
<template>
    <div className="card">
        <HeaderComponent class="mb-10" :title-page="$t('Ministries')">
            <template #btn-add>
                <slot name="btn-add" />
            </template>
        </HeaderComponent>
        <slot></slot>
    </div>
</template>
