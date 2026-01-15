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
                    <span class="text-lg font-medium">Aujourd'hui</span>
                </div>

                <div class="flex items-center gap-2 flex-wrap mt-2 sm:mt-0">
                    <Button label="Mois" icon="pi pi-calendar" outlined class="hidden sm:flex" />
                    <Button label="Filtre appliqué" icon="pi pi-filter" outlined class="hidden sm:flex" />
                    <Button icon="pi pi-ellipsis-h" text />
                    <Button label="Nouveau" icon="pi pi-plus" severity="primary" />
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
