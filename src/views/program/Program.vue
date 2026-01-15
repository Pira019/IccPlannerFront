<template>
    <PageComponent :title-page="$t('Programs')">
        <div class="flex flex-col h-screen">
            <!-- Barre d'outils -->
            <div class="border-b border-gray-200 p-4 flex items-center justify-between flex-wrap">
                <div class="flex items-center gap-2">
                    <!-- Hamburger mobile -->

                    <div class="sm:hidden">
                        <Button icon="pi pi-bars" text @click="panelOpen = !panelOpen" />
                    </div> 
                    <Button label="Aujourd'hui" severity="Primary"  class="text-lg font-medium" variant="outlined" rounded />
                    <div class="calendar-nav">
                        <Button icon="pi pi-chevron-left"
                                class="p-button-text"
                                @click="prev" />

                        <Button icon="pi pi-chevron-right"
                                class="p-button-text"
                                @click="next" />

                        <!-- Texte date -->
                        <span class="ml-2 text-lg font-semibold capitalize">
                           January 2025
                        </span>
                    </div>
                </div>

                <div class="flex items-center gap-2 flex-wrap mt-2 sm:mt-2">
                    <SplitButton :label="view"
                                 icon="pi pi-calendar"
                                 outlined 
                                 class="hidden sm:flex"
                                 :model="viewItems"
                                 @click="onMainClick" /> 
                </div>
            </div>

            <!-- Contenu principal -->
            <div class="flex flex-col sm:flex-row w-full h-full overflow-hidden">
                <!-- Sidebar -->
                <div
                    :class="[
                        'bg-white border-r border-gray-200',
                        'w-full sm:w-1/4' // mobile toggle
                    ]"
                >
                    <div>
                        <DatePicker inline class="w-full" />
                    </div>
                    <div :class="['h-full sm:h-auto bg-white border-l p-4 overflow-y-auto', 'w-3/4 sm:w-auto']">
                        <!-- Mobile : Drawer -->
                        <Drawer v-if="isMobile" v-model:visible="panelOpen">
                            <SlideContent />
                        </Drawer>

                        <!-- Desktop : contenu normal -->
                        <div v-else>
                            <SlideContent />
                        </div>
                    </div>
                </div>

                <!-- Calendrier principal -->
                <div class="flex-1 p-4 overflow-auto">
                    <CalendarComponent :showHeader="false" class="overflow-y-auto" />
                </div>
            </div>
        </div>
    </PageComponent>
</template>

<script setup>
import { onMounted, onUnmounted, ref } from 'vue';
import SlideContent from './SlideContent.vue';

const panelOpen = ref(false);

    const isMobile = ref(false);

    const view = ref('month');

    const views = {
        month: 'Mois',
        week: 'Semaine',
        day: 'Jour'
    };

    const viewItems = [
        {
            label: 'Mois',
            command: () => (view.value = 'month')
        },
        {
            label: 'Semaine',
            command: () => (view.value = 'week')
        },
        {
            label: 'Jour',
            command: () => (view.value = 'day')
        }
    ];

const checkScreen = () => {
    isMobile.value = window.innerWidth < 640;
};

onMounted(() => {
    checkScreen();
    window.addEventListener('resize', checkScreen);
});

onUnmounted(() => {
    window.removeEventListener('resize', checkScreen);
});
</script> 
