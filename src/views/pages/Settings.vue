<script setup>
import { onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

const loading = ref(false);
const saving = ref(false);

// Paramètre global par défaut
const globalDeadline = ref(3);
const globalUnit = ref('days');

const unitOptions = [
    { label: 'Jours', value: 'days' },
    { label: 'Heures', value: 'hours' }
];

// Règles par programme
const programRules = ref([]);
const showProgramDialog = ref(false);
const editingProgramRule = ref(null);
const programForm = ref({ programName: '', deadline: 3, unit: 'days' });

// Règles par département
const departmentRules = ref([]);
const showDepartmentDialog = ref(false);
const editingDeptRule = ref(null);
const deptForm = ref({ departmentName: '', deadline: 3, unit: 'days' });

// Mock programmes et départements disponibles
const availablePrograms = ref([
    'Culte de célébration', 'École du dimanche', 'Culte du soir', 'Prière du mercredi', 'Répétition chorale'
]);
const availableDepartments = ref([
    'Louange', 'Technique', 'Accueil', 'Protocole', 'Média', 'Intercession'
]);

// Mock data
function loadMockData() {
    programRules.value = [
        { id: 1, programName: 'Culte de célébration', deadline: 2, unit: 'days' },
        { id: 2, programName: 'Culte du soir', deadline: 1, unit: 'days' }
    ];
    departmentRules.value = [
        { id: 1, departmentName: 'Louange', deadline: 3, unit: 'days' },
        { id: 2, departmentName: 'Technique', deadline: 12, unit: 'hours' }
    ];
}

function openProgramDialog(rule = null) {
    editingProgramRule.value = rule;
    programForm.value = rule ? { ...rule } : { programName: '', deadline: 3, unit: 'days' };
    showProgramDialog.value = true;
}

function saveProgramRule() {
    if (editingProgramRule.value) {
        Object.assign(editingProgramRule.value, programForm.value);
    } else {
        programRules.value.push({ id: Date.now(), ...programForm.value });
    }
    showProgramDialog.value = false;
}

function removeProgramRule(rule) {
    programRules.value = programRules.value.filter((r) => r.id !== rule.id);
}

function openDeptDialog(rule = null) {
    editingDeptRule.value = rule;
    deptForm.value = rule ? { ...rule } : { departmentName: '', deadline: 3, unit: 'days' };
    showDepartmentDialog.value = true;
}

function saveDeptRule() {
    if (editingDeptRule.value) {
        Object.assign(editingDeptRule.value, deptForm.value);
    } else {
        departmentRules.value.push({ id: Date.now(), ...deptForm.value });
    }
    showDepartmentDialog.value = false;
}

function removeDeptRule(rule) {
    departmentRules.value = departmentRules.value.filter((r) => r.id !== rule.id);
}

function formatDeadline(rule) {
    return `${rule.deadline} ${rule.unit === 'days' ? 'jour(s)' : 'heure(s)'}`;
}

async function saveSettings() {
    saving.value = true;
    try {
        // TODO: appeler l'API PUT /settings
        await new Promise((r) => setTimeout(r, 500));
    } finally {
        saving.value = false;
    }
}

onMounted(() => {
    loadMockData();
});
</script>

<template>
    <PageComponent :title-page="t('settings.title')" :subtitle="t('settings.subtitle')" :show-add-btn="false">

        <!-- Section 1: Paramètre global -->
        <div class="border border-surface-200 dark:border-surface-700 rounded-lg p-5 mb-4">
            <h2 class="text-lg font-semibold mb-1 flex items-center gap-2">
                <i class="pi pi-cog text-primary"></i>
                {{ t('settings.globalSection') }}
            </h2>
            <p class="text-sm text-muted-color mt-0 mb-4">{{ t('settings.globalSectionDesc') }}</p>
            <div class="flex items-center gap-2 max-w-md">
                <InputNumber v-model="globalDeadline" :min="0" :max="30" showButtons class="w-24" />
                <Select v-model="globalUnit" :options="unitOptions" optionLabel="label" optionValue="value" class="w-32" />
                <span class="text-sm text-muted-color">{{ t('settings.beforeProgram') }}</span>
            </div>
            <small class="text-muted-color mt-2 block">{{ t('settings.deadlineHelp') }}</small>
        </div>

        <!-- Section 2: Par programme -->
        <div class="border border-surface-200 dark:border-surface-700 rounded-lg p-5 mb-4">
            <div class="flex items-center justify-between mb-4">
                <div>
                    <h2 class="text-lg font-semibold mb-0 flex items-center gap-2">
                        <i class="pi pi-calendar-times text-primary"></i>
                        {{ t('settings.programSection') }}
                    </h2>
                    <p class="text-sm text-muted-color mt-1 mb-0">{{ t('settings.programSectionDesc') }}</p>
                </div>
                <Button icon="pi pi-plus" :label="t('Add')" size="small" @click="openProgramDialog()" />
            </div>

            <div v-if="programRules.length === 0" class="text-center py-6 text-muted-color text-sm">
                {{ t('settings.noProgramRules') }}
            </div>
            <div v-else class="flex flex-col gap-2">
                <div v-for="rule in programRules" :key="rule.id" class="flex items-center justify-between bg-surface-50 dark:bg-surface-800 rounded-lg px-4 py-3">
                    <div>
                        <span class="font-medium text-sm">{{ rule.programName }}</span>
                        <Tag :value="formatDeadline(rule)" severity="info" class="ml-2" rounded />
                    </div>
                    <div class="flex gap-1">
                        <Button icon="pi pi-pencil" text rounded size="small" @click="openProgramDialog(rule)" />
                        <Button icon="pi pi-trash" text rounded size="small" severity="danger" @click="removeProgramRule(rule)" />
                    </div>
                </div>
            </div>
        </div>

        <!-- Section 3: Par département -->
        <div class="border border-surface-200 dark:border-surface-700 rounded-lg p-5 mb-4">
            <div class="flex items-center justify-between mb-4">
                <div>
                    <h2 class="text-lg font-semibold mb-0 flex items-center gap-2">
                        <i class="pi pi-sitemap text-primary"></i>
                        {{ t('settings.deptSection') }}
                    </h2>
                    <p class="text-sm text-muted-color mt-1 mb-0">{{ t('settings.deptSectionDesc') }}</p>
                </div>
                <Button icon="pi pi-plus" :label="t('Add')" size="small" @click="openDeptDialog()" />
            </div>

            <div v-if="departmentRules.length === 0" class="text-center py-6 text-muted-color text-sm">
                {{ t('settings.noDeptRules') }}
            </div>
            <div v-else class="flex flex-col gap-2">
                <div v-for="rule in departmentRules" :key="rule.id" class="flex items-center justify-between bg-surface-50 dark:bg-surface-800 rounded-lg px-4 py-3">
                    <div>
                        <span class="font-medium text-sm">{{ rule.departmentName }}</span>
                        <Tag :value="formatDeadline(rule)" severity="warn" class="ml-2" rounded />
                    </div>
                    <div class="flex gap-1">
                        <Button icon="pi pi-pencil" text rounded size="small" @click="openDeptDialog(rule)" />
                        <Button icon="pi pi-trash" text rounded size="small" severity="danger" @click="removeDeptRule(rule)" />
                    </div>
                </div>
            </div>
        </div>

        <!-- Save all -->
        <div class="flex justify-end mt-4">
            <Button :label="t('Save')" icon="pi pi-check" :loading="saving" @click="saveSettings" />
        </div>

        <!-- Dialog: Programme -->
        <Dialog v-model:visible="showProgramDialog" :header="editingProgramRule ? t('settings.editProgramRule') : t('settings.addProgramRule')" modal class="w-full max-w-md">
            <div class="flex flex-col gap-4">
                <div class="flex flex-col gap-2">
                    <label class="text-sm font-medium">{{ t('prgName') }}</label>
                    <Select v-model="programForm.programName" :options="availablePrograms" :placeholder="t('settings.selectProgram')" class="w-full" />
                </div>
                <div class="flex flex-col gap-2">
                    <label class="text-sm font-medium">{{ t('settings.deadlineLabel') }}</label>
                    <div class="flex items-center gap-2">
                        <InputNumber v-model="programForm.deadline" :min="0" :max="30" showButtons class="w-24" />
                        <Select v-model="programForm.unit" :options="unitOptions" optionLabel="label" optionValue="value" class="w-32" />
                    </div>
                </div>
            </div>
            <template #footer>
                <Button :label="t('Cancel')" severity="secondary" outlined @click="showProgramDialog = false" />
                <Button :label="t('Save')" icon="pi pi-check" @click="saveProgramRule" :disabled="!programForm.programName" />
            </template>
        </Dialog>

        <!-- Dialog: Département -->
        <Dialog v-model:visible="showDepartmentDialog" :header="editingDeptRule ? t('settings.editDeptRule') : t('settings.addDeptRule')" modal class="w-full max-w-md">
            <div class="flex flex-col gap-4">
                <div class="flex flex-col gap-2">
                    <label class="text-sm font-medium">{{ t('Department') }}</label>
                    <Select v-model="deptForm.departmentName" :options="availableDepartments" :placeholder="t('liSelectDepart')" class="w-full" />
                </div>
                <div class="flex flex-col gap-2">
                    <label class="text-sm font-medium">{{ t('settings.deadlineLabel') }}</label>
                    <div class="flex items-center gap-2">
                        <InputNumber v-model="deptForm.deadline" :min="0" :max="30" showButtons class="w-24" />
                        <Select v-model="deptForm.unit" :options="unitOptions" optionLabel="label" optionValue="value" class="w-32" />
                    </div>
                </div>
            </div>
            <template #footer>
                <Button :label="t('Cancel')" severity="secondary" outlined @click="showDepartmentDialog = false" />
                <Button :label="t('Save')" icon="pi pi-check" @click="saveDeptRule" :disabled="!deptForm.departmentName" />
            </template>
        </Dialog>
    </PageComponent>
</template>