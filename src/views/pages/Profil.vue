<script setup>
import MemberService from '@/service/MemberService';
import { useAuthStore } from '@/store/Auth';
import { useHandleAsyncError } from '@/utils/handleAsyncError';
import { computed, onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const { handleAsyncError } = useHandleAsyncError();
const auth = useAuthStore();

const loading = ref(false);
const editing = ref(false);
const profile = ref(null);
const form = ref({});

const initials = computed(() => {
    if (!profile.value) return '?';
    return `${(profile.value.name?.[0] || '').toUpperCase()}${(profile.value.lastName?.[0] || '').toUpperCase()}`;
});

const memberSince = computed(() => {
    if (!profile.value?.entryDate) return '';
    return new Date(profile.value.entryDate + 'T00:00:00').toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
});

async function fetchProfile() {
    const { result, error } = await handleAsyncError(
        () => MemberService.getMyProfile(),
        (val) => (loading.value = val)
    );
    if (!error && result) {
        profile.value = result;
    }
    form.value = { ...profile.value };
}

function formatBirthDate(bd) {
    if (!bd) { return '—'; }
    const [m, d] = bd.split('-');
    return `${d} ${new Date(2000, parseInt(m) - 1).toLocaleDateString('fr-FR', { month: 'long' })}`;
}

function startEditing() {
    form.value = { ...profile.value };
    // Parse birthDate "MM-dd" into separate fields
    if (profile.value?.birthDate) {
        const [m, d] = profile.value.birthDate.split('-');
        form.value.birthMonth = parseInt(m);
        form.value.birthDay = parseInt(d);
    }
    editing.value = true;
}

function cancelEditing() {
    editing.value = false;
    form.value = { ...profile.value };
}

async function saveProfile() {
    const birthDate = form.value.birthMonth && form.value.birthDay
        ? `${String(form.value.birthMonth).padStart(2, '0')}-${String(form.value.birthDay).padStart(2, '0')}`
        : null;

    const { error } = await handleAsyncError(
        () => MemberService.updateProfile({
            name: form.value.name,
            lastName: form.value.lastName,
            sexe: form.value.sexe,
            city: form.value.city,
            quarter: form.value.quarter,
            birthDate: birthDate,
            phoneNumber: form.value.phoneNumber
        }),
        null,
        true
    );
    if (!error) {
        await fetchProfile();
        editing.value = false;
    }
}

onMounted(() => fetchProfile());
</script>

<template>
    <div class="card">
        <!-- Loading -->
        <div v-if="loading" class="flex justify-center py-12">
            <ProgressSpinner />
        </div>

        <template v-else-if="profile">
            <!-- Profile header -->
            <div class="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-surface-200 dark:border-surface-700">
                <div class="relative">
                    <div class="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center text-primary text-3xl font-bold">
                        {{ initials }}
                    </div>
                </div>
                <div class="flex-1 text-center sm:text-left">
                    <h1 class="text-2xl font-bold m-0">{{ profile.name }} {{ profile.lastName }}</h1>
                    <p class="text-muted-color mt-1 mb-0">{{ profile.email }}</p>
                    <div class="flex flex-wrap gap-2 mt-2 justify-center sm:justify-start">
                        <Tag v-for="dept in profile.departments" :key="dept.departmentId" :value="dept.departmentName" severity="primary" rounded />
                    </div>
                    <p v-if="memberSince" class="text-xs text-muted-color mt-2 mb-0">
                        <i class="pi pi-calendar mr-1"></i>{{ t('profil.memberSince') }} {{ memberSince }}
                    </p>
                </div>
                <div>
                    <Button v-if="!editing" icon="pi pi-pencil" :label="t('profil.edit')" outlined @click="startEditing" />
                </div>
            </div>

            <!-- Personal info section -->
            <div class="mt-6">
                <h2 class="text-lg font-semibold mb-4 flex items-center gap-2">
                    <i class="pi pi-user text-primary"></i>
                    {{ t('profil.personalInfo') }}
                </h2>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div class="flex flex-col gap-2">
                        <label class="text-sm font-medium text-muted-color">{{ t('lifirstName') }}</label>
                        <InputText v-if="editing" v-model="form.name" />
                        <span v-else class="text-sm">{{ profile.name }}</span>
                    </div>
                    <div class="flex flex-col gap-2">
                        <label class="text-sm font-medium text-muted-color">{{ t('Name') }}</label>
                        <InputText v-if="editing" v-model="form.lastName" />
                        <span v-else class="text-sm">{{ profile.lastName || '—' }}</span>
                    </div>
                    <div class="flex flex-col gap-2">
                        <label class="text-sm font-medium text-muted-color">{{ t('liSex') }}</label>
                        <Select v-if="editing" v-model="form.sexe" :options="[{ label: t('liMale'), value: 'M' }, { label: t('liFemale'), value: 'F' }]" optionLabel="label" optionValue="value" class="w-full" />
                        <span v-else class="text-sm">{{ profile.sexe === 'M' ? t('liMale') : profile.sexe === 'F' ? t('liFemale') : '—' }}</span>
                    </div>
                    <div class="flex flex-col gap-2">
                        <label class="text-sm font-medium text-muted-color">{{ t('profil.birthDate') }}</label>
                        <div v-if="editing" class="flex items-center gap-2">
                            <Select v-model="form.birthDay" :options="Array.from({length: 31}, (_, i) => ({label: String(i+1).padStart(2,'0'), value: i+1}))" optionLabel="label" optionValue="value" :placeholder="t('liDay')" class="w-24" />
                            <Select v-model="form.birthMonth" :options="Array.from({length: 12}, (_, i) => ({label: new Date(2000, i).toLocaleDateString('fr-FR', {month: 'long'}), value: i+1}))" optionLabel="label" optionValue="value" :placeholder="t('liMonth')" class="w-40" />
                        </div>
                        <span v-else class="text-sm">{{ formatBirthDate(profile.birthDate) }}</span>
                    </div>
                </div>
            </div>

            <!-- Contact section -->
            <div class="mt-6">
                <h2 class="text-lg font-semibold mb-4 flex items-center gap-2">
                    <i class="pi pi-envelope text-primary"></i>
                    {{ t('profil.contact') }}
                </h2>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div class="flex flex-col gap-2">
                        <label class="text-sm font-medium text-muted-color">{{ t('emailAddress') }}</label>
                        <InputText v-if="editing" :modelValue="profile.email" disabled class="opacity-50" />
                        <span v-else class="text-sm">{{ profile.email || '—' }}</span>
                    </div>
                    <div class="flex flex-col gap-2">
                        <label class="text-sm font-medium text-muted-color">{{ t('liTel') }}</label>
                        <InputText v-if="editing" v-model="form.phoneNumber" />
                        <span v-else class="text-sm">{{ profile.phoneNumber || '—' }}</span>
                    </div>
                    <div class="flex flex-col gap-2">
                        <label class="text-sm font-medium text-muted-color">{{ t('liCity') }}</label>
                        <InputText v-if="editing" v-model="form.city" />
                        <span v-else class="text-sm">{{ profile.city || '—' }}</span>
                    </div>
                    <div class="flex flex-col gap-2">
                        <label class="text-sm font-medium text-muted-color">{{ t('liQuarter') }}</label>
                        <InputText v-if="editing" v-model="form.quarter" />
                        <span v-else class="text-sm">{{ profile.quarter || '—' }}</span>
                    </div>
                </div>
            </div>

            <!-- Departments & function -->
            <div class="mt-6">
                <h2 class="text-lg font-semibold mb-4 flex items-center gap-2">
                    <i class="pi pi-sitemap text-primary"></i>
                    {{ t('profil.ministry') }}
                </h2>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div class="flex flex-col gap-2">
                        <label class="text-sm font-medium text-muted-color">{{ t('Department') }}</label>
                        <div class="flex flex-wrap gap-1">
                            <Tag v-for="dept in profile.departments" :key="dept.departmentId" :value="dept.departmentName" severity="secondary" rounded />
                            <span v-if="!profile.departments?.length" class="text-sm text-muted-color">—</span>
                        </div>
                    </div>
                    <div class="flex flex-col gap-2">
                        <label class="text-sm font-medium text-muted-color">{{ t('Ministry') }}</label>
                        <div class="flex flex-wrap gap-1">
                            <Tag v-for="dept in profile.departments" :key="dept.departmentId" :value="dept.ministryName || '—'" severity="info" rounded />
                        </div>
                    </div>
                </div>
            </div>

            <!-- Action buttons (editing mode) -->
            <div v-if="editing" class="flex justify-end gap-2 mt-6 pt-4 border-t border-surface-200 dark:border-surface-700">
                <Button :label="t('Cancel')" severity="secondary" outlined @click="cancelEditing" />
                <Button :label="t('Save')" icon="pi pi-check" @click="saveProfile" />
            </div>
        </template>
    </div>
</template>
