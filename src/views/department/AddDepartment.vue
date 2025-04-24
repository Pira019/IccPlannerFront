<script setup lang="ts">
import { ErrorModel } from '@/model/ErrorModel';
import DepartmentService from '@/service/DepartmentService';
import MinistryService from '@/service/MinistryService';
import { handleAsyncError } from '@/utils/handleAsyncError';
import { addDepartmentValidation } from '@/validations/addDepartmentValidation';
import { useForm } from 'vee-validate';
import { onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

const { errors, defineField, handleSubmit, isSubmitting, resetForm } = useForm({
    validationSchema: addDepartmentValidation
});

const errorMessage = ref<ErrorModel>();
const ministries = ref<[]>([]);

const successResponse = ref(false);

const onSubmit = handleSubmit.withControlled(async (values) => {
    const formatedValues = {
        ...values,
        startDate: values.startDate?.toISOString().split('T')[0]
    };
    const body = JSON.stringify(formatedValues);
    const { error } = await handleAsyncError(() => DepartmentService.add(body), t);

    if (error) {
        errorMessage.value = error;
        successResponse.value = false;
        return;
    }
    resetForm();
    successResponse.value = true;
});

const [name] = defineField('name');
const [description] = defineField('description');
const [ministryId] = defineField('ministryId');
const [shortName] = defineField('shortName');
const [startDate] = defineField('startDate');

///fonction

onMounted(async () => {
    const { result } = await handleAsyncError(() => MinistryService.getMinistries(), t);
    ministries.value = result;
});
</script>

<template>
    <form @submit="onSubmit">
        <div class="flex flex-col">
            <div class="flex flex-col gap-2 mb-4">
                <label class="font-semibold text-xl" for="ministry_name"> {{ $t('Ministry') }}*</label>
                <Select
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
                <Message size="small" severity="error" variant="simple" v-if="errors.ministryId"> {{ errors.ministryId }}</Message>
            </div>

            <div class="flex flex-col gap-2 mb-4">
                <label class="font-semibold text-xl" for="department_name"> {{ $t('Name') }}*</label>
                <InputText id="department_name" :invalid="!!errors.name" v-model="name" maxlength="55" name="department_name" type="text" :placeholder="$t('DepartmentExample')" />
                <Message size="small" severity="error" variant="simple" v-if="errors.name"> {{ errors.name }}</Message>
            </div>

            <div class="flex flex-col gap-2 mb-4">
                <label class="font-semibold text-xl" for="shortName"> {{ $t('ShortName') }}</label>
                <InputText id="shortName" :invalid="!!errors.shortName" v-model="shortName" maxlength="55" name="shortName" type="text" :placeholder="$t('ShortNameExemple')" />
                <Message size="small" severity="error" variant="simple" class="mb-6" v-if="errors.shortName"> {{ errors.shortName }}</Message>
            </div>

            <div class="flex flex-col gap-2 mb-4">
                <label class="font-semibold text-xl" for="startDate"> {{ $t('StartDate') }}</label>
                <DatePicker id="startDate" :showIcon="true" v-model="startDate" :invalid="!!errors.startDate" dateFormat="yy-mm-dd"></DatePicker>
                <Message size="small" severity="error" variant="simple" v-if="errors.startDate"> {{ errors.startDate }}</Message>
            </div>

            <div class="flex flex-col gap-2">
                <label for="description" class="font-semibold text-xl">{{ $t('Description') }}*</label>
                <Textarea id="description" :invalid="!!errors.description" v-model="description" rows="8" name="description" />
                <Message size="small" severity="error" variant="simple" v-if="errors.description"> {{ errors.description }}</Message>
            </div>

            <div class="flex flex-col gap-2">
                <ResponseComponent :error="errorMessage" :showSuccessMessage="true" :successResponse />
            </div>
            <div class="gap-2 text-right mt-5">
                <Button type="button" severity="danger" @click="$emit('closeModal')" outlined class="mr-2 mb-2" :label="$t('Cancel')" icon="pi pi-times" />
                <Button type="submit" class="mr-2 mb-2" :label="$t('Save')" :loading="isSubmitting" icon="pi pi-save" />
            </div>
        </div>
    </form>
</template>
