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
                    <Button label="Aujourd'hui" severity="Primary" class="text-lg font-medium" variant="outlined" rounded />
                    <div class="calendar-nav">
                        <Button icon="pi pi-chevron-left" class="p-button-text" @click="prev" />

                        <Button icon="pi pi-chevron-right" class="p-button-text" @click="next" />

                        <!-- Texte date -->
                        <span class="ml-2 text-lg font-semibold capitalize"> January 2025 </span>
                    </div>
                </div>

                <div class="flex items-center gap-2 flex-wrap mt-2 sm:mt-2">
                    <SplitButton :label="t(currentViewLabel)" icon="pi pi-calendar" outlined class="hidden sm:flex" :model="viewItems" />
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
                <div class="flex-1 pl-4 flex flex-col overflow-auto">
                    <CalendarComponent :showHeader="false" v-model:currentView="view" class="flex-1" />
                </div>
            </div>
        </div>
    </PageComponent>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import SlideContent from './SlideContent.vue';

const { t } = useI18n();

const panelOpen = ref(false);

const isMobile = ref(false);

const view = ref('dayGridMonth');

const views = [
    { key: 'dayGridMonth', label: 'liMonth' },
    { key: 'timeGridWeek', label: 'liWeek' },
    { key: 'timeGridDay', label: 'liDay' }
];

const currentViewLabel = computed(() => views.find((v) => v.key === view.value)?.label);

const viewItems = views.map((v) => ({
    label: t(v.label),
    command: () => (view.value = v.key)
}));

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
