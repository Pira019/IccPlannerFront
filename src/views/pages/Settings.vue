<script setup>
import DepartmentService from '@/service/DepartmentService';
import ProgramService from '@/service/ProgramService';
import SettingsService from '@/service/SettingsService';
import { useHandleAsyncError } from '@/utils/handleAsyncError';
import { onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const { handleAsyncError } = useHandleAsyncError();

const loading = ref(false);
const saving = ref(false);

const globalDeadline = ref(3);
const globalUnit = ref('days');

const unitOptions = [
    { label: t('settings.unitDays'), value: 'days' },
    { label: t('settings.unitHours'), value: 'hours' }
];

// Règles
const programRules = ref([]);
const showProgramDialog = ref(false);
const editingProgramRule = ref(null);
const programForm = ref({ programName: '', deadline: 3, unit: 'days' });

const departmentRules = ref([]);
const showDepartmentDialog = ref(false);
const editingDeptRule = ref(null);
const deptForm = ref({ departmentName: '', deadline: 3, unit: 'days' });

// Listes pour les selects
const availablePrograms = ref([]);
const availableDepartments = ref([]);

async function loadData() {
    const { result } = await handleAsyncError(
        () => SettingsService.getDeadlines(),
        (val) => (loading.value = val)
    );
    if (result) {
        globalDeadline.value = result.globalDeadline;
        globalUnit.value = result.globalUnit;
        programRules.value = result.programRules || [];
        departmentRules.value = result.departmentRules || [];
    }

    // Charger programmes et départements pour les selects
    const { result: prgs } = await handleAsyncError(() => ProgramService.getAll());
    if (prgs) { availablePrograms.value = prgs.map(p => p.name); }

    const { result: depts } = await handleAsyncError(() => DepartmentService.get());
    if (depts?.departments) { availableDepartments.value = depts.departments.map(d => d.name); }
}

function openProgramDialog(rule = null) {
    editingProgramRule.value = rule;
    programForm.value = rule ? { programName: rule.name, deadline: rule.deadline, unit: rule.unit } : { programName: '', deadline: 3, unit: 'days' };
    showProgramDialog.value = true;
}

function saveProgramRule() {
    if (editingProgramRule.value) {
        editingProgramRule.value.name = programForm.value.programName;
        editingProgramRule.value.deadline = programForm.value.deadline;
        editingProgramRule.value.unit = programForm.value.unit;
    } else {
        programRules.value.push({ id: 0, name: programForm.value.programName, deadline: programForm.value.deadline, unit: programForm.value.unit });
    }
    showProgramDialog.value = false;
}

async function removeProgramRule(rule) {
    if (rule.id > 0) {
        await handleAsyncError(() => SettingsService.deleteRule(rule.id));
    }
    programRules.value = programRules.value.filter(r => r !== rule);
}

function openDeptDialog(rule = null) {
    editingDeptRule.value = rule;
    deptForm.value = rule ? { departmentName: rule.name, deadline: rule.deadline, unit: rule.unit } : { departmentName: '', deadline: 3, unit: 'days' };
    showDepartmentDialog.value = true;
}

function saveDeptRule() {
    if (editingDeptRule.value) {
        editingDeptRule.value.name = deptForm.value.departmentName;
        editingDeptRule.value.deadline = deptForm.value.deadline;
        editingDeptRule.value.unit = deptForm.value.unit;
    } else {
        departmentRules.value.push({ id: 0, name: deptForm.value.departmentName, deadline: deptForm.value.deadline, unit: deptForm.value.unit });
    }
    showDepartmentDialog.value = false;
}

async function removeDeptRule(rule) {
    if (rule.id > 0) {
        await handleAsyncError(() => SettingsService.deleteRule(rule.id));
    }
    departmentRules.value = departmentRules.value.filter(r => r !== rule);
}

function formatDeadline(rule) {
    return `${rule.deadline} ${rule.unit === 'days' ? t('settings.unitDays') : t('settings.unitHours')}`;
}

async function saveSettings() {
    const payload = {
        globalDeadline: globalDeadline.value,
        globalUnit: globalUnit.value,
        programRules: programRules.value.map(r => ({ name: r.name, deadline: r.deadline, unit: r.unit })),
        departmentRules: departmentRules.value.map(r => ({ name: r.name, deadline: r.deadline, unit: r.unit }))
    };
    await handleAsyncError(
        () => SettingsService.saveDeadlines(payload),
        (val) => (saving.value = val),
        true,
        'settings.saved'
    );
}

onMounted(() => loadData());
</script>

<template>
    <PageComponent :title-page="t('settings.title')" :show-add-btn="false"
        :breadcrumbs="[{ label: t('settings.title') }]">
        <div v-if="loading" class="flex justify-center py-12"><ProgressSpinner /></div>
        <template v-else>

        <!-- Global -->
        <div class="border border-surface-200 dark:border-surface-700 rounded-lg p-5 mb-4">
            <h2 class="text-lg font-semibold mb-1 flex items-center gap-2">
                <i class="pi pi-cog text-primary"></i>{{ t('settings.globalSection') }}
            </h2>
            <p class="text-sm text-muted-color mt-0 mb-4">{{ t('settings.globalSectionDesc') }}</p>
            <div class="flex items-center gap-2 max-w-md">
                <InputNumber v-model="globalDeadline" :min="0" :max="30" showButtons class="w-24" />
                <Select v-model="globalUnit" :options="unitOptions" optionLabel="label" optionValue="value" class="w-32" />
                <span class="text-sm text-muted-color">{{ t('settings.beforeProgram') }}</span>
            </div>
            <small class="text-muted-color mt-2 block">{{ t('settings.deadlineHelp') }}</small>
        </div>

        <!-- Par programme -->
        <div class="border border-surface-200 dark:border-surface-700 rounded-lg p-5 mb-4">
            <div class="flex items-center justify-between mb-4">
                <div>
                    <h2 class="text-lg font-semibold mb-0 flex items-center gap-2"><i class="pi pi-calendar-times text-primary"></i>{{ t('settings.programSection') }}</h2>
                    <p class="text-sm text-muted-color mt-1 mb-0">{{ t('settings.programSectionDesc') }}</p>
                </div>
                <Button icon="pi pi-plus" :label="t('Add')" size="small" @click="openProgramDialog()" />
            </div>
            <div v-if="programRules.length === 0" class="text-center py-6 text-muted-color text-sm">{{ t('settings.noProgramRules') }}</div>
            <div v-else class="flex flex-col gap-2">
                <div v-for="rule in programRules" :key="rule.id || rule.name" class="flex items-center justify-between bg-surface-50 dark:bg-surface-800 rounded-lg px-4 py-3">
                    <div><span class="font-medium text-sm">{{ rule.name }}</span><Tag :value="formatDeadline(rule)" severity="info" class="ml-2" rounded /></div>
                    <div class="flex gap-1">
                        <Button icon="pi pi-pencil" text rounded size="small" @click="openProgramDialog(rule)" />
                        <Button icon="pi pi-trash" text rounded size="small" severity="danger" @click="removeProgramRule(rule)" />
                    </div>
                </div>
            </div>
        </div>

        <!-- Par département -->
        <div class="border border-surface-200 dark:border-surface-700 rounded-lg p-5 mb-4">
            <div class="flex items-center justify-between mb-4">
                <div>
                    <h2 class="text-lg font-semibold mb-0 flex items-center gap-2"><i class="pi pi-sitemap text-primary"></i>{{ t('settings.deptSection') }}</h2>
                    <p class="text-sm text-muted-color mt-1 mb-0">{{ t('settings.deptSectionDesc') }}</p>
                </div>
                <Button icon="pi pi-plus" :label="t('Add')" size="small" @click="openDeptDialog()" />
            </div>
            <div v-if="departmentRules.length === 0" class="text-center py-6 text-muted-color text-sm">{{ t('settings.noDeptRules') }}</div>
            <div v-else class="flex flex-col gap-2">
                <div v-for="rule in departmentRules" :key="rule.id || rule.name" class="flex items-center justify-between bg-surface-50 dark:bg-surface-800 rounded-lg px-4 py-3">
                    <div><span class="font-medium text-sm">{{ rule.name }}</span><Tag :value="formatDeadline(rule)" severity="warn" class="ml-2" rounded /></div>
                    <div class="flex gap-1">
                        <Button icon="pi pi-pencil" text rounded size="small" @click="openDeptDialog(rule)" />
                        <Button icon="pi pi-trash" text rounded size="small" severity="danger" @click="removeDeptRule(rule)" />
                    </div>
                </div>
            </div>
        </div>

        <div class="flex justify-end mt-4">
            <Button :label="t('Save')" icon="pi pi-check" :loading="saving" @click="saveSettings" />
        </div>

        </template>

        <!-- Dialog Programme -->
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

        <!-- Dialog Département -->
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
