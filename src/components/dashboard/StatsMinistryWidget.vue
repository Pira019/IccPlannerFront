<script setup>
import { computed } from 'vue';

const props = defineProps({
    loading: {
        type: Boolean,
        default: false
    },
    stats: {
        type: Object,
        default: () => ({
            activeMembers: 0,
            membersTrend: 0,
            programsThisMonth: 0,
            programsTrend: 0,
            totalDepartments: 0,
            availabilityRate: 0
        })
    }
});

const statCards = computed(() => [
    {
        id: 'members',
        label: 'Membres actifs',
        value: props.stats.activeMembers,
        trend: props.stats.membersTrend,
        icon: 'pi-users',
        iconBg: 'bg-purple-100 dark:bg-purple-400/10',
        iconColor: 'text-purple-500'
    },
    {
        id: 'programs',
        label: 'Programmes ce mois',
        value: props.stats.programsThisMonth,
        trend: props.stats.programsTrend,
        icon: 'pi-calendar',
        iconBg: 'bg-blue-100 dark:bg-blue-400/10',
        iconColor: 'text-blue-500'
    },
    {
        id: 'departments',
        label: 'Départements',
        value: props.stats.totalDepartments,
        trend: null,
        icon: 'pi-sitemap',
        iconBg: 'bg-orange-100 dark:bg-orange-400/10',
        iconColor: 'text-orange-500'
    },
    {
        id: 'availability',
        label: 'Taux de disponibilité',
        value: `${props.stats.availabilityRate}%`,
        trend: null,
        icon: 'pi-check-circle',
        iconBg: 'bg-green-100 dark:bg-green-400/10',
        iconColor: 'text-green-500'
    }
]);

const getTrendClass = (trend) => {
    if (trend > 0) return 'text-green-500';
    if (trend < 0) return 'text-red-500';
    return 'text-muted-color';
};

const getTrendIcon = (trend) => {
    if (trend > 0) return 'pi-arrow-up';
    if (trend < 0) return 'pi-arrow-down';
    return 'pi-minus';
};

const formatTrend = (trend) => {
    if (trend === null || trend === undefined) return null;
    const sign = trend > 0 ? '+' : '';
    return `${sign}${trend}%`;
};
</script>

<template>
    <template v-for="card in statCards" :key="card.id">
        <div class="col-span-12 lg:col-span-6 xl:col-span-3">
            <div class="card mb-0">
                <!-- Skeleton loader -->
                <template v-if="loading">
                    <div class="flex justify-between mb-4">
                        <div class="flex-1">
                            <Skeleton width="60%" height="1rem" class="mb-4" />
                            <Skeleton width="40%" height="1.5rem" />
                        </div>
                        <Skeleton shape="circle" size="2.5rem" />
                    </div>
                    <Skeleton width="50%" height="0.875rem" />
                </template>

                <!-- Content -->
                <template v-else>
                    <div class="flex justify-between mb-4">
                        <div>
                            <span class="block text-muted-color font-medium mb-4">{{ card.label }}</span>
                            <div class="text-surface-900 dark:text-surface-0 font-medium text-xl">{{ card.value }}</div>
                        </div>
                        <div
                            class="flex items-center justify-center rounded-border"
                            :class="card.iconBg"
                            style="width: 2.5rem; height: 2.5rem"
                        >
                            <i class="pi !text-xl" :class="[card.icon, card.iconColor]"></i>
                        </div>
                    </div>
                    <template v-if="card.trend !== null && card.trend !== undefined">
                        <span class="font-medium" :class="getTrendClass(card.trend)">
                            <i class="pi text-xs mr-1" :class="getTrendIcon(card.trend)"></i>
                            {{ formatTrend(card.trend) }}
                        </span>
                        <span class="text-muted-color ml-1">vs mois dernier</span>
                    </template>
                    <template v-else>
                        <span class="text-muted-color">—</span>
                    </template>
                </template>
            </div>
        </div>
    </template>
</template>
