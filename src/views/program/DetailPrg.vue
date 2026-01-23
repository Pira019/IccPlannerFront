<script setup lang="ts">
import MinistryService from '@/service/MinistryService';
import { useHandleAsyncError } from '@/utils/handleAsyncError';
import { addMinistryValidation } from '@/validations/addMinistryValidation';
import { useForm } from 'vee-validate';
import { ref, watch } from 'vue';


//details
const value3 = ref(null);
const cities = ref([
    { name: 'New York', code: 'NY' },
    { name: 'Rome', code: 'RM' },
    { name: 'London', code: 'LDN' },
    { name: 'Istanbul', code: 'IST' },
    { name: 'Paris', code: 'PRS' }
]);

const dates = ref();
//fin
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
                <FloatLabel class="w-full" variant="on">
                    <MultiSelect id="on_label" showClear  v-model="value3" :options="cities" optionLabel="name" filter  fluid class="w-full" />
                    <label for="on_label">On Label</label>
                </FloatLabel>
            </div>

            <div class="flex flex-col gap-2 mb-5">
                <RadioButtonGroup name="ingredient" class="flex flex-wrap gap-4">
                    <div class="flex items-center gap-2">
                        <RadioButton inputId="cheese" value="Cheese" />
                        <label for="cheese">Cheese <i class="pi pi-question-circle"  v-tooltip="'Enter your username'"></i></label>
                    </div>
                    <div class="flex items-center gap-2">
                        <RadioButton inputId="mushroom" value="Mushroom" />
                        <label for="mushroom">Mushroom <i class="pi pi-question-circle"
                        v-tooltip="'Enter your username Enter your usernameEnter your usernameEnter your usernameEnter your usernameEnter your username'"></i></label>
                    </div>
                </RadioButtonGroup>
            </div>

             <div class="flex flex-col gap-2 mb-5">
                <FloatLabel class="w-full" variant="on">
                    <DatePicker selectionMode="multiple" showButtonBar v-model="dates" dateFormat="dd/mm/yy" showIcon fluid iconDisplay="input" />
                    <label for="on_label">Dates</label>
                </FloatLabel>
            </div>

            <div class="flex flex-col gap-2 mb-4">
                <FloatLabel class="w-full" variant="on">
                    <MultiSelect id="on_label" showClear  v-model="value3" :options="cities" optionLabel="name" filter  fluid class="w-full" />
                    <label for="on_label">Jours</label>
                </FloatLabel>
            </div>

            <div class="flex flex-col gap-2">
                <label for="description">{{ $t('Description') }}*</label>
                <Textarea id="description" :invalid="!!errors.description" v-model="description" rows="8" name="description" />
                <Message size="small" severity="error" variant="simple" class="mb-6" v-if="errors.description"> {{ errors.description }}</Message>
            </div>

            <div class="flex flex-col gap-2">
                <ResponseComponent :error="errorMessage" />
            </div>
            <div class="flex items-center mt-5">
                <slot name="btnPreview"/>
                <div class="flex gap-2 justify-end w-full overflow-hidden">
                    <Button variant="text" size="small"  @click="$emit('closeModal')" outlined class="mr-2 mb-2 truncate" :label="$t('Cancel')" icon="pi pi-times" />
                    <Button type="submit" size="small" class="mr-2 mb-2 truncate" :label="$t('Save')" :loading="isSubmitting" icon="pi pi-save" />
                </div>
            </div>
        </div>
    </form>
</template>
