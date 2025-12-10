<script setup lang="ts">
import { ErrorModel } from '@/model/ErrorModel';
import MinistryService from '@/service/MinistryService';
import { useHandleAsyncError } from '@/utils/handleAsyncError';
import { addMinistryValidation } from '@/validations/addMinistryValidation';
import { useForm } from 'vee-validate';
import { ref } from 'vue';

const emit = defineEmits(['closeModal']);
const { handleAsyncError } = useHandleAsyncError();

const { errors, defineField, handleSubmit, isSubmitting, resetForm } = useForm({
    validationSchema: addMinistryValidation
});

const errorMessage = ref<ErrorModel>();
const successResponse = ref(false);

const onSubmit = handleSubmit.withControlled(async (values) => {
    const body = JSON.stringify(values);
    const { error } = await handleAsyncError(() => MinistryService.add(body), null, true);

    if (error) {
        errorMessage.value = error;
        successResponse.value = false;
        return;
    }
    resetForm();
    emit('closeModal');
});

const [name] = defineField('name');
const [description] = defineField('description');
</script>

<template>
    <form @submit="onSubmit">
        <div class="flex flex-col">
            <div class="flex flex-col gap-2 mb-4">
                <label for="name"> {{ $t('Name') }}*</label>
                <InputText id="name" :invalid="!!errors.name" v-model="name" maxlength="255" name="ministry" type="text" :placeholder="$t('MinistryExample')" />
                <Message size="small" severity="error" variant="simple" class="mb-6" v-if="errors.name"> {{ errors.name }}</Message>
            </div>

            <div class="flex flex-col gap-2">
                <label for="description">{{ $t('Description') }}*</label>
                <Textarea id="description" :invalid="!!errors.description" v-model="description" rows="8" name="description" />
                <Message size="small" severity="error" variant="simple" class="mb-6" v-if="errors.description"> {{ errors.description }}</Message>
            </div>

            <div class="flex flex-col gap-2">
                <ResponseComponent :error="errorMessage" />
            </div>

            <div class="gap-2 text-right mt-5">
                <Button type="button" severity="danger" @click="$emit('closeModal')" outlined class="mr-2 mb-2" :label="$t('Cancel')" icon="pi pi-times" />
                <Button type="submit" class="mr-2 mb-2" :label="$t('Save')" :loading="isSubmitting" icon="pi pi-save" />
            </div>
        </div>
    </form>
</template>
