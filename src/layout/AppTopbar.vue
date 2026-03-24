<script setup>
import LangConfiguration from '@/components/LangConfiguration.vue';
import { useLayout } from '@/layout/composables/layout';
import { useAuthStore } from '@/store/Auth';
import { computed, ref } from 'vue';
import { redirigeVers } from '../router';

const { toggleMenu } = useLayout();
const auth = useAuthStore();

const notificationCount = ref(3); // Demo — will come from API
const userMenuRef = ref(null);

const userMenuItems = ref([
    { label: 'liProfil', icon: 'pi pi-user', command: () => redirigeVers('profil') },
    { separator: true },
    { label: 'logout', icon: 'pi pi-sign-out', command: () => handleLogout() }
]);

const userInitials = computed(() => {
    const claims = auth.claims;
    if (!claims) return '?';
    const name = claims.name || claims.email || '';
    if (!name) return '?';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return name.substring(0, 2).toUpperCase();
});

const handleLogout = () => {
    auth.logout();
    redirigeVers('login');
};

const toggleUserMenu = (event) => {
    userMenuRef.value?.toggle(event);
};
</script>

<template>
    <div class="layout-topbar">
        <div class="layout-topbar-logo-container">
            <button class="layout-menu-button layout-topbar-action" @click="toggleMenu">
                <i class="pi pi-bars"></i>
            </button>
            <router-link to="/" class="layout-topbar-logo">
                <Image src="/images/LOGO-GRIS.png" width="54" height="11" />
                <span>Star Planning</span>
            </router-link>
        </div>

        <div class="layout-topbar-actions">
            <!-- Notifications -->
            <button type="button" class="layout-topbar-action relative">
                <i class="pi pi-bell"></i>
                <Badge v-if="notificationCount > 0" :value="notificationCount" severity="danger" class="absolute -top-1 -right-1 !min-w-5 !h-5 !text-xs" />
            </button>

            <!-- Language -->
            <LangConfiguration />

            <!-- User profile -->
            <button type="button" class="layout-topbar-action flex items-center gap-2" @click="toggleUserMenu">
                <div class="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-sm font-medium">
                    {{ userInitials }}
                </div>
                <i class="pi pi-chevron-down text-xs hidden lg:block"></i>
            </button>
            <Menu ref="userMenuRef" :model="userMenuItems" popup>
                <template #item="{ item, props: itemProps }">
                    <a v-bind="itemProps.action" class="flex items-center gap-2 px-4 py-2 cursor-pointer hover:bg-surface-100 dark:hover:bg-surface-700">
                        <i :class="item.icon"></i>
                        <span>{{ $t(item.label) }}</span>
                    </a>
                </template>
            </Menu>
        </div>
    </div>
</template>
