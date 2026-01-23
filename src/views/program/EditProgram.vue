<script setup>
import ProgramService from '@/service/ProgramService';
import { useHandleAsyncError } from '@/utils/handleAsyncError';
import { zodResolver } from '@primevue/forms/resolvers/zod';
import { ref } from 'vue';
import { z } from 'zod';

const emit = defineEmits(['saved', 'closeModal']);

const { handleAsyncError } = useHandleAsyncError();

const errorReq = ref(null);
const loading = ref(false);
const prgId = ref(null);

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

function closeDialog() {
    emit('closeDialog');
}

///
async function editPrg(newPrg) {


    const liMsg = prgId.value ? 'msgEdtPrg' : 'msgAddPrg'
    var method =   prgId.value
                    ?  ProgramService.EdtPrg(prgId.value,newPrg)
                    : ProgramService.addPrg(newPrg)

    const { error, result } = await handleAsyncError(
        () => method,
        (val) => (loading.value = val),
        true,
        liMsg
    );
    errorReq.value = error;

    if (errorReq.value != null )  {
       return;
    }

    if(!prgId.value) {
         prgId.value = result.programId
         emit('saved', prgId.value)
    }

}
</script>

<template>
    <Fluid>
        <Form :resolver @submit="onFormSubmit">
            <div class="flex flex-col sm:flex-row gap-6 mb-5">
                <FloatLabel variant="on" class="flex-1 w-full">
                    <FormField v-slot="$field" name="name" class="flex-auto">
                        <label class="block font-semibold mb-2">{{ $t('prgName') }} *</label>
                        <InputText  v-model="$field.value" maxlength="55" placeholder="Ex.: Culte dominical" />
                        <Message v-if="$field?.invalid" severity="error" size="small" variant="simple">{{ $field.error?.message }}</Message>
                    </FormField>
                </FloatLabel>
                <FloatLabel variant="on" class="flex-1 w-full">
                    <FormField v-slot="$field" name="shortName" class="flex-auto">
                        <label for="shortName" class="block font-semibold mb-2">{{ $t('ShortName') }}</label>
                        <InputText v-model="$field.value" maxlength="15" placeholder="Ex.: CD" />
                        <Message v-if="$field?.invalid" severity="error" size="small" variant="simple">{{ $field.error?.message }}</Message>
                    </FormField>
                </FloatLabel>
            </div>
            <div class="flex flex-col sm:flex-row sm:items-center gap-6 mb-2">
                <FloatLabel variant="on">
                    <FormField v-slot="$field" name="description" class="flex-auto">
                        <label for="description" class="block font-semibold mb-2">{{ $t('Description') }} *</label>
                        <Textarea rows="8" v-model="$field.value" placeholder="Ex : Le culte de célébration est un moment joyeux où nous louons Dieu ..." />
                        <Message v-if="$field?.invalid" severity="error" size="small" variant="simple">{{ $field.error?.message }}</Message>
                    </FormField>
                </FloatLabel>
            </div>
            <div class="flex flex-col gap-2">
                <ResponseComponent :error="errorReq"/>
            </div>
            <div class="flex items-center mt-5">
                <slot name="btnStep"></slot>
                <div class="flex gap-2 ml-auto">
                    <Button type="button" class="truncate" severity="danger" size="small" @click="closeDialog" outlined :label="$t('Cancel')" icon="pi pi-times" />
                    <Button type="submit" class=" truncate" size="small" :label="prgId  ? $t('Modifier') : $t('Save')" :loading="loading" icon="pi pi-save"  />
                </div>
            </div>
        </Form>
    </Fluid>
</template>
