<template>
    <Fluid>
        <Form :initialValues :resolver @submit="onFormSubmit">
            <div class="flex flex-row gap-6 mb-5">
                <FormField v-slot="$field" name="name" class="flex-auto">
                    <label for="name" class="block font-semibold mb-2">{{ $t('prgName') }} *</label>
                    <InputText type="text" maxlength="255" placeholder="Ex: Culte dominical" />
                    <Message v-if="$field?.invalid" severity="error" size="small" variant="simple">{{ $field.error?.message }}</Message>
                </FormField>
                <FormField v-slot="$field" name="shortName" class="flex-auto">
                    <label for="shortName" class="block font-semibold mb-2">{{ $t('ShortName') }} *</label>
                    <InputText type="text" maxlength="50" placeholder="Ex: CD" />
                    <Message v-if="$field?.invalid" severity="error" size="small" variant="simple">{{ $field.error?.message }}</Message>
                </FormField>
            </div>
            <div class="flex flex-col sm:flex-row sm:items-center gap-6 mb-2">
                <FormField v-slot="$field" name="description" class="flex-auto">
                    <label for="description" class="block font-semibold mb-2">{{ $t('Description') }} *</label>
                    <Textarea placeholder="Ex : Le culte de célébration est un moment joyeux où nous louons Dieu ..." />
                    <Message v-if="$field?.invalid" severity="error" size="small" variant="simple">{{ $field.error?.message }}</Message>
                </FormField>
            </div>
            <Message class="mb-5" v-if="errorReq != null" severity="error">{{ errorReq?.message }}</Message>

            <div class="grid">
                <div class="col-end-6 flex justify-end">
                    <Button type="submit" :loading="loading" :label="$t('Save')" />
                </div>
            </div>
        </Form>
    </Fluid>
</template>

<script setup>
import ProgramService from '@/service/ProgramService';
import { useHandleAsyncError } from '@/utils/handleAsyncError';
import { zodResolver } from '@primevue/forms/resolvers/zod';
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { z } from 'zod';

const { t } = useI18n();
const emit = defineEmits(['saved']);
const { handleAsyncError } = useHandleAsyncError();

const loading = ref(false);
const errorReq = ref(null);

const resolver = zodResolver(
    z.object({
        name: z.preprocess((val) => val ?? '', z.string().nonempty().max(255)),
        shortName: z.preprocess((val) => val ?? '', z.string().nonempty().max(50)),
        description: z.preprocess((val) => val ?? '', z.string().nonempty())
    })
);

const onFormSubmit = async ({ valid, values }) => {
    if (valid) {
        await editPrg(values);
    }
};

///
async function editPrg(newPrg) {
    const { error, result } = await handleAsyncError(
        () => ProgramService.addPrg(newPrg), 
        (val) => (loading.value = val),
        true,
        'msgAddPrg'
    );
    errorReq.value = error;

    if (result != null) {
        emit('saved', {
            programId: result.programId,
            name: newPrg.name
        });
    }
}
</script>
