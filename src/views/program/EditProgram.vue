<script setup>
import ProgramService from '@/service/ProgramService';
import { useHandleAsyncError } from '@/utils/handleAsyncError';
import { zodResolver } from '@primevue/forms/resolvers/zod';
import { ref } from 'vue';
import { z } from 'zod';


const loading = ref(false);
const formRef = ref(null); // ref vers le Form

const emit = defineEmits(['saved', 'closeModal','next']);

const { handleAsyncError } = useHandleAsyncError();

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
         emit('next');
    }
};

function closeDialog() {
    emit('closeDialog');
}

///
async function editPrg(newPrg) {
    const { error, result } = await handleAsyncError(
        () => ProgramService.addPrg(newPrg),
        (val) => (loading.value = val),
        true,
        'msgAddPrg'
    );
    errorReq.value = error;

    if (errorReq.value == null)
    {
        emit('saved', {
            programId: result.programId
        });
    }
}
</script>

<template>
    <Fluid>
        <Form :initialValues :resolver @submit="onFormSubmit">
            <div class="flex flex-col sm:flex-row gap-6 mb-5">
                <FloatLabel variant="on" class="flex-1 w-full">
                    <FormField v-slot="$field" name="name" class="flex-auto">
                        <label class="block font-semibold mb-2">{{ $t('prgName') }} *</label>
                        <InputText v-keyfilter.alphanum maxlength="55" placeholder="Ex.: Culte dominical" />
                        <Message v-if="$field?.invalid" severity="error" size="small" variant="simple">{{ $field.error?.message }}</Message>
                    </FormField>
                </FloatLabel>
                <FloatLabel variant="on" class="flex-1 w-full">
                    <FormField v-slot="$field" name="shortName" class="flex-auto">
                        <label for="shortName" class="block font-semibold mb-2">{{ $t('ShortName') }} *</label>
                        <InputText maxlength="15" placeholder="Ex.: CD" v-keyfilter.alphanum />
                        <Message v-if="$field?.invalid" severity="error" size="small" variant="simple">{{ $field.error?.message }}</Message>
                    </FormField>
                </FloatLabel>
            </div>
            <div class="flex flex-col sm:flex-row sm:items-center gap-6 mb-2">
                <FloatLabel variant="on">
                    <FormField v-slot="$field" name="description" class="flex-auto">
                        <label for="description" class="block font-semibold mb-2">{{ $t('Description') }} *</label>
                        <Textarea rows="8" placeholder="Ex : Le culte de célébration est un moment joyeux où nous louons Dieu ..." />
                        <Message v-if="$field?.invalid" severity="error" size="small" variant="simple">{{ $field.error?.message }}</Message>
                    </FormField>
                </FloatLabel>
            </div>
            <div class="flex flex-col gap-2">
                <ResponseComponent :error="errorReq"/>
            </div>
            <div class="flex justify-end mt-5">
                <div class="flex gap-2">
                    <Button type="button" severity="danger" size="small" @click="closeDialog" outlined class="w-1/2" :label="$t('Cancel')" icon="pi pi-times" />
                    <Button type="submit" size="small" :label="$t('Save')" :loading="loading" icon="pi pi-save" />
                </div>
            </div>
        </Form>
    </Fluid>
</template>
