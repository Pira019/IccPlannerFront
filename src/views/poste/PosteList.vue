<script setup>
import PageComponent from '@/components/PageComponent.vue';
import DepartmentService from '@/service/DepartmentService';
import PosteService from '@/service/PosteService';
import { useHandleAsyncError } from '@/utils/handleAsyncError';
import { computed, onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const { handleAsyncError } = useHandleAsyncError();

const postes = ref([]);
const loading = ref(false);
const showDialog = ref(false);
const editingPoste = ref(null);
const form = ref({ name: '', description: '', shortName: '', indGest: false });
const saving = ref(false);
const errorMsg = ref(null);

// Filtre departement
const departmentLst = ref([]);
const departLoading = ref(false);
const departmentSelected = ref(null);
const departmentPostes = ref(null); // postes du departement selectionne

const filteredPostes = computed(() => {
    if (!departmentSelected.value || !departmentPostes.value) return postes.value;
    const ids = departmentPostes.value.map(p => p.id);
    return postes.value.filter(p => ids.includes(p.id));
});

async function loadPostes() {
    const { result } = await handleAsyncError(() => PosteService.getAll(), (val) => (loading.value = val));
    if (result) { postes.value = result; }
}

async function loadDepartments() {
    const { result } = await handleAsyncError(() => DepartmentService.get(), (val) => (departLoading.value = val));
    if (result) { departmentLst.value = result.departments; }
}

async function onDepartmentChange(deptId) {
    if (!deptId) { departmentPostes.value = null; return; }
    const { result } = await handleAsyncError(() => DepartmentService.getPostes(deptId));
    if (result) { departmentPostes.value = result; }
}

function openAdd() {
    editingPoste.value = null;
    form.value = { name: '', description: '', shortName: '', indGest: false };
    errorMsg.value = null;
    showDialog.value = true;
}

function openEdit(poste) {
    editingPoste.value = poste;
    form.value = { name: poste.name, description: poste.description || '', shortName: poste.shortName || '', indGest: poste.indGest || false };
    errorMsg.value = null;
    showDialog.value = true;
}

async function save() {
    errorMsg.value = null;
    if (editingPoste.value) {
        const { error } = await handleAsyncError(
            () => PosteService.update(editingPoste.value.id, form.value),
            (val) => (saving.value = val), true
        );
        if (error) { errorMsg.value = error.message; return; }
    } else {
        const { error } = await handleAsyncError(
            () => PosteService.create(form.value),
            (val) => (saving.value = val), true
        );
        if (error) { errorMsg.value = error.message; return; }
    }
    showDialog.value = false;
    loadPostes();
}

async function deletePoste(poste) {
    const { error } = await handleAsyncError(() => PosteService.delete(poste.id), null, true);
    if (!error) { loadPostes(); }
}

onMounted(() => {
    loadPostes();
    loadDepartments();
});
</script>

<template>
    <PageComponent title-page="Postes" @btn-add="openAdd" :show-add-btn="true"
        :breadcrumbs="[{ label: 'Postes' }]">
        <!-- Filtre departement -->
        <div class="mb-4">
            <Select v-model="departmentSelected" :options="departmentLst" optionValue="id" optionLabel="name"
                :loading="departLoading" filter showClear :placeholder="$t('liSelectDepart')"
                class="w-full md:w-[350px]" @change="onDepartmentChange(departmentSelected)" />
        </div>

        <div v-if="loading" class="flex justify-center py-8"><ProgressSpinner /></div>
        <div v-else-if="filteredPostes.length === 0" class="text-center py-8 text-muted-color">Aucun poste.</div>
        <div v-else class="flex flex-col gap-2">
            <div v-for="p in filteredPostes" :key="p.id"
                class="flex items-center justify-between p-4 rounded-lg border border-surface-200 dark:border-surface-700">
                <div>
                    <div class="font-medium">{{ p.name }}</div>
                    <div class="text-xs text-muted-color">{{ p.shortName }}</div>
                </div>
                <div class="flex gap-1">
                    <Button v-if="!p.indSystem" icon="pi pi-pencil" text rounded size="small" @click="openEdit(p)" />
                    <Button v-if="!p.indSystem" icon="pi pi-trash" text rounded size="small" severity="danger" @click="deletePoste(p)" />
                </div>
            </div>
        </div>

        <Dialog v-model:visible="showDialog" :header="editingPoste ? 'Modifier le poste' : 'Ajouter un poste'" modal :style="{ width: '400px' }">
            <div class="flex flex-col gap-4">
                <div class="flex flex-col gap-1">
                    <label class="font-semibold text-sm">{{ $t('Name') }} *</label>
                    <InputText v-model="form.name" />
                </div>
                <div class="flex flex-col gap-1">
                    <label class="font-semibold text-sm">{{ $t('Description') }}</label>
                    <Textarea v-model="form.description" rows="2" />
                </div>
                <div class="flex flex-col gap-1">
                    <label class="font-semibold text-sm">Abreviation</label>
                    <InputText v-model="form.shortName" maxlength="15" />
                </div>
                <div class="flex items-center gap-2">
                    <Checkbox v-model="form.indGest" :binary="true" inputId="indGest" />
                    <label for="indGest" class="text-sm">Droit de gestion (IndGest)</label>
                </div>
                <Message v-if="errorMsg" severity="error" size="small">{{ errorMsg }}</Message>
            </div>
            <template #footer>
                <Button :label="$t('Cancel')" text @click="showDialog = false" />
                <Button :label="$t('Save')" icon="pi pi-check" :loading="saving" @click="save" :disabled="!form.name" />
            </template>
        </Dialog>
    </PageComponent>
</template>
