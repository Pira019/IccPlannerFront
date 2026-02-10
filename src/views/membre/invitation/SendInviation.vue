<template>
    <Fluid>
        <Form :resolver="resolver" @submit="onFormSubmit" >
            <div class="flex flex-col">
                <div class="flex flex-col gap-2 mb-4">
                    <FloatLabel variant="on">
                        <FormField v-slot="$field" name="firstName" class="flex flex-col gap-1">
                            <label>{{ $t('lifirstName') }} *</label>
                            <InputText  v-model="$field.value" maxlength="55" />
                            <Message v-if="$field?.invalid" severity="error" size="small" variant="simple">{{ $field.error?.message }}</Message>
                        </FormField>
                    </FloatLabel>
                </div>
                <div class="flex flex-col gap-2 mb-2">
                    <FloatLabel variant="on">
                        <FormField v-slot="$field" name="email" class="flex flex-col gap-2">
                            <label>{{ $t('email') }} *</label>
                            <InputText  v-model="$field.value" maxlength="55" />
                            <Message v-if="$field?.invalid" severity="error" size="small" variant="simple">{{ $field.error?.message }}</Message>
                        </FormField>
                    </FloatLabel>
                </div>
                 <div class="flex flex-col mb-4">
                    <ResponseComponent :error="errorReq"/>
                </div>
                <div class="flex items-center">
                    <div class="flex items-center gap-2">
                        <Checkbox v-model="sendOtherchecked" :binary="true" inputId="other"/>
                        <label for="other"> {{ $t('liSendOther') }} </label>
                    </div>
                    <div class="flex gap-2 ml-auto">
                        <Button type="button" class="truncate" severity="danger" size="small" @click="closeDialog" outlined :label="$t('Cancel')" icon="pi pi-times" />
                        <Button type="submit" class=" truncate" size="small" :label="$t('Save')" :loading="loadingReq" icon="pi pi-save"  />
                    </div>
                </div>
            </div>
        </Form>
    </Fluid>
</template>

<script setup>
import ResponseComponent from '@/components/ResponseComponent.vue';
import InvitationService from '@/service/InvitationService';
import { useHandleAsyncError } from '@/utils/handleAsyncError';
import { zodResolver } from '@primevue/forms/resolvers/zod';
import { ref } from 'vue';
import z from 'zod';

const emit = defineEmits(['closeModal']);
const props = defineProps({
    idDept: {
        default: null
    }
});

const resolver = zodResolver(
    z.object({
        firstName: z.preprocess((val) => val ?? '', z.string().nonempty().max(55)),
        email: z.preprocess((val) => val ?? '', z.string().email().nonempty()),
    })
);

const { handleAsyncError } = useHandleAsyncError();

const errorReq = ref(null);
const sendOtherchecked = ref(false);
const loadingReq = ref(false);

const onFormSubmit = async ({ valid, values, reset }) => {
    if (!valid) {
       return;
    }

    var  payload =
    {
         ...values,
            departmentID: props.idDept
    }

    const { error } = await handleAsyncError(
        () => InvitationService.sendInvitation(payload),
        (val) => (loadingReq.value = val),
        true,
        "liMsgSendInv"
    );

    if (error) {
        errorReq.value = error;
        return;
    }

    if(sendOtherchecked.value){
        reset();
        return;
    }

    closeDialog();
};


function closeDialog() {
    emit('closeDialog');
}
</script>
