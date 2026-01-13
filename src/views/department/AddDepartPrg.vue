<template>
    <Fluid>
        <Form :initialValues :resolver @submit="onFormSubmit">
            <div class="flex flex-row gap-6 mb-5">
                <FormField v-slot="$field" name="name" class="flex-auto">
                    <label for="depart" class="font-semibold text-xl mb-2">{{ $t('Department') }}</label>
                    <MultiSelect
                        id="depart"
                        :emptyFilterMessage="$t('NoResultsFound')"
                        :emptyMessage="$t('FilterEmptyMessage')"
                        v-model="departmentIds"
                        :options="departments"
                        filter
                        optionLabel="name"
                        :placeholder="$t('selectDepartment')"
                        :maxSelectedLabels="3"
                        class="w-full md:w-80"
                    />
                    <Message v-if="$field?.invalid" severity="error" size="small" variant="simple">{{ $field.error?.message }}</Message>
                </FormField>

                <FormField v-slot="$field" name="indRecurent" class="flex-auto">
                    <div class="flex items-center gap-2 mt-8">
                        <Checkbox v-model="size" inputId="indRecurent" name="indRecurent" value="Normal" />
                        <label for="indRecurent">{{ $t('liIndRecurent') }}</label>
                         <i class="pi pi-question-circle" v-tooltip="$t('liRecurentDesc')"></i>
                    </div>
                    <Message v-if="$field?.invalid" severity="error" size="small" variant="simple">{{ $field.error?.message }}</Message>
                </FormField>
            </div>

            <div class="flex flex-col sm:flex-row sm:items-center gap-6 mt-5">
                <FormField v-slot="$field" name="dates" class="flex-auto">
                    <label for="description" class="block font-semibold mb-2">{{ $t('liDates') }} *</label>
                    <DatePicker v-model="date" selectionMode="multiple" :manualInput="false" dateFormat="dd/mm/yy" showClear showIcon variant="filled" iconDisplay="input" />
                    <Message v-if="$field?.invalid" severity="error" size="small" variant="simple">{{ $field.error?.message }}</Message>
                </FormField>

                <FormField v-slot="$field" name="day" class="flex-auto">
                    <label for="day" class="block font-semibold mb-2">{{ $t('liDays') }} *</label>
                    <MultiSelect id="day" :emptyMessage="$t('FilterEmptyMessage')" v-model="day" :options="days" filter optionLabel="name" :placeholder="$t('selectDays')" :maxSelectedLabels="3" class="w-full md:w-80" />
                    <Message v-if="$field?.invalid" severity="error" size="small" variant="simple">{{ $field.error?.message }}</Message>
                </FormField>

                <FormField v-slot="$field" name="dateFin" class="flex-auto">
                    <label for="dateFin" class="block font-semibold mb-2">{{ $t('liDates') }} *</label>
                    <DatePicker v-model="dateFin" showClear showIcon variant="filled" dateFormat="dd/mm/yy" iconDisplay="input" />
                    <Message v-if="$field?.invalid" severity="error" size="small" variant="simple">{{ $field.error?.message }}</Message>
                </FormField>
            </div>
            <div class="flex flex-col gap-2">
                <ResponseComponent :error="errorReq" :successResponse="success && !errorReq" :showSuccessMessage="true" />
            </div>
            <div class="flex justify-end mt-5">
                <div class="flex gap-2">
                    <Button type="button" severity="danger" size="small" @click="closeDialog" outlined class="w-1/2" :label="$t('Cancel')" icon="pi pi-times" />
                    <Button type="submit" size="small" :label="$t('Save')" :loading="isSubmitting" icon="pi pi-save" />
                </div>
            </div>
        </Form>
    </Fluid>
</template>

<script setup>
const emit = defineEmits(['saved', 'closeModal']);

function closeDialog() {
    emit('closeDialog');
}
</script>
