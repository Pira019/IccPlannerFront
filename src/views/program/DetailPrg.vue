<script setup lang="ts">
import DepartmentService from '@/service/DepartmentService';
import { useHandleAsyncError } from '@/utils/handleAsyncError';
import { capitalize, getDays, getSelectedLabels } from '@/utils/Utils';
import { zodResolver } from '@primevue/forms/resolvers/zod';
import { Popover } from 'primevue';
import { computed, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { z } from 'zod';

//details
const { t } = useI18n();
const emit = defineEmits(['closeModal']);
const props = defineProps({
  prgId: {
    type: Number,
    required: false
  }
});

const { handleAsyncError } = useHandleAsyncError();

const days = getDays(t);
const btnLoadinDepart = ref(false);
const loading = ref(false);
const lstDept = ref([]);
const errorReq = ref(null);
const currentProgramId = computed(() => props.prgId);

const popOverRecurrent = ref(null);
const popOverNonRecurrent = ref(null);

const indRecurrent = ref(null);

const dates = ref();
// fonction
const onFormSubmit = async ({ valid, values }) => {

    const payload = formattedPayload(values);

    if(!valid){
        return;
    }
    const { error } = await handleAsyncError(
    () =>  DepartmentService.Departprogram(payload),
    (val) => (loading.value = val),
    true,
    'msgDeptPrgSuccess'
    );

    if(!error)
    {
        emit('closeModal')
        return;
    }
    errorReq.value = error;
};

// Charger les departements
watch(currentProgramId ,async (newDate) => {
    if (newDate) {
        const { result, error } = await handleAsyncError(
        () => DepartmentService.get(),
        (val) => (btnLoadinDepart.value = val)
    );

    if (error) {
        return;
    }
    lstDept.value = result?.departments || [];
}},
{ immediate: true });

const toggleNonRecurrent = (event) => {
  if (popOverNonRecurrent.value) {
    popOverNonRecurrent.value.toggle(event)
  }
}

const toggleRecurrent = (event) => {
  if (popOverRecurrent.value) {
    popOverRecurrent.value.toggle(event)
  }
}

const formattedPayload = (values) => {
    const payload = {
        ...values,
         programId: props.prgId
    };

    // Ajouter les champs selon le mode
    if (values.indRecurrent === true) {
        // Mode RÉCURRENT
        payload.dateStart = values.dateStart ? values.dateStart.toISOString().split('T')[0] : null;
        payload.dateEnd = values.dateEnd ? values.dateEnd.toISOString().split('T')[0] : null;
       payload.dates = [];
    } else if (values.indRecurrent === false) {

        payload.dates = values.dates?.map(d => d.toISOString().split('T')[0]) || [];
        payload.days = [];
        payload.dateEnd = null;
        payload.dateStart = null;
    }

    return payload;
};
//validator

const resolver = zodResolver(
    z.object({

        departmentIds: z.preprocess(
            (val) => val ?? [],
            z.array(z.number().int()).min(1)
        ),

        indRecurrent: z.preprocess(
        (val) => val === null || val === undefined ? undefined : val,
        z.boolean({ required_error: null })
        ),
        days: z.preprocess(
        (val) => val ?? [],
        z.array(z.any()).optional()),

        dates: z.preprocess(
        (val) => val ?? [],
        z.array(z.date()).optional()),

        dateEnd: z.preprocess(
        (val) => {
            if (val === null || val === undefined || val === '') {
            return null;
            }
            return val;
        },
        z.date().nullable().optional()
        ),

        dateStart: z.preprocess(
        (val) => {
            if (val === null || val === undefined || val === '') {
            return null;
            }
            return val;
        },
        z.date().nullable().optional()
        ),
        comment:  z.preprocess(
            (val) => (typeof val === 'string' ? val.trim() : ''),  // null ou undefined -> '', trim supprime les espaces
            z.string().nonempty()
            )
    })
    .refine((data) => {
        // Validation : dateEnd doit être >= dateStart si les deux sont définies
        if (data.dateStart && data.dateEnd) {
            return data.dateEnd >= data.dateStart;
        }
        return true;
        }, {
        message: t('endDateMustBeAfterStartDate'),
        path: ["dateEnd"], // erreur attachée à dateEnd
        })

    .refine((data) => {
        if (data.indRecurrent === true) {
            return data.days && data.days.length > 0;
        }
        return true;
    }, {
        message: t('invalidTypeReceivedUndefined'),
        path: ['days']
    })
    .refine((data) => {
        if (data.indRecurrent === false) {
            return data.dates && data.dates.length > 0;
        }
        return true;
    }, {
        message: t('invalidTypeReceivedUndefined'),
        path: ['dates']
    })
 );

</script>

<template>
    <Form @submit="onFormSubmit" :resolver>
        <div class="flex flex-col">
            <div class="flex flex-col gap-2 mb-4">
                <FloatLabel class="w-full" variant="on">
                    <FormField v-slot="$field" name="departmentIds">
                        <MultiSelect showClear optionValue="id" v-model="$field.value"
                            :loading="btnLoadinDepart" :options="lstDept" optionLabel="name" filter  fluid class="w-full" >
                                <template #option="slotProps">
                                {{ capitalize(slotProps.option.name) }}
                                </template>
                                <template #value="slotProps">
                                <span v-if="slotProps.value?.length">
                                    {{ getSelectedLabels(slotProps.value,lstDept) }}
                                    </span>
                                </template>
                        </MultiSelect>
                        <label>{{ $t('liDepart') }}</label>

                        <Message v-if="$field?.invalid" class="mt-1 mb-0" severity="error"  size="small" variant="simple">{{ $field.error?.message }}</Message>
                    </FormField>
                </FloatLabel>
            </div>

            <div class="flex flex-col gap-2 mb-5">
                <FormField v-slot="$field" name="indRecurrent">
                    <RadioButtonGroup v-model="$field.value" @update:modelValue="indRecurrent = $event" class="flex flex-wrap gap-4">
                        <div class="flex items-center gap-2">
                            <RadioButton inputId="recurrent" :value="true" />
                            <label for="recurrent">{{ $t('liRecurrent') }}</label>
                            <i class="pi pi-question-circle cursor-pointer" @click="toggleRecurrent($event)" ></i>                                                </div>
                        <div class="flex items-center gap-2">
                            <RadioButton inputId="nonRecurrent" :value="false" />
                            <label for="nonRecurrent">{{ $t('liNonRecurrent') }} </label>
                            <i class="pi pi-question-circle cursor-pointer" @click="toggleNonRecurrent($event)" ></i>
                        </div>
                    </RadioButtonGroup>
                     <Message v-if="$field?.invalid" lass="mt-1 mb-0" severity="error" size="small" variant="simple">{{ $field.error?.message }}</Message>
                </FormField>
            </div>

             <div class="flex flex-col gap-2 mb-5" v-if="indRecurrent == false" >
                <FloatLabel class="w-full" variant="on">
                    <FormField v-slot="$field" name="dates">
                        <DatePicker id="dates" selectionMode="multiple" showButtonBar
                        v-model="$field.value" dateFormat="dd/mm/yy" showIcon fluid iconDisplay="input" />
                        <label for="dates">{{ $t('liDates') }}</label>
                        <Message  class="mt-1 mb-0" v-if="$field?.invalid" severity="error" size="small" variant="simple">{{ $field.error?.message }}</Message>
                    </FormField>
                </FloatLabel>
            </div>

            <div class="flex flex-col gap-2 mb-4" v-if="indRecurrent">
                <FloatLabel class="w-full" variant="on">
                    <FormField v-slot="$field" name="days">
                        <MultiSelect id="liDays" showClear
                        v-model="$field.value" :options="days" optionValue="value" optionLabel="name" filter  fluid class="w-full" />
                        <label for="liDays">{{ $t('liDays')}}</label>
                        <Message  class="mt-1 mb-0" v-if="$field?.invalid" severity="error" size="small" variant="simple">{{ $field.error?.message }}</Message>
                    </FormField>
                </FloatLabel>
            </div>

            <div class="flex gap-4 mb-5" id="datesStartEnd" v-if="indRecurrent">
                <FloatLabel variant="on">
                    <FormField v-slot="$field" name="dateStart">
                        <DatePicker id="liDateStart" showButtonBar
                        v-model="$field.value" dateFormat="dd/mm/yy" showIcon fluid iconDisplay="input" />
                        <label for="liDateStart">{{ $t('liDateStart') }}</label>
                        <Message class="mt-1 mb-0" v-if="$field?.invalid" severity="error" size="small" variant="simple">{{ $field.error?.message }}</Message>
                    </FormField>
                </FloatLabel>

                <FloatLabel variant="on">
                    <FormField v-slot="$field" name="dateEnd">
                        <DatePicker id="liDateEnd" showButtonBar
                        v-model="$field.value" dateFormat="dd/mm/yy" showIcon fluid iconDisplay="input" />
                        <label for="liDateEnd">{{ $t('liDateEnd') }}</label>
                        <Message class="mt-1 mb-0" v-if="$field?.invalid" severity="error" size="small" variant="simple">{{ $field.error?.message }}</Message>
                    </FormField>
                </FloatLabel>
            </div>

            <div class="flex flex-col gap-2">
                <FloatLabel class="w-full" variant="on">
                     <FormField v-slot="$field" name="comment" class="w-full" >
                        <Textarea id="description" fluid v-model="$field.value" rows="8"  />
                        <label for="description">{{ $t('Description') }}*</label>
                        <Message class="mt-1 mb-0" v-if="$field?.invalid" severity="error" size="small" variant="simple">{{ $field.error?.message }}</Message>
                    </FormField>
                </FloatLabel>
            </div>

            <div class="flex flex-col gap-2">
                <ResponseComponent :error="errorReq" />
            </div>
            <div class="flex items-center mt-5">
                <slot name="btnPreview"/>
                <div class="flex gap-2 justify-end w-full overflow-hidden">
                    <Button variant="text" size="small"  @click="$emit('closeModal')" outlined class="mr-2 mb-2 truncate" :label="$t('Cancel')" icon="pi pi-times" />
                    <Button type="submit" size="small" class="mr-2 mb-2 truncate" :label="$t('Save')" :loading="loading" icon="pi pi-save" />
                </div>
            </div>
        </div>
    </Form>

    <!---->

    <Popover ref="popOverRecurrent" :dismissable="true" showCloseIcon>
        <div class="flex flex-col gap-4 w-[25rem]">
            <p class="text-left">{{ $t('liDescRecurrent') }}</p>
        </div>
    </Popover>
    <Popover ref="popOverNonRecurrent" :dismissable="true" showCloseIcon>
        <div class="flex flex-col gap-4 w-[25rem]">
            <p class="text-left">{{ $t('liDescNonRecurrent') }}</p>
        </div>
    </Popover>
</template>
