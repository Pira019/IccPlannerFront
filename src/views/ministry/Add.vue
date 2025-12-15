<script setup lang="ts">
import MinistryService from '@/service/MinistryService';
import { useHandleAsyncError } from '@/utils/handleAsyncError';
import { addMinistryValidation } from '@/validations/addMinistryValidation';
import { useForm } from 'vee-validate';
import { ref, watch } from 'vue';

const emit = defineEmits(['closeModal', 'updatedMin', 'addedMinistry']);
const props = defineProps({
    selectedMinistry: {
        type: Object,
        default: () => ({})
    }
});

const { handleAsyncError } = useHandleAsyncError();

const idMinUpdate = ref();

const { errors, defineField, handleSubmit, isSubmitting, resetForm } = useForm({
    validationSchema: addMinistryValidation
});

const errorMessage = ref();
const successResponse = ref(false);

const onSubmit = handleSubmit.withControlled(async (values) => {
    if (idMinUpdate.value) {
        var body_update = {
            ...values,
            id: idMinUpdate.value
        };
        values = body_update;
    }

    var method = idMinUpdate.value ? MinistryService.put(values) : MinistryService.add(values);

    const { result, error } = await handleAsyncError(
        () => method,
        (val) => (isSubmitting.value = val),
        true
    );

    if (error) {
        errorMessage.value = error;
        return;
    }

    if (idMinUpdate.value) {
        emit('updatedMin', values);
    } else {
        emit('addedMinistry', {
            ...values,
            id: result?.id
        });
    }

    resetForm();
    emit('closeModal');
});

const [name] = defineField('name');
const [description] = defineField('description');

watch(
    () => props.selectedMinistry,
    (newVal) => {
        if (newVal) {
            name.value = newVal.name;
            description.value = newVal.description;
            idMinUpdate.value = newVal.id;
        }
    },
    { immediate: true }
);
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
