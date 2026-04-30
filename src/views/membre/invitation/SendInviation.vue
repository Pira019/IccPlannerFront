<template>
    <Fluid>
        <Tabs :value="activeTab">
            <TabList>
                <Tab value="single"><i class="pi pi-user mr-2"></i>{{ $t('invitation.single') }}</Tab>
                <Tab value="bulk"><i class="pi pi-file-excel mr-2"></i>{{ $t('invitation.bulk') }}</Tab>
            </TabList>

            <!-- Invitation unitaire -->
            <TabPanels>
                <TabPanel value="single">
                    <Form :resolver="resolver" @submit="onFormSubmit" class="mt-4">
                        <div class="flex flex-col">
                            <div class="flex flex-col gap-2 mb-4">
                                <FormField v-slot="$field" name="firstName" class="flex flex-col gap-1">
                                    <label class="font-semibold text-sm">{{ $t('lifirstName') }} *</label>
                                    <InputText v-model="$field.value" maxlength="55" />
                                    <Message v-if="$field?.invalid" severity="error" size="small" variant="simple">{{ $field.error?.message }}</Message>
                                </FormField>
                            </div>
                            <div class="flex flex-col gap-2 mb-2">
                                <FormField v-slot="$field" name="email" class="flex flex-col gap-1">
                                    <label class="font-semibold text-sm">{{ $t('email') }} *</label>
                                    <InputText v-model="$field.value" maxlength="55" />
                                    <Message v-if="$field?.invalid" severity="error" size="small" variant="simple">{{ $field.error?.message }}</Message>
                                </FormField>
                            </div>
                            <div class="flex flex-col mb-4">
                                <ResponseComponent :error="errorReq" />
                            </div>
                            <div class="flex items-center">
                                <div class="flex items-center gap-2">
                                    <Checkbox v-model="sendOtherchecked" :binary="true" inputId="other" />
                                    <label for="other">{{ $t('liSendOther') }}</label>
                                </div>
                                <div class="flex gap-2 ml-auto">
                                    <Button type="button" class="truncate" severity="danger" size="small" @click="closeDialog" outlined :label="$t('Cancel')" icon="pi pi-times" />
                                    <Button type="submit" class="truncate" size="small" :label="$t('Save')" :loading="loadingReq" icon="pi pi-save" />
                                </div>
                            </div>
                        </div>
                    </Form>
                </TabPanel>

                <!-- Import Excel -->
                <TabPanel value="bulk">
                    <div class="flex flex-col gap-4 mt-4">
                        <p class="text-sm text-muted-color">
                            {{ $t('invitation.bulkDesc') }}
                        </p>
                        <FileUpload
                            mode="basic"
                            accept=".xlsx,.xls"
                            :maxFileSize="5000000"
                            :auto="false"
                            :chooseLabel="$t('invitation.chooseFile')"
                            @select="onFileSelect"
                        />
                        <div v-if="selectedFile" class="text-sm flex items-center gap-2">
                            <i class="pi pi-file-excel text-green-600"></i>
                            {{ selectedFile.name }}
                        </div>

                        <!-- Résultat -->
                        <div v-if="bulkResult" class="p-3 rounded-lg bg-surface-50 dark:bg-surface-800 text-sm">
                            <div class="flex gap-4 mb-2">
                                <span class="text-green-600"><i class="pi pi-check mr-1"></i>{{ $t('invitation.sent') }}: {{ bulkResult.sent }}</span>
                                <span v-if="bulkResult.skipped > 0" class="text-orange-500"><i class="pi pi-exclamation-triangle mr-1"></i>{{ $t('invitation.skipped') }}: {{ bulkResult.skipped }}</span>
                            </div>
                            <ul v-if="bulkResult.errors?.length > 0" class="list-disc pl-4 text-muted-color">
                                <li v-for="(err, i) in bulkResult.errors" :key="i">{{ err }}</li>
                            </ul>
                        </div>

                        <ResponseComponent :error="bulkError" />

                        <div class="flex gap-2 justify-end">
                            <Button type="button" severity="danger" size="small" @click="closeDialog" outlined :label="$t('Cancel')" icon="pi pi-times" />
                            <Button type="button" size="small" :label="$t('invitation.import')" :loading="bulkLoading" icon="pi pi-upload" :disabled="!selectedFile" @click="onBulkImport" />
                        </div>
                    </div>
                </TabPanel>
            </TabPanels>
        </Tabs>
    </Fluid>
</template>

<script setup>
import ResponseComponent from '@/components/ResponseComponent.vue';
import InvitationService from '@/service/InvitationService';
import { useHandleAsyncError } from '@/utils/handleAsyncError';
import { zodResolver } from '@primevue/forms/resolvers/zod';
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import z from 'zod';

const { t } = useI18n();
const emit = defineEmits(['closeModal']);
const props = defineProps({
    idDept: { default: null }
});

const resolver = zodResolver(
    z.object({
        firstName: z.preprocess((val) => val ?? '', z.string().nonempty().max(55)),
        email: z.preprocess((val) => val ?? '', z.string().email().nonempty()),
    })
);

const { handleAsyncError } = useHandleAsyncError();

const activeTab = ref('single');
const errorReq = ref(null);
const sendOtherchecked = ref(false);
const loadingReq = ref(false);

// Bulk
const selectedFile = ref(null);
const bulkLoading = ref(false);
const bulkError = ref(null);
const bulkResult = ref(null);

const onFormSubmit = async ({ valid, values, reset }) => {
    if (!valid) { return; }

    const payload = { ...values, departmentID: props.idDept };

    const { error } = await handleAsyncError(
        () => InvitationService.sendInvitation(payload),
        (val) => (loadingReq.value = val),
        true,
        'liMsgSendInv'
    );

    if (error) {
        errorReq.value = error;
        return;
    }

    if (sendOtherchecked.value) {
        reset();
        return;
    }
    closeDialog();
};

function onFileSelect(event) {
    selectedFile.value = event.files?.[0] || null;
    bulkResult.value = null;
    bulkError.value = null;
}

async function onBulkImport() {
    if (!selectedFile.value) { return; }

    bulkResult.value = null;
    bulkError.value = null;

    const { result, error } = await handleAsyncError(
        () => InvitationService.bulkInvite(selectedFile.value, props.idDept),
        (val) => (bulkLoading.value = val)
    );

    if (error) {
        bulkError.value = error;
        return;
    }

    bulkResult.value = result;
}

function closeDialog() {
    emit('closeDialog');
}
</script>
