<!--Ce component permet de gérer les message apres la soumission d'un formulaire -->
<script setup lang="ts">
import { ErrorModel } from '@/model/ErrorModel';
const props = defineProps<{
    error: ErrorModel;
    showSuccessMessage?: boolean;
    successResponse?: boolean;
}>();
</script>

<template>
    <div class="mt-2">
        <Message severity="error" v-if="props.error && !props.successResponse">
            <p v-if="props.error?.validationErrors?.length" v-for="(message, key) in props.error.validationErrors" :key="key">
                <span>{{ message }}</span>
            </p>
            <p v-else>{{ props.error?.message }}</p>
        </Message>
        <Message severity="success" v-if="props.showSuccessMessage && props.successResponse">
            <p>{{ $t('SucceedSave') }}</p>
        </Message>
    </div>
</template>
