<script setup>
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

const props = defineProps({
    loading: { type: Boolean, default: false },
    notifications: { type: Array, default: () => [] }
});

const demoNotifications = [
    { id: 1, type: 'rappel', message: 'Culte de célébration dans 2 jours', detail: 'Louange et Adoration', timestamp: new Date(Date.now() - 30 * 60 * 1000) },
    { id: 2, type: 'invitation', message: 'Marie Dupont a rejoint le département Accueil', detail: null, timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000) },
    { id: 3, type: 'absence', message: 'Jean Mbala sera absent le 15 juin', detail: 'Département Technique', timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000) },
    { id: 4, type: 'rappel', message: 'Réunion de prière demain à 18h', detail: 'Intercession', timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) },
    { id: 5, type: 'invitation', message: 'Paul Ndiaye a accepté l\'invitation', detail: 'Département Jeunesse', timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) }
];

const displayNotifications = computed(() => props.notifications.length > 0 ? props.notifications : demoNotifications);

const notifConfig = {
    rappel: { icon: 'pi-bell', color: 'text-orange-500', bg: 'bg-orange-100 dark:bg-orange-400/10' },
    invitation: { icon: 'pi-user-plus', color: 'text-green-500', bg: 'bg-green-100 dark:bg-green-400/10' },
    absence: { icon: 'pi-times-circle', color: 'text-red-500', bg: 'bg-red-100 dark:bg-red-400/10' }
};

const getConfig = (type) => notifConfig[type] || notifConfig.rappel;

const formatTimeAgo = (ts) => {
    const diffMs = Date.now() - new Date(ts).getTime();
    const mins = Math.floor(diffMs / 60000);
    const hrs = Math.floor(diffMs / 3600000);
    const days = Math.floor(diffMs / 86400000);
    if (mins < 60) return `${mins} min`;
    if (hrs < 24) return `${hrs}h`;
    return `${days}j`;
};
</script>

<template>
    <div class="card">
        <div class="flex items-center justify-between mb-6">
            <div class="font-semibold text-xl">{{ t('dashboard.notifications', 'Notifications') }}</div>
        </div>

        <template v-if="loading">
            <div class="flex flex-col gap-4">
                <div v-for="i in 4" :key="i" class="flex items-center gap-4 py-3">
                    <Skeleton shape="circle" size="2.5rem" />
                    <div class="flex-1">
                        <Skeleton width="80%" height="1rem" class="mb-2" />
                        <Skeleton width="40%" height="0.75rem" />
                    </div>
                </div>
            </div>
        </template>

        <template v-else>
            <ul class="p-0 m-0 list-none">
                <li
                    v-for="notif in displayNotifications"
                    :key="notif.id"
                    class="flex items-center py-3 border-b border-surface last:border-b-0"
                >
                    <div
                        class="w-10 h-10 flex items-center justify-center rounded-full mr-4 shrink-0"
                        :class="getConfig(notif.type).bg"
                    >
                        <i class="pi !text-lg" :class="[getConfig(notif.type).icon, getConfig(notif.type).color]"></i>
                    </div>
                    <div class="flex-1 min-w-0">
                        <span class="text-surface-900 dark:text-surface-0 leading-normal text-sm">
                            {{ notif.message }}
                        </span>
                        <div v-if="notif.detail" class="text-xs text-muted-color mt-1">{{ notif.detail }}</div>
                    </div>
                    <span class="text-xs text-muted-color shrink-0 ml-2">{{ formatTimeAgo(notif.timestamp) }}</span>
                </li>
            </ul>
        </template>
    </div>
</template>
