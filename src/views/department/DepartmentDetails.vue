<script setup>
import PageComponent from '@/components/PageComponent.vue';
import DepartmentService from '@/service/DepartmentService';
import { useHandleAsyncError } from '@/utils/handleAsyncError';
import { onMounted, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

const { t, locale } = useI18n();
const { handleAsyncError } = useHandleAsyncError();

const props = defineProps({
    id: { type: [String, Number], required: true }
});

const loading = ref(false);
const department = ref(null);

async function fetchData() {
    const { result } = await handleAsyncError(() => DepartmentService.getDetail(props.id), (val) => (loading.value = val));
    if (result) {
        department.value = result;
    }
}

function formatDate(dateStr) {
    if (!dateStr) { return '—'; }
    return new Date(dateStr + 'T00:00:00').toLocaleDateString(locale.value, { day: 'numeric', month: 'long', year: 'numeric' });
}

onMounted(() => fetchData());
watch(() => props.id, () => fetchData());
</script>

<template>
    <PageComponent :title-page="department?.name || $t('liDepart')" :show-add-btn="false">
        <div v-if="loading" class="flex justify-center py-12">
            <ProgressSpinner />
        </div>

        <template v-else-if="department">
            <!-- Info cards -->
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                <div class="bg-primary/10 rounded-xl p-5 flex items-center gap-4">
                    <div class="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                        <i class="pi pi-users text-primary text-xl"></i>
                    </div>
                    <div>
                        <div class="text-2xl font-bold">{{ department.memberCount }}</div>
                        <div class="text-sm text-muted-color">{{ $t('Members') }}</div>
                    </div>
                </div>
                <div class="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-5 flex items-center gap-4">
                    <div class="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-800/30 flex items-center justify-center">
                        <i class="pi pi-id-card text-blue-600 text-xl"></i>
                    </div>
                    <div>
                        <div class="text-2xl font-bold">{{ department.postes.length }}</div>
                        <div class="text-sm text-muted-color">Postes</div>
                    </div>
                </div>
                <div class="bg-green-50 dark:bg-green-900/20 rounded-xl p-5 flex items-center gap-4">
                    <div class="w-12 h-12 rounded-full bg-green-100 dark:bg-green-800/30 flex items-center justify-center">
                        <i class="pi pi-calendar text-green-600 text-xl"></i>
                    </div>
                    <div>
                        <div class="text-sm text-muted-color">{{ $t('liDateStart') }}</div>
                        <div class="text-sm font-semibold">{{ formatDate(department.startDate) }}</div>
                    </div>
                </div>
            </div>

            <!-- Ministry -->
            <div v-if="department.ministryName" class="mb-4 text-sm text-muted-color">
                <i class="pi pi-building mr-1"></i> {{ department.ministryName }}
            </div>

            <!-- Description -->
            <div v-if="department.description" class="mb-6 p-4 bg-surface-50 dark:bg-surface-800 rounded-xl">
                <h3 class="text-sm font-semibold text-muted-color mb-2">{{ $t('Description') }}</h3>
                <p class="text-sm m-0">{{ department.description }}</p>
            </div>

            <!-- Programs -->
            <div v-if="department.programs.length > 0" class="mb-6">
                <h3 class="text-lg font-semibold mb-4 flex items-center gap-2">
                    <i class="pi pi-calendar text-primary"></i>
                    {{ $t('Programs') }} ({{ department.programCount }})
                </h3>
                <div class="flex flex-wrap gap-2">
                    <Tag v-for="prg in department.programs" :key="prg.programId"
                        :value="prg.shortName || prg.programName"
                        :severity="prg.indRecurrent ? 'info' : 'secondary'" rounded />
                </div>
            </div>

            <!-- Members list -->
            <div class="mb-6">
                <h3 class="text-lg font-semibold mb-4 flex items-center gap-2">
                    <i class="pi pi-users text-primary"></i>
                    {{ $t('Members') }} ({{ department.memberCount }})
                </h3>
                <div v-if="department.members.length === 0" class="text-sm text-muted-color py-4">{{ $t('liNoMembers') }}</div>
                <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    <div v-for="(m, idx) in department.members" :key="idx"
                        class="flex items-center gap-3 p-3 rounded-lg border border-surface-200 dark:border-surface-700">
                        <div class="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                            {{ (m.displayName?.[0] || '?').toUpperCase() }}
                        </div>
                        <div class="flex-1 min-w-0">
                            <div class="font-medium text-sm truncate">{{ m.displayName }}</div>
                            <div class="flex flex-wrap gap-1 mt-0.5">
                                <Tag v-for="p in m.postes" :key="p" :value="p" severity="secondary" class="text-[0.6rem]" />
                                <Tag v-if="m.status" :value="m.status" :severity="m.status === 'Active' ? 'success' : 'warn'" class="text-[0.6rem]" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Postes -->
            <div>
                <h3 class="text-lg font-semibold mb-4 flex items-center gap-2">
                    <i class="pi pi-id-card text-primary"></i>
                    Postes ({{ department.postes.length }})
                </h3>
                <div v-if="department.postes.length === 0" class="text-sm text-muted-color py-4">Aucun poste.</div>
                <div v-else class="flex flex-wrap gap-2">
                    <Tag v-for="p in department.postes" :key="p.id" :value="p.name" severity="info" rounded />
                </div>
            </div>
        </template>
    </PageComponent>
</template>
