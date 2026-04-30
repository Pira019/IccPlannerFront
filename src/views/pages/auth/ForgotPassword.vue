<script setup>
import LangConfiguration from '@/components/LangConfiguration.vue';
import AccountService from '@/service/AccountService';
import { useHandleAsyncError } from '@/utils/handleAsyncError';
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const { handleAsyncError } = useHandleAsyncError();

const email = ref('');
const loading = ref(false);
const sent = ref(false);
const errorMsg = ref(null);

async function submit() {
    if (!email.value) { return; }
    errorMsg.value = null;
    const { error } = await handleAsyncError(
        () => AccountService.forgotPassword(email.value),
        (val) => (loading.value = val)
    );
    if (error) { errorMsg.value = error.message; return; }
    sent.value = true;
}
</script>

<template>
    <div class="bg-surface-50 dark:bg-surface-950 flex items-center justify-center min-h-screen p-4">
        <div class="w-full max-w-md">
            <!-- Language switcher -->
            <div class="flex justify-end mb-4">
                <LangConfiguration />
            </div>
            <div class="bg-surface-0 dark:bg-surface-900 rounded-2xl shadow-lg p-8">
                <div class="text-center mb-6">
                    <div class="text-2xl font-bold mb-2">{{ t('auth.forgotTitle') }}</div>
                    <p class="text-sm text-muted-color">{{ t('auth.forgotDesc') }}</p>
                </div>

                <template v-if="!sent">
                    <div class="flex flex-col gap-4">
                        <div class="flex flex-col gap-2">
                            <label class="font-semibold text-sm">{{ t('email') }}</label>
                            <InputText v-model="email" type="email" :placeholder="t('email')" @keyup.enter="submit" />
                        </div>
                        <Message v-if="errorMsg" severity="error" :closable="true" @close="errorMsg = null">{{ errorMsg }}</Message>
                        <div class="flex gap-2">
                            <router-link to="/auth/login" class="flex-1">
                                <Button :label="t('Cancel')" icon="pi pi-arrow-left" severity="secondary" outlined class="w-full" />
                            </router-link>
                            <Button :label="t('auth.sendResetLink')" icon="pi pi-envelope" :loading="loading" @click="submit" :disabled="!email" class="flex-1" />
                        </div>
                    </div>
                </template>

                <template v-else>
                    <div class="text-center py-6">
                        <i class="pi pi-check-circle text-4xl text-green-500 mb-4"></i>
                        <p class="text-sm">{{ t('auth.forgotSent') }}</p>
                    </div>
                </template>

                <div class="text-center mt-6">
                    <router-link to="/auth/login" class="text-primary text-sm font-medium">{{ t('auth.backToLogin') }}</router-link>
                </div>
            </div>
        </div>
    </div>
</template>
