<script setup>
import AvailabilityOverviewWidget from '@/components/dashboard/AvailabilityOverviewWidget.vue';
import MemberActivityWidget from '@/components/dashboard/MemberActivityWidget.vue';
import NotificationsWidget from '@/components/dashboard/NotificationsWidget.vue';
import StatsMinistryWidget from '@/components/dashboard/StatsMinistryWidget.vue';
import UpcomingProgramsWidget from '@/components/dashboard/UpcomingProgramsWidget.vue';
import { ref } from 'vue';

const loading = ref(false);
const error = ref(null);

// Demo stats — will be replaced by API call
const stats = ref({
    activeMembers: 142,
    membersTrend: 12,
    programsThisMonth: 8,
    programsTrend: -3,
    totalDepartments: 6,
    availabilityRate: 74
});

const retry = async () => {
    error.value = null;
    // Future: reload data from API
};
</script>

<template>
    <div class="grid grid-cols-12 gap-8">
        <!-- Error banner -->
        <div v-if="error" class="col-span-12">
            <Message severity="error" :closable="false">
                <div class="flex items-center justify-between w-full">
                    <span>{{ error }}</span>
                    <Button :label="$t('dashboard.retry', 'Réessayer')" icon="pi pi-refresh" text size="small" @click="retry" />
                </div>
            </Message>
        </div>

        <!-- Stats row -->
        <StatsMinistryWidget :loading="loading" :stats="stats" />

        <!-- Main content -->
        <div class="col-span-12 xl:col-span-6">
            <UpcomingProgramsWidget :loading="loading" />
            <MemberActivityWidget :loading="loading" class="mt-8" />
        </div>
        <div class="col-span-12 xl:col-span-6">
            <AvailabilityOverviewWidget :loading="loading" />
            <NotificationsWidget :loading="loading" class="mt-8" />
        </div>
    </div>
</template>
