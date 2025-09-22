<script setup>
import { filterMenuByPermissions } from '@/utils/routesSecure';
import { ref } from 'vue';
import AppMenuItem from './AppMenuItem.vue';

const model = ref([
    {
        label: 'Accueil',
        items: [
            { label: 'Dashboard', icon: 'pi pi-fw pi-home', to: '/' },
            { label: 'Programs', icon: 'pi pi-fw pi-calendar-times', to: '/programs' }
        ]
    },
    {
        label: 'AvailabilityTitlePage',
        items: [
            {
                label: 'Mon calendrier',
                icon: 'pi pi-fw pi-calendar-plus',
                to: '/availability'
            },
            {
                label: 'Signaler une absence',
                icon: 'pi pi-fw pi-times-circle',
                to: '/signaler-absence'
            },
            {
                label: 'Vue globale des dispos',
                icon: 'pi pi-fw pi-calendar',
                to: '/auth/error'
            }
        ]
    },
    {
        label: 'liOrganisation',
        items: [
            { label: 'Ministry', icon: 'pi pi-fw pi-warehouse', to: '/ministry' },
            { label: 'Department', icon: 'pi pi-fw pi-sitemap', to: '/departments' },
            { label: 'Membres', icon: 'pi pi-fw pi-users', to: '/members' }
        ]
    },
    {
        label: 'Rapports',
        items: [
            {
                label: 'Rapports généraux',
                icon: 'pi pi-fw pi-chart-bar',
                to: '/role-management'
            }
        ]
    },
    {
        label: 'liAdmin',
        to: '/admin',
        items: [
            {
                label: 'liGestRole',
                icon: 'pi pi-shield',
                to: '/role-management'
            },
            {
                label: 'Paramètres des rappels',
                icon: 'pi pi-fw pi-cog',
                to: '/jj'
            }
        ]
    }
]);

const accessibleMenu = filterMenuByPermissions(model.value); // Utilisez .value pour extraire le contenu du ref
</script>

<template>
    <ul class="layout-menu">
        <template v-for="(item, i) in accessibleMenu" :key="item">
            <app-menu-item v-if="!item.separator" :item="item" :index="i"></app-menu-item>
            <li v-if="item.separator" class="menu-separator"></li>
        </template>
    </ul>
</template>

<style lang="scss" scoped></style>
