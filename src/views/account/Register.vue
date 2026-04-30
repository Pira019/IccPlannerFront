<script setup>
import LoadingDialogComponent from '@/components/LoadingDialogComponent.vue';
import AccountService from '@/service/AccountService';
import InvitationService from '@/service/InvitationService';
import { useHandleAsyncError } from '@/utils/handleAsyncError';
import { zodResolver } from '@primevue/forms/resolvers/zod';
import { useSetFieldValue } from 'vee-validate';
import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { z } from 'zod';
import Login from '../pages/auth/Login.vue';

const route = useRoute()
const router = useRouter()
const { handleAsyncError } = useHandleAsyncError();

const formReady = ref(false)
const isSubmitting = ref(false);

const invitationId = route.query.invitationId || route.query.invitation;
const code = route.query.code ;

const password = ref("")
const confirmPassword = ref("")

const errorReq = ref(null)

const invitationData = ref({
  email: '',
  name: '',
  departmentName: '',
})

const loadingReq = ref(false)
const desabledBtn = ref(false)

const passwordsMismatch = computed(() => {
  return password.value !== confirmPassword.value
})

const onFormSubmit = async ({ valid, values }) => {

 if (!valid || passwordsMismatch.value) return; // les autres validations Zod ont échoué


    const payload = {
        ...values,
        invitationId
    }

    console.log(payload)

    const { error } = await handleAsyncError(
    () =>  AccountService.register(payload),
    (val) => (loadingReq.value = val),
    true,
    'msgCompteCreer'
    );

    if(!error)
    {
        router.push({name:'login',
                    state:{email: invitationData.value.email}
        });
        return;
    }
    errorReq.value = error;

}

onMounted(async () => {
const { error, result } = await handleAsyncError(
        () => InvitationService.findInvalid(invitationId),
        (val) => (loadingReq.value = val)
    );

    formReady.value = true;;
    if(error){
        errorReq.value = error
        desabledBtn.value = true;
        return;
    }
    invitationData.value.email = result.email ?? ''
    invitationData.value.name = result.firstName ?? ''
    invitationData.value.departmentName = result.departmentName ?? ''

    useSetFieldValue

    desabledBtn.value = false;
});
// Validator
const passwordSchema  = z.preprocess(
    (val) => val ?? "",
    z.string()
      .nonempty()
      .min(8)
      .refine(val => /[A-Z]/.test(val), { message: "lipassword.uppercase" })
      .refine(val => /[0-9]/.test(val), { message: "lipassword.digit" })
  )

const schema = z.object({
  code: z.preprocess(
    (val) => val ?? "",
    z.string().regex(/^\+?[0-9]{4}$/).optional().or(z.literal(""))
  ),
  name: z.preprocess((val) => val ?? "", z.string().nonempty().max(55)),
  lastName: z.preprocess((val) => val ?? "", z.string().nonempty().max(55)),
  sexe: z.preprocess((val) => val ?? "", z.enum(["M", "F"])),
  tel: z.preprocess(
    (val) => val ?? "",
    z.string().regex(/^\+?[0-9]{10,15}$/).optional().or(z.literal(""))
  ),
  city: z.preprocess((val) => val ?? "", z.string().max(55).optional().or(z.literal(""))),
  quarter: z.preprocess((val) => val ?? "", z.string().max(55).optional().or(z.literal(""))),

  password: passwordSchema,
  confirmPassword: z.preprocess(
    (val) => val ?? "",
    z.string())
})

const resolver = zodResolver(schema);
</script>

