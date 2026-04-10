<script setup>
import ResponseComponent from '@/components/ResponseComponent.vue';
import ProgramService from '@/service/ProgramService';
import { useHandleAsyncError } from '@/utils/handleAsyncError';
import { zodResolver } from '@primevue/forms/resolvers/zod';
import { ref } from 'vue';
import { z } from 'zod';

const emit = defineEmits(['saved', 'closeDialog']);

const props = defineProps({
    program: {
        type: Object,
        default: null
    }
});

const { handleAsyncError } = useHandleAsyncError();
const errorReq = ref(null);
const loading = ref(false);
const prgId = ref(props.program?.programId || props.program?.idPrg || null);

const initialValues = ref({
    name: props.program?.title || '',
    shortName: props.program?.shortName || '',
    description: props.program?.description || ''
});

const resolver = zodResolver(
    z.object({
        name: z.preprocess((val) => val ?? '', z.string().nonempty().max(255)),
        shortName: z.preprocess((val) => val ?? '', z.string().nonempty().max(50)),
        description: z.preprocess((val) => val ?? '', z.string().nonempty())
    })
);

async function onFormSubmit({ valid, values }) {
    if (valid) {
        await savePrg(values);
    }
}

async function savePrg(payload) {
    const isEdit = !!prgId.value;
    const apiCall = isEdit
        ? ProgramService.EdtPrg(prgId.value, payload)
        : ProgramService.addPrg(payload);

    const { error, result } = await handleAsyncError(
        () => apiCall,
        (val) => (loading.value = val),
        true,
        isEdit ? 'msgEdtPrg' : 'msgAddPrg'
    );

    errorReq.value = error;
    if (error) {
        return;
    }

    if (!isEdit) {
        prgId.value = result.programId;
    }
    emit('saved', prgId.value);
}
</script>

<template>
    <Fluid>
        <Form :resolver="resolver" :initialValues="initialValues" @submit="onFormSubmit">
            <div class="flex flex-col sm:flex-row gap-6 mb-5">
                <FormField v-slot="$field" name="name" class="flex-1 w-full">
                    <label class="block font-semibold mb-2">{{ $t('prgName') }} *</label>
                    <InputText v-model="$field.value" maxlength="55" placeholder="Ex.: Culte dominical" />
                    <Message v-if="$field?.invalid" severity="error" size="small" variant="simple">{{ $field.error?.message }}</Message>
                </FormField>
                <FormField v-slot="$field" name="shortName" class="flex-1 w-full">
                    <label class="block font-semibold mb-2">{{ $t('ShortName') }}</label>
                    <InputText v-model="$field.value" maxlength="15" placeholder="Ex.: CD" />
                    <Message v-if="$field?.invalid" severity="error" size="small" variant="simple">{{ $field.error?.message }}</Message>
                </FormField>
            </div>
            <div class="mb-4">
                <FormField v-slot="$field" name="description">
                    <label class="block font-semibold mb-2">{{ $t('Description') }} *</label>
                    <Textarea rows="6" v-model="$field.value" placeholder="Ex : Le culte de célébration est un moment joyeux..." />
                    <Message v-if="$field?.invalid" severity="error" size="small" variant="simple">{{ $field.error?.message }}</Message>
                </FormField>
            </div>
            <ResponseComponent :error="errorReq" />
            <div class="flex justify-end gap-2 mt-4">
                <Button type="button" severity="secondary" size="small" @click="emit('closeDialog')" outlined :label="$t('Cancel')" icon="pi pi-times" />
                <Button type="submit" size="small" :label="prgId ? $t('btnUpdate') : $t('Save')" :loading="loading" icon="pi pi-save" />
            </div>
        </Form>
    </Fluid>
</template>
