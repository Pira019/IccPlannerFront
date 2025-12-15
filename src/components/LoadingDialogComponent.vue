<template>
    <div class="flex flex-col">
        <div class="text-center">
            <i v-if="errorReq && !onLoading" class="pi pi-exclamation-circle text-6xl text-red-500 mb-4" style="font-size: 3.5rem"></i>
            <ProgressSpinner aria-label="Loading" v-if="onLoading" />
        </div>
        <div class="flex flex-col gap-2" v-if="errorReq && !onLoading">
            <ResponseComponent :error="errorReq" />
        </div>
        <div class="gap-2 text-right mt-5" v-if="errorReq && !onLoading">
            <Button type="button" severity="danger" @click="$emit('closeModal')" outlined class="mr-2 mb-2" :label="$t('liclose')" icon="pi pi-times" />
        </div>
    </div>
</template>

<script setup>
const props = defineProps({
    onLoading: {
        type: Boolean,
        default: false
    },
    errorReq: {
        type: Object,
        default: null
    }
});
</script>