<template>
    <Login>
        <template #errorContent>
            <div class="mb-5">
                <Message v-if="!invitationId" severity="error" >
                    {{ $t('liIncorrectLink') }}
                </Message>
                <loading-dialog-component v-else :on-loading="loadingReq" :error-req="errorReq" />
            </div>
        </template>
        <template #content>
            <Fluid>
                <Form v-if="formReady" :resolver="resolver" :initial-values="invitationData" @submit="onFormSubmit" novalidate>
                    <div class="flex flex-col sm:flex-row gap-6 mb-5">
                        <FloatLabel variant="on" class="flex-1 w-full">
                            <FormField v-slot="$field" name="code" class="flex-auto">
                                <label class="block font-semibold mb-2">{{ $t('liCode') }} <span class="text-red-500">*</span></label>
                                <InputText autofocus  v-model="code" placeholder="XXXX" minlength="4" maxlength="4"  v-keyfilter.num inputmode="mumeric"/>
                                <Message class="my-1 " v-if="$field?.invalid" severity="error" size="small" variant="simple">{{ $field.error?.message }}</Message>
                            </FormField>
                        </FloatLabel>
                    </div>
                    <div class="flex flex-col sm:flex-row gap-6 mb-5">
                        <FloatLabel variant="on" class="flex-1 w-full">
                            <FormField v-slot="$field" name="name" class="flex-auto">
                                <label class="block font-semibold mb-2">{{ $t('lifirstName') }} <span class="text-red-500">*</span></label>
                                <InputText  v-model="$field.value" maxlength="55" />
                                <Message v-if="$field?.invalid" class="my-1" severity="error" size="small" variant="simple">{{ $field.error?.message }}</Message>
                            </FormField>
                        </FloatLabel>
                        <FloatLabel variant="on" class="flex-1 w-full">
                            <FormField v-slot="$field" name="lastName" class="flex-auto">
                                <label for="lastName" class="block font-semibold mb-2">{{ $t('colName') }} <span class="text-red-500">*</span></label>
                                <InputText v-model="$field.value" maxlength="55" />
                                <Message class="my-1" v-if="$field?.invalid" severity="error" size="small" variant="simple">{{ $field.error?.message }}</Message>
                            </FormField>
                        </FloatLabel>
                    </div>
                    <div class="flex flex-col sm:flex-row gap-6 mb-5">
                        <FloatLabel variant="on" class="flex-1 w-full">
                            <FormField class="flex-auto" name="email">
                                <label class="block font-semibold mb-2">{{ $t('emailAddress') }} <span class="text-red-500">*</span></label>
                                <InputText disabled v-model="invitationData.email"  />
                            </FormField>
                        </FloatLabel>
                    </div>
                    <div v-if="invitationData.departmentName" class="mb-5 p-3 bg-primary/5 rounded-lg flex items-center gap-2">
                        <i class="pi pi-sitemap text-primary"></i>
                        <span class="text-sm">{{ $t('Department') }} : <span class="font-semibold">{{ invitationData.departmentName }}</span></span>
                    </div>
                    <div class="flex flex-col sm:flex-row gap-6 mb-5">
                        <FormField v-slot="$field" name="sexe" class="w-full">
                            <label :class="{'text-red-500' : $field.invalid }" class="block mb-3 font-medium">{{ $t('liSex') }} <span class="text-red-500">*</span></label>
                                <RadioButtonGroup  v-model="$field.value" name="sexe" class="flex gap-6">
                                    <div class="flex items-center gap-2">
                                        <RadioButton inputId="fem" value="F" />
                                        <label for="fem" class="cursor-pointer">{{ $t('liFemale')}}</label>
                                    </div>
                                    <div class="flex items-center gap-2">
                                        <RadioButton inputId="mas" value="M" />
                                        <label for="mas" class="cursor-pointer">{{ $t('liMale') }}</label>
                                    </div>
                            </RadioButtonGroup>
                            <Message v-if="$field?.invalid" severity="error" size="small"  class="mt-2" variant="simple">{{ $field.error?.message }}</Message>
                        </FormField>
                    </div>
                     <div class="flex flex-col sm:flex-row gap-6 mb-5">
                        <FloatLabel variant="on" class="flex-1 w-full">
                            <FormField v-slot="$field" name="city" class="flex-auto">
                                <label class="block mb-2">{{ $t('liCity') }}</label>
                                <InputText v-keyfilter.alpha  v-model="$field.value" maxlength="55" />
                                <Message v-if="$field?.invalid" severity="error" size="small" variant="simple">{{ $field.error?.message }}</Message>
                            </FormField>
                        </FloatLabel>
                        <FloatLabel variant="on" class="flex-1 w-full">
                            <FormField v-slot="$field" name="quarter" class="flex-auto">
                                <label class="block mb-2">{{ $t('liQuarter') }}</label>
                                <InputText v-keyfilter.alpha v-model="$field.value" maxlength="55"  placeholder="Aymer,Plateau" />
                                <Message v-if="$field?.invalid" severity="error" size="small" variant="simple">{{ $field.error?.message }}</Message>
                            </FormField>
                        </FloatLabel>
                    </div>
                    <div class="flex flex-col sm:flex-row gap-6 mb-5">
                        <FloatLabel variant="on" class="flex-1 w-full">
                            <FormField v-slot="$field" name="tel" class="flex-auto">
                                <label :class="{'text-red-500' : $field.invalid }" class="block font-semibold mb-2">{{ $t('liTel') }}</label>
                                <InputText minlength="10" maxlength="15"  v-model="$field.value" v-keyfilter.num inputmode="mumeric"/>
                                <Message class="my-1 " v-if="$field?.invalid" severity="error" size="small" variant="simple">{{ $field.error?.message }}</Message>
                            </FormField>
                        </FloatLabel>
                    </div>
                    <div class="flex flex-col sm:flex-row gap-6 mb-5">
                            <FormField v-slot="$field" name="password" class="flex-auto">
                                <label :class="{'text-red-500' : $field.invalid }" class="block mb-2">{{ $t('password') }} <span class="text-red-500">*</span></label>
                                <Password  v-model="password"  :feedback="false" :toggleMask="true"  class="w-full"/>
                                 <Message v-if="$field.invalid" severity="error" size="small" variant="simple">
                                    <ul class="my-1 flex flex-col gap-1">
                                        <li v-for="(error, index) of $field.errors" :key="index">
                                             {{ $t(error.message ?? error) }}
                                        </li>
                                    </ul>
                                </Message>
                            </FormField>
                    </div>
                    <div class="flex flex-col sm:flex-row gap-6 mb-5">
                        <FormField v-slot="$field" name="confirmPassword" class="flex-auto">
                            <label :class="
                            {'text-red-500' : $field.invalid }" class="block mb-2">{{ $t('passwordConfir') }} <span class="text-red-500">*</span></label>
                             <Password  v-model="confirmPassword" :feedback="false" toggleMask  class="w-full "/>
                             <Message v-if="$field.invalid" severity="error" size="small" variant="simple">
                                    {{ $t($field.error?.message ?? $field.error) }}
                              </Message>
                              <Message
                                    v-if="passwordsMismatch"
                                    severity="error"
                                    size="small"
                                    variant="simple">
                                    {{ $t('lipassword.confirmMismatch') }}
                                </Message>
                                                    </FormField>
                                                </div>
                    <Button :label="$t('createCompte')" :loading="isSubmitting" :disabled="desabledBtn" type="submit" class="w-full mr-2"></Button>
                </Form>
            </Fluid>
        </template>
    </Login>
</template>
