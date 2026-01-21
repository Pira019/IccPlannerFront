<template>
    <PageComponent :title-page="$t('Programs')" @btn-add="openAdd">
        <div class="flex flex-col h-screen">
            <!-- Barre d'outils -->
            <div class="border-b border-gray-200 p-4 flex items-center justify-between flex-wrap">
                <div class="flex items-center gap-2">
                    <!-- Hamburger mobile -->

                    <div class="sm:hidden">
                        <Button icon="pi pi-bars" text @click="panelOpen = !panelOpen" />
                    </div>
                    <Button :label="t('liToDay')" @click="selectToday" severity="Primary" class="text-lg font-medium" variant="outlined" rounded />
                    <div>
                        <Button icon="pi pi-chevron-left" variant="text" @click="prev" />
                        <Button icon="pi pi-chevron-right" variant="text" @click="next" />

                        <!-- Texte date -->
                        <span class="ml-2 text-lg font-semibold capitalize"> {{ currentMonthYear }} </span>
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
                        'bg-white border-r border-gray-200 flex flex-col',
                        'w-full sm:w-1/4' // mobile toggle
                    ]"
                >
                    <div>
                        <DatePicker inline class="w-full" v-model="selectedDate" />
                    </div>
                    <div class="flex-1 bg-white border-l pt-4 overflow-y-auto">
                        <!-- Mobile : Drawer -->
                        <Drawer v-if="isMobile" v-model:visible="panelOpen">
                            <SlideContent />
                        </Drawer>

                        <!-- Desktop : contenu normal -->
                        <div v-else class="flex-1 overflow-y-auto">
                            <SlideContent />
                        </div>
                    </div>
                </div>

                <!-- Calendrier principal -->
                <div class="flex-1 flex flex-col overflow-auto">
                    <CalendarComponent ref="calendar" :showHeader="false" @CurrentMonthYear="onMonthYearChanged" v-model:currentView="view" class="flex-1" />
                </div>
            </div>
        </div>
    </PageComponent>
    <Dialog  v-model:visible="dialogVisible" header="bhbhh" :modal="true" :style="{ width: '50rem' }" :breakpoints="{ '1199px': '75vw', '575px': '90vw' }" >
        <StepperPrg @closeModal="() => (displayAddPrg = false)" />
    </Dialog>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import SlideContent from './SlideContent.vue';
import StepperPrg from './StepperPrg.vue';

const { t } = useI18n();

const selectedDate = ref(new Date());
const currentMonthYear = ref('');
const calendar = ref(null);

const panelOpen = ref(false);

const isMobile = ref(false);
const displayAddPrg = ref(false);

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

// Methods

function openAdd(payload) {
    displayAddPrg.value = true;
}

const onMonthYearChanged = (formattedMonthYear) => {
    currentMonthYear.value = formattedMonthYear;
};

const checkScreen = () => {
    isMobile.value = window.innerWidth < 640;
};

// Méthode pour sélectionner aujourd'hui
const selectToday = () => {
    selectedDate.value = new Date(); // met à jour la date sélectionnée
};

const prev = () => {
    calendar.value.navigatePrev();
    const calView = calendar.value.$refs.calendarRef.getApi().view;
    selectedDate.value = calView.currentStart;
};

const next = () => {
    calendar.value.navigateNext();
    const calView = calendar.value.$refs.calendarRef.getApi().view;
    selectedDate.value = calView.currentStart;
};

// Dialog control
const dialogVisible = computed({
    get() {
        return displayAddPrg.value;
    },
    set(val) {
        // fermer le dialog → on reset les deux flags si nécessaire
        if (!val) {
            displayAddPrg.value = false;
        }
    }
});

// Watch sur selectedDate pour mettre à jour FullCalendar
watch(selectedDate, (newDate) => {
    if (calendar.value && newDate) {
        calendar.value.gotoDate(newDate);
    }
});

onMounted(() => {
    checkScreen();
    window.addEventListener('resize', checkScreen);
});

onUnmounted(() => {
    window.removeEventListener('resize', checkScreen);
});
</script>
