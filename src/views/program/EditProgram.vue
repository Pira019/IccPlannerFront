<script setup>
import ResponseComponent from '@/components/ResponseComponent.vue';
import DepartmentService from '@/service/DepartmentService';
import ProgramService from '@/service/ProgramService';
import { useHandleAsyncError } from '@/utils/handleAsyncError';
import { zodResolver } from '@primevue/forms/resolvers/zod';
import { onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { z } from 'zod';

const { t } = useI18n();
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

// Départements liés
const allDepartments = ref([]);
const linkedDepartmentIds = ref([]);
const loadingDepts = ref(false);

async function loadDepartments() {
    const { result } = await handleAsyncError(
        () => DepartmentService.get(),
        (val) => (loadingDepts.value = val)
    );
    if (result?.departments) {
        allDepartments.value = result.departments;
    }
    // Pré-sélectionner le département actuel du programme
    if (props.program?.departmentId) {
        linkedDepartmentIds.value = [props.program.departmentId];
    }
}

const showRestoreDialog = ref(false);
const restoreMessage = ref('');

async function saveDepartmentLink() {
    if (!prgId.value) return;
    try {
        const response = await DepartmentService.Departprogram({ programId: prgId.value, departmentIds: linkedDepartmentIds.value, indRecurrent: props.program?.indRecurrent ?? true });
        emit('saved', prgId.value);
    } catch (err) {
        if (err?.response?.status === 409) {
            restoreMessage.value = err.response.data?.message || t('liSavePrgFirst');
            showRestoreDialog.value = true;
        } else {
            const { error } = await handleAsyncError(() => Promise.reject(err), null, true);
        }
    }
}

async function confirmRestore() {
    const { error } = await handleAsyncError(
        () => DepartmentService.restoreDepartmentProgram(prgId.value, linkedDepartmentIds.value, props.program?.indRecurrent ?? true),
        null,
        true
    );
    showRestoreDialog.value = false;
    if (!error) {
        emit('saved', prgId.value);
    }
}

async function forceCreate() {
    const { error } = await handleAsyncError(
        () => DepartmentService.Departprogram({ programId: prgId.value, departmentIds: linkedDepartmentIds.value, indRecurrent: props.program?.indRecurrent ?? true, forceCreate: true }),
        null,
        true
    );
    showRestoreDialog.value = false;
    if (!error) {
        emit('saved', prgId.value);
    }
}

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

onMounted(() => loadDepartments());
</script>

<template>
    <Fluid>
        <!-- Mode édition : avec tabs -->
        <Tabs v-if="prgId" value="infos">
            <TabList>
                <Tab value="infos"><i class="pi pi-pencil mr-2"></i>{{ $t('liDetail') }}</Tab>
                <Tab value="departments"><i class="pi pi-sitemap mr-2"></i>{{ $t('Department') }}</Tab>
            </TabList>
            <TabPanels>
                <TabPanel value="infos">
                    <Form :resolver="resolver" :initialValues="initialValues" @submit="onFormSubmit" class="pt-4">
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
                            <Button type="submit" size="small" :label="$t('btnUpdate')" :loading="loading" icon="pi pi-save" />
                        </div>
                    </Form>
                </TabPanel>
                <TabPanel value="departments">
                    <div class="pt-4">
                        <div class="flex flex-col gap-4">
                            <MultiSelect v-model="linkedDepartmentIds" :options="allDepartments" optionLabel="name" optionValue="id"
                                :placeholder="$t('liSelectDepart')" filter display="chip" class="w-full" :loading="loadingDepts" />
                            <div class="flex justify-end">
                                <Button :label="$t('Save')" icon="pi pi-check" size="small" @click="saveDepartmentLink" />
                            </div>
                        </div>
                    </div>
                </TabPanel>
            </TabPanels>
        </Tabs>

        <!-- Mode ajout : formulaire simple sans tabs -->
        <Form v-else :resolver="resolver" :initialValues="initialValues" @submit="onFormSubmit">
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
                <Button type="submit" size="small" :label="$t('Save')" :loading="loading" icon="pi pi-save" />
            </div>
        </Form>

        <!-- Dialog restauration -->
        <Dialog v-model:visible="showRestoreDialog" :header="$t('liConfirm')" modal :style="{ width: '450px' }" :breakpoints="{ '575px': '90vw' }">
            <div class="flex flex-col gap-4">
                <p class="m-0">{{ restoreMessage }}</p>
                <div class="flex justify-end gap-2">
                    <Button :label="$t('liCreateNew')" severity="secondary" size="small" @click="forceCreate" />
                    <Button :label="$t('liRestore')" icon="pi pi-refresh" size="small" @click="confirmRestore" />
                </div>
            </div>
        </Dialog>
    </Fluid>
</template>
