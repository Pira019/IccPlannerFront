<script setup>
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

const props = defineProps({
    loading: {
        type: Boolean,
        default: false
    },
    programs: {
        type: Array,
        default: () => []
    }
});

// Demo data for development - will be replaced by real API data
const demoPrograms = [
    {
        id: 1,
        name: 'Culte de célébration',
        date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        department: 'Louange et Adoration'
    },
    {
        id: 2,
        name: 'Atmosphère de prière',
        date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        department: 'Intercession'
    },
    {
        id: 3,
        name: 'École du dimanche',
        date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        department: 'Éducation chrétienne'
    },
    {
        id: 4,
        name: 'Réunion de jeunes',
        date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
        department: 'Jeunesse'
    },
    {
        id: 5,
        name: 'Baptême',
        date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        department: 'Pastorale'
    }
];

const displayPrograms = computed(() => {
    return props.programs.length > 0 ? props.programs : demoPrograms;
});

const isEmpty = computed(() => {
    return !props.loading && props.programs.length === 0 && demoPrograms.length === 0;
});

const formatDate = (date) => {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleDateString('fr-FR', {
        weekday: 'short',
        day: 'numeric',
        month: 'short'
    });
};

const getDaysUntil = (date) => {
    if (!date) return 0;
    const now = new Date();
    const target = new Date(date);
    const diffTime = target.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

const getTagSeverity = (date) => {
    const days = getDaysUntil(date);
    if (days <= 2) return 'danger';
    if (days <= 7) return 'warn';
    return 'info';
};
</script>

<template>
    <div class="card">
        <div class="flex items-center justify-between mb-6">
            <div class="font-semibold text-xl">{{ t('dashboard.upcomingPrograms', 'Prochains programmes') }}</div>
            <Button
                :label="t('liSeeMore', 'Voir tout')"
                icon="pi pi-arrow-right"
                iconPos="right"
                text
                size="small"
                class="!p-0"
            />
        </div>

        <!-- Skeleton loader -->
        <template v-if="loading">
            <div class="flex flex-col gap-4">
                <div v-for="i in 5" :key="i" class="flex items-center gap-4 p-3 rounded-lg border border-surface-200 dark:border-surface-700">
                    <Skeleton shape="circle" size="2.5rem" />
                    <div class="flex-1">
                        <Skeleton width="60%" height="1rem" class="mb-2" />
                        <Skeleton width="40%" height="0.75rem" />
                    </div>
                    <Skeleton width="4rem" height="1.5rem" borderRadius="1rem" />
                </div>
            </div>
        </template>

        <!-- Empty state -->
        <template v-else-if="isEmpty">
            <div class="flex flex-col items-center justify-center py-8 text-center">
                <div class="flex items-center justify-center w-16 h-16 rounded-full bg-surface-100 dark:bg-surface-700 mb-4">
                    <i class="pi pi-calendar text-3xl text-muted-color"></i>
                </div>
                <span class="text-lg font-medium text-surface-900 dark:text-surface-0 mb-2">
                    {{ t('dashboard.noProgramsTitle', 'Aucun programme à venir') }}
                </span>
                <span class="text-muted-color text-sm">
                    {{ t('dashboard.noProgramsDesc', 'Les prochains programmes apparaîtront ici') }}
                </span>
            </div>
        </template>

        <!-- Programs list -->
        <template v-else>
            <div class="flex flex-col gap-3">
                <div
                    v-for="program in displayPrograms"
                    :key="program.id"
                    class="flex items-center gap-4 p-3 rounded-lg border border-surface-200 dark:border-surface-700 hover:bg-surface-50 dark:hover:bg-surface-800 transition-colors cursor-pointer"
                >
                    <!-- Calendar icon with date -->
                    <div class="flex flex-col items-center justify-center w-12 h-12 rounded-lg bg-primary-100 dark:bg-primary-400/10">
                        <span class="text-xs font-medium text-primary-600 dark:text-primary-400 uppercase">
                            {{ new Date(program.date).toLocaleDateString('fr-FR', { month: 'short' }) }}
                        </span>
                        <span class="text-lg font-bold text-primary-700 dark:text-primary-300 leading-none">
                            {{ new Date(program.date).getDate() }}
                        </span>
                    </div>

                    <!-- Program info -->
                    <div class="flex-1 min-w-0">
                        <div class="font-medium text-surface-900 dark:text-surface-0 truncate">
                            {{ program.name }}
                        </div>
                        <div class="flex items-center gap-2 text-sm text-muted-color">
                            <i class="pi pi-sitemap text-xs"></i>
                            <span class="truncate">{{ program.department }}</span>
                        </div>
                    </div>

                    <!-- Days until tag -->
                    <Tag
                        :value="getDaysUntil(program.date) === 0 
                            ? t('dashboard.today', 'Aujourd\'hui') 
                            : getDaysUntil(program.date) === 1 
                                ? t('dashboard.tomorrow', 'Demain')
                                : `${getDaysUntil(program.date)} ${t('dashboard.days', 'jours')}`"
                        :severity="getTagSeverity(program.date)"
                        rounded
                    />
                </div>
            </div>
        </template>
    </div>
</template>
