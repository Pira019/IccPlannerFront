<script setup lang="ts">
import { ErrorModel } from '@/model/ErrorModel';
import DepartmentService from '@/service/DepartmentService';
import MinistryService from '@/service/MinistryService';
import { useHandleAsyncError } from '@/utils/handleAsyncError';
import { addDepartmentValidation } from '@/validations/addDepartmentValidation';
import { useForm } from 'vee-validate';
import { onMounted, ref } from 'vue';

const { handleAsyncError } = useHandleAsyncError();
const emit = defineEmits(['closeModal', 'newDepart', 'updateDepart']);
const props = defineProps({
    idDept: {
        default: 0
    }
});

const { errors, defineField, handleSubmit, isSubmitting, resetForm } = useForm({
    validationSchema: addDepartmentValidation
});

const errorMessage = ref<ErrorModel>();
const ministries = ref<number[]>([]);

const onSubmit = handleSubmit.withControlled(async (values) => {
    if (props.idDept != 0) {
        var body_update = {
            ...values,
            id: props.idDept
        };
        values = body_update;
    }

    const payload = {
        ...values,
        startDate: values.startDate?.toISOString().split('T')[0]
    };

    var method = props.idDept != 0 ? DepartmentService.add(payload) : DepartmentService.add(payload);
    var liTextSucc = props.idDept != 0 ? 'liDeptEdtSuccess' : 'liDeptAddSuccess';

    const { result, error } = await handleAsyncError(
        () => method,
        (val) => (isSubmitting.value = val),
        true,
        liTextSucc
    );

    if (error) {
        errorMessage.value = error;
        return;
    }

    if (props.idDept != 0) {
        emit('updateDepart', payload);
    } else {
        emit('newDepart', {
            ...payload,
            id: result?.id
        });
    }

    resetForm();
    closeDialog();
});

function closeDialog() {
    emit('closeModal');
}

const [name] = defineField('name');
const [description] = defineField('description');
const [ministryId] = defineField('ministryId');
const [shortName] = defineField('shortName');
const [startDate] = defineField('startDate');

///fonction

onMounted(async () => {
    const { result } = await handleAsyncError(() => MinistryService.getMinistries());
    ministries.value = result;
});
</script>

<template>
    <form @submit="onSubmit">
        <div class="flex flex-col">
            <div class="flex flex-col gap-2 mb-4">
                <FloatLabel variant="on">
                    <label class="font-semibold text-xl" for="ministry_name"> {{ $t('Ministry') }}*</label>
                    <Select
                        fluid
                        name="ministry_name"
                        id="ministry_name"
                        :invalid="!!errors.ministryId"
                        v-model="ministryId"
                        optionValue="id"
                        :options="ministries"
                        optionLabel="name"
                        :placeholder="$t('SelectMinistry')"
                        filter
                        :emptyFilterMessage="$t('NoResultsFound')"
                        :emptyMessage="$t('FilterEmptyMessage')"
                    />
                </FloatLabel>
                <Message size="small" severity="error" variant="simple" v-if="errors.ministryId"> {{ errors.ministryId }}</Message>
            </div>

            <div class="flex flex-col gap-2 mb-4">
                <FloatLabel variant="on">
                    <InputText id="department_name" :invalid="!!errors.name" v-model="name" size="large" maxlength="255" name="department_name" fluid />
                    <label for="department_name"> {{ $t('Name') }}*</label>
                </FloatLabel>
                <Message size="small" class="mx-1" severity="secondary" variant="simple">Ex : {{ $t('DepartmentExample') }}</Message>
                <Message size="small" severity="error" variant="simple" v-if="errors.name"> {{ errors.name }}</Message>
            </div>

            <div class="grid grid-cols-12 gap-3 mb-4">
                <div class="col-span-8">
                    <FloatLabel variant="on">
                        <InputText id="shortName" size="large" fluid :invalid="!!errors.shortName" v-model="shortName" maxlength="15" name="shortName" type="text" />
                        <label for="shortName"> {{ $t('ShortName') }}</label>
                    </FloatLabel>
                    <Message size="small" class="mt-2 mx-1" severity="secondary" variant="simple">Ex : {{ $t('ShortNameExemple') }}</Message>
                    <Message size="small" severity="error" variant="simple" class="mb-6 mx-1" v-if="errors.shortName"> {{ errors.shortName }}</Message>
                </div>
                <div class="col-span-4">
                    <FloatLabel variant="on">
                        <label for="startDate"> {{ $t('StartDate') }}</label>
                        <DatePicker id="startDate" size="large" :showIcon="true" v-model="startDate" :invalid="!!errors.startDate" dateFormat="yy-mm-dd"></DatePicker>
                    </FloatLabel>
                    <Message size="small" class="mx-1" severity="error" variant="simple" v-if="errors.startDate"> {{ errors.startDate }}</Message>
                </div>
            </div>
            <div class="flex flex-col gap-2">
                <FloatLabel variant="on">
                    <label for="description" class="font-semibold text-xl">{{ $t('Description') }}*</label>
                    <Textarea fluid id="description" size="large" :invalid="!!errors.description" v-model="description" rows="8" name="description" />
                </FloatLabel>
                <Message size="small" severity="error" variant="simple" v-if="errors.description"> {{ errors.description }}</Message>
            </div>

            <div class="flex flex-col gap-2">
                <ResponseComponent :error="errorMessage" />
            </div>
            <div class="gap-2 text-right mt-5">
                <Button type="button" severity="danger" @click="closeDialog" outlined class="mr-2 mb-2" :label="$t('Cancel')" icon="pi pi-times" />
                <Button type="submit" class="mr-2 mb-2" :label="$t('Save')" :loading="isSubmitting" icon="pi pi-save" />
            </div>
        </div>
    </form>
</template>
