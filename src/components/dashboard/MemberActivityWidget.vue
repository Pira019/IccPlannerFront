<script setup>
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

const props = defineProps({
    loading: {
        type: Boolean,
        default: false
    },
    activities: {
        type: Array,
        default: () => []
    }
});

// Demo data for development - will be replaced by real API data
const demoActivities = [
    {
        id: 1,
        memberName: 'Marie Dupont',
        type: 'inscription',
        description: 'A rejoint le département Louange et Adoration',
        timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000)
    },
    {
        id: 2,
        memberName: 'Jean Mbala',
        type: 'disponibilite',
        description: 'Disponibilité soumise pour Juin 2025',
        timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000)
    },
    {
        id: 3,
        memberName: 'Sarah Kouassi',
        type: 'inscription',
        description: 'A rejoint le département Intercession',
        timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000)
    },
    {
        id: 4,
        memberName: 'Paul Ndiaye',
        type: 'disponibilite',
        description: 'Disponibilité soumise pour Juin 2025',
        timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
    },
    {
        id: 5,
        memberName: 'Ruth Ekambi',
        type: 'inscription',
        description: 'A rejoint le département Jeunesse',
        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
    }
];

const displayActivities = computed(() => {
    return props.activities.length > 0 ? props.activities : demoActivities;
});

const isEmpty = computed(() => {
    return !props.loading && props.activities.length === 0 && demoActivities.length === 0;
});

const activityConfig = {
    inscription: {
        icon: 'pi-user-plus',
        color: 'text-green-500',
        bg: 'bg-green-100 dark:bg-green-400/10',
        tagSeverity: 'success'
    },
    disponibilite: {
        icon: 'pi-calendar-plus',
        color: 'text-blue-500',
        bg: 'bg-blue-100 dark:bg-blue-400/10',
        tagSeverity: 'info'
    }
};

const getActivityConfig = (type) => {
    return activityConfig[type] || activityConfig.inscription;
};

const getActivityLabel = (type) => {
    if (type === 'inscription') return t('dashboard.activityInscription', 'Inscription');
    if (type === 'disponibilite') return t('dashboard.activityDisponibilite', 'Disponibilité');
    return type;
};

const formatTimeAgo = (timestamp) => {
    if (!timestamp) return '';
    const now = new Date();
    const date = new Date(timestamp);
    const diffMs = now.getTime() - date.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMinutes < 60) return t('dashboard.minutesAgo', '{n} min', { n: diffMinutes });
    if (diffHours < 24) return t('dashboard.hoursAgo', '{n}h', { n: diffHours });
    return t('dashboard.daysAgo', '{n}j', { n: diffDays });
};
</script>

<template>
    <div class="card">
        <div class="flex items-center justify-between mb-6">
            <div class="font-semibold text-xl">{{ t('dashboard.memberActivity', 'Activité des membres') }}</div>
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
                        <Skeleton width="50%" height="1rem" class="mb-2" />
                        <Skeleton width="70%" height="0.75rem" />
                    </div>
                    <Skeleton width="3rem" height="1.5rem" borderRadius="1rem" />
                </div>
            </div>
        </template>

        <!-- Empty state -->
        <template v-else-if="isEmpty">
            <div class="flex flex-col items-center justify-center py-8 text-center">
                <div class="flex items-center justify-center w-16 h-16 rounded-full bg-surface-100 dark:bg-surface-700 mb-4">
                    <i class="pi pi-users text-3xl text-muted-color"></i>
                </div>
                <span class="text-lg font-medium text-surface-900 dark:text-surface-0 mb-2">
                    {{ t('dashboard.noActivityTitle', 'Aucune activité récente') }}
                </span>
                <span class="text-muted-color text-sm">
                    {{ t('dashboard.noActivityDesc', 'Les activités des membres apparaîtront ici') }}
                </span>
            </div>
        </template>

        <!-- Activity list -->
        <template v-else>
            <div class="flex flex-col gap-3">
                <div
                    v-for="activity in displayActivities"
                    :key="activity.id"
                    class="flex items-center gap-4 p-3 rounded-lg border border-surface-200 dark:border-surface-700 hover:bg-surface-50 dark:hover:bg-surface-800 transition-colors"
                >
                    <!-- Activity type icon -->
                    <div
                        class="flex items-center justify-center w-10 h-10 rounded-full"
                        :class="getActivityConfig(activity.type).bg"
                    >
                        <i
                            class="pi !text-lg"
                            :class="[getActivityConfig(activity.type).icon, getActivityConfig(activity.type).color]"
                        ></i>
                    </div>

                    <!-- Activity info -->
                    <div class="flex-1 min-w-0">
                        <div class="font-medium text-surface-900 dark:text-surface-0 truncate">
                            {{ activity.memberName }}
                        </div>
                        <div class="text-sm text-muted-color truncate">
                            {{ activity.description }}
                        </div>
                    </div>

                    <!-- Activity type tag and time -->
                    <div class="flex flex-col items-end gap-1 shrink-0">
                        <Tag
                            :value="getActivityLabel(activity.type)"
                            :severity="getActivityConfig(activity.type).tagSeverity"
                            rounded
                        />
                        <span class="text-xs text-muted-color">
                            {{ formatTimeAgo(activity.timestamp) }}
                        </span>
                    </div>
                </div>
            </div>
        </template>
    </div>
</template>
