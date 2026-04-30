<script setup>
import AccountService from '@/service/AccountService';
import { useHandleAsyncError } from '@/utils/handleAsyncError';
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';

const { t } = useI18n();
const { handleAsyncError } = useHandleAsyncError();
const route = useRoute();
const router = useRouter();

const email = ref('');
const userId = ref(route.query.uid || '');
const token = ref(route.query.token || '');
const newPassword = ref('');
const confirmPassword = ref('');
const loading = ref(false);
const success = ref(false);
const errorMsg = ref(null);

async function submit() {
    errorMsg.value = null;
    if (newPassword.value !== confirmPassword.value) {
        errorMsg.value = t('auth.passwordMismatch');
        return;
    }
    if (newPassword.value.length < 8) {
        errorMsg.value = t('auth.passwordTooShort');
        return;
    }

    const { error } = await handleAsyncError(
        () => AccountService.resetPassword(userId.value, token.value, newPassword.value),
        (val) => (loading.value = val)
    );
    if (error) { errorMsg.value = error.message; return; }
    success.value = true;
}
</script>

<template>
    <div class="bg-surface-50 dark:bg-surface-950 flex items-center justify-center min-h-screen p-4">
        <div class="w-full max-w-md">
            <div class="flex justify-end mb-4">
                <LangConfiguration />
            </div>
            <div class="bg-surface-0 dark:bg-surface-900 rounded-2xl shadow-lg p-8">
                <div class="text-center mb-6">
                    <div class="text-2xl font-bold mb-2">{{ t('auth.resetTitle') }}</div>
                </div>

                <template v-if="!success">
                    <div class="flex flex-col gap-4">
                        <div class="flex flex-col gap-2">
                            <label class="font-semibold text-sm">{{ t('auth.newPassword') }}</label>
                            <Password v-model="newPassword" toggleMask :feedback="true" fluid />
                        </div>
                        <div class="flex flex-col gap-2">
                            <label class="font-semibold text-sm">{{ t('auth.confirmPassword') }}</label>
                            <Password v-model="confirmPassword" toggleMask :feedback="false" fluid />
                        </div>
                        <Message v-if="errorMsg" severity="error" :closable="true" @close="errorMsg = null">{{ errorMsg }}</Message>
                        <Button :label="t('auth.resetBtn')" icon="pi pi-lock" :loading="loading" @click="submit" :disabled="!newPassword || !confirmPassword" />
                    </div>
                    <div class="text-center mt-4">
                        <router-link to="/auth/login" class="text-primary text-sm font-medium">{{ t('auth.backToLogin') }}</router-link>
                    </div>
                </template>

                <template v-else>
                    <div class="text-center py-6">
                        <i class="pi pi-check-circle text-4xl text-green-500 mb-4"></i>
                        <p class="text-sm mb-4">{{ t('auth.resetSuccess') }}</p>
                        <Button :label="t('auth.backToLogin')" @click="router.push('/auth/login')" />
                    </div>
                </template>
            </div>
        </div>
    </div>
</template>
