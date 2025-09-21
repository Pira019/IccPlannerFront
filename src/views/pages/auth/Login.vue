<script setup>
import LangConfiguration from '@/components/LangConfiguration.vue';
import ErrorComponent from '@/components/ResponseComponent.vue';
import AppConfigurator from '@/layout/AppConfigurator.vue';
import AccountService from '@/service/AccountService';
import { useAuthStore } from '@/store/Auth';
import { useHandleAsyncError } from '@/utils/handleAsyncError';
import { RouteName } from '@/utils/RouteName';
import { LoginValidator } from '@/validations/LoginValidator';
import { useForm } from 'vee-validate';
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const { handleAsyncError } = useHandleAsyncError();
const router = useRouter();

const appName = import.meta.env.VITE_APP_NAME;

const { errors, defineField, handleSubmit, isSubmitting } = useForm({
    validationSchema: LoginValidator
});

const errorMessage = ref(null);
const useAuth = useAuthStore();

/**
 * Soumission du formulaire login.
 */
const onSubmit = handleSubmit.withControlled(async (values) => {
    const credentials = JSON.stringify(values);
    const { error } = await handleAsyncError(async () => await AccountService.login(credentials));

    if (error) {
        errorMessage.value = error;
        return;
    }

    var redirectPath = RouteName.DashBoard;
    if (useAuth.redirectPath != null) {
        redirectPath = useAuth.redirectPath;
    }
    router.push({ name: redirectPath });
});

const [email, emailAttrs] = defineField('email');
const [password, passwordAttrs] = defineField('password');
const [remember, rememberAttrs] = defineField('remember');
</script>

<template>
    <LangConfiguration is-login-page="true" />
    <AppConfigurator />
    <div class="bg-surface-50 dark:bg-surface-950 flex flex-col items-center justify-center min-h-screen min-w-[100vw] overflow-hidden">
        <div class="flex flex-col items-center justify-center">
            <div style="border-radius: 56px; padding: 0.3rem; background: linear-gradient(180deg, var(--primary-color) 10%, rgba(33, 150, 243, 0) 30%)">
                <div class="w-full bg-surface-0 dark:bg-surface-900 py-20 px-8 sm:px-20" style="border-radius: 53px">
                    <div class="text-center mb-8">
                        <Image src="/images/LOGO-GRIS.png" image-class="mb-8 w-40 shrink-0 mx-auto" width="500" />
                        <div class="text-surface-900 dark:text-surface-0 text-3xl font-medium mb-4">{{ appName }}</div>
                        <span class="text-muted-color font-medium">{{ $t('singInText') }}</span>
                    </div>

                    <div class="fw-full md:w-[30rem] mb-4" v-if="errorMessage">
                        <div class="text-wrap">
                            <ErrorComponent :error="errorMessage" />
                        </div>
                    </div>

                    <form @submit="onSubmit">
                        <div>
                            <label for="email1" class="block text-surface-900 dark:text-surface-0 text-xl font-medium mb-2">Email</label>
                            <InputText id="email1" :invalid="!!errors.email" type="email" v-model="email" name="email" :emailAttrs :placeholder="$t('emailAddress')" class="w-full md:w-[30rem]" :class="errors.email ? 'mb-2' : 'mb-8'" />
                            <Message size="small" severity="error" variant="simple" class="mb-6" v-if="errors.email"> {{ errors.email }}</Message>

                            <label for="password1" class="block text-surface-900 dark:text-surface-0 font-medium text-xl mb-2">{{ $t('password') }}</label>
                            <Password
                                id="password1"
                                :invalid="!!errors.password"
                                name="password"
                                v-model="password"
                                :passwordAttrs
                                :placeholder="$t('password')"
                                :toggleMask="true"
                                :class="errors.email ? 'mb-2' : 'mb-4'"
                                fluid
                                :feedback="false"
                            ></Password>
                            <Message size="small" severity="error" variant="simple" v-if="errors.password" class="mb-4"> {{ errors.password }}</Message>

                            <div class="flex items-center justify-between mt-2 mb-8 gap-8">
                                <div class="flex items-center">
                                    <Checkbox id="remember1" binary class="mr-2" v-model="remember" :rememberAttrs></Checkbox>
                                    <label for="remember1">{{ $t('rememberMe') }}</label>
                                </div>
                                <span class="font-medium no-underline ml-2 text-right cursor-pointer text-primary"> {{ $t('forgotPassword') }} </span>
                            </div>
                            <Button :label="$t('signIn')" :loading="isSubmitting" type="submit" class="w-full mr-2"></Button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.pi-eye {
    transform: scale(1.6);
    margin-right: 1rem;
}

.pi-eye-slash {
    transform: scale(1.6);
    margin-right: 1rem;
}
</style>
