<script setup>
import AccountService from '@/service/AccountService';
import { useHandleAsyncError } from '@/utils/handleAsyncError';
import { onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';

const { handleAsyncError } = useHandleAsyncError();
const route = useRoute();
const router = useRouter();
const { t } = useI18n();

const appLogo = import.meta.env.VITE_APP_LOGO;

const loading = ref(true);
const success = ref(false);
const errorMessage = ref(null);

onMounted(async () => {
    const userId = route.query.userId;
    const code = route.query.token;

    if (!userId || !code) {
        errorMessage.value = t('auth.confirmEmailInvalidLink');
        loading.value = false;
        return;
    }

    const { error } = await handleAsyncError(async () => await AccountService.confirmEmail(userId, code));

    if (error) {
        errorMessage.value = error?.message || t('auth.confirmEmailErrorDefault');
    } else {
        success.value = true;
    }

    loading.value = false;
});

function goToLogin() {
    router.push({ name: 'login' });
}
</script>

<template>
    <div class="bg-surface-50 dark:bg-surface-950 flex flex-col items-center justify-center min-h-screen min-w-[100vw] overflow-hidden">
        <div class="flex flex-col items-center justify-center">
            <div style="border-radius: 56px; padding: 0.3rem; background: linear-gradient(180deg, var(--primary-color) 10%, rgba(33, 150, 243, 0) 30%)">
                <div class="w-full bg-surface-0 dark:bg-surface-900 py-20 px-8 sm:px-20" style="border-radius: 53px">
                    <div class="text-center mb-8">
                        <Image :src="appLogo" image-class="mb-8 w-40 shrink-0 mx-auto" width="500" />
                    </div>

                    <!-- Loading -->
                    <div v-if="loading" class="text-center">
                        <ProgressSpinner style="width: 50px; height: 50px" />
                        <p class="mt-4 text-muted-color">{{ t('auth.confirmEmailLoading') }}</p>
                    </div>

                    <!-- Succès -->
                    <div v-else-if="success" class="text-center">
                        <i class="pi pi-check-circle text-green-500 text-6xl mb-4"></i>
                        <h2 class="text-surface-900 dark:text-surface-0 text-2xl font-medium mb-4">{{ t('auth.confirmEmailSuccess') }}</h2>
                        <p class="text-muted-color mb-8">{{ t('auth.confirmEmailSuccessDesc') }}</p>
                        <Button :label="t('auth.goToLogin')" @click="goToLogin" class="w-full md:w-auto" />
                    </div>

                    <!-- Erreur -->
                    <div v-else class="text-center">
                        <i class="pi pi-times-circle text-red-500 text-6xl mb-4"></i>
                        <h2 class="text-surface-900 dark:text-surface-0 text-2xl font-medium mb-4">{{ t('auth.confirmEmailError') }}</h2>
                        <p class="text-muted-color mb-8">{{ errorMessage }}</p>
                        <Button :label="t('auth.goToLogin')" @click="goToLogin" class="w-full md:w-auto" severity="secondary" />
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
