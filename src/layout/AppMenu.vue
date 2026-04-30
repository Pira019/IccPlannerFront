<script setup>
import { filterMenuByPermissions } from '@/utils/routesSecure';
import { ref } from 'vue';
import AppMenuItem from './AppMenuItem.vue';

const model = ref([
    {
        label: 'Home',
        items: [
            { label: 'Dashboard', icon: 'pi pi-fw pi-home', to: '/' },
            { label: 'Programs', icon: 'pi pi-fw pi-calendar-times', to: '/programs' }
        ]
    },
    {
        label: 'AvailabilityTitlePage',
        items: [
            { label: 'myPlanning.menuLabel', icon: 'pi pi-fw pi-user', to: '/my-planning' },
            { label: 'liMydisponibility', icon: 'pi pi-fw pi-calendar-plus', to: '/availability/disponibility', name: 'availability' },
            { label: 'planning.menuLabel', icon: 'pi pi-fw pi-calendar', to: '/planning' }
        ]
    },
    {
        label: 'liOrganisation',
        items: [
            { label: 'Ministry', icon: 'pi pi-fw pi-warehouse', to: '/ministry' },
            { label: 'Department', icon: 'pi pi-fw pi-sitemap', to: '/departments' },
            { label: 'Members', icon: 'pi pi-fw pi-users', to: '/members' },
            { label: 'servicesCulte', icon: 'pi pi-briefcase', to: '/services' },
            { label: 'Postes', icon: 'pi pi-fw pi-id-card', to: '/postes' }
        ]
    },
    {
        label: 'liAdmin',
        to: '/admin',
        items: [
            { label: 'liGestRole', icon: 'pi pi-shield', to: '/role-management' },
            { label: 'settings.menuLabel', icon: 'pi pi-fw pi-cog', to: '/settings' }
        ]
    }
]);

const accessibleMenu = filterMenuByPermissions(model.value);
</script>

<template>
    <ul class="layout-menu">
        <template v-for="(item, i) in accessibleMenu" :key="item">
            <app-menu-item v-if="!item.separator" :item="item" :index="i"></app-menu-item>
            <li v-if="item.separator" class="menu-separator"></li>
        </template>
    </ul>
</template>
