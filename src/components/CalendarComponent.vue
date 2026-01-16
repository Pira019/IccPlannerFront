<script setup>
import frLocal from '@fullcalendar/core/locales/fr-ca';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin  from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import FullCalendar from '@fullcalendar/vue3';
import { ref, watch } from 'vue';

const emit = defineEmits(['month-changed', 'showModal']);
const props = defineProps({
    datesService: Array,
    showHeader: { type: Boolean, default: true },
    currentView: { type: String, default: 'dayGridMonth' }
});

const calendarRef = ref(null); // <-- référence du calendrier
const optionCal = ref({
    plugins: [dayGridPlugin,timeGridPlugin,interactionPlugin],
    initialView: props.currentView,
    locale: frLocal,
    height: '100%',
    headerToolbar: props.showHeader ? { left: 'prev,next today', center: 'title', right: '' } : false,
    datesSet: (info) => {
        const currentDate = info.view.currentStart;
        const month = currentDate.getMonth() + 1;
        const year = currentDate.getFullYear();
        emit('month-changed', { month, year });
    },
    dayHeaderContent: (arg) => {
    const dayName = arg.date.toLocaleDateString('fr-CA', { weekday: 'short' }); // "Lun", "Mar"...
    const dayNumber = arg.date.getDate(); // 15, 16...
    return {
      html: `<div class="flex flex-col items-center">
               <span class="text-sm font-medium">${dayName}</span>
               <span class="text-xs text-gray-500">${dayNumber}</span>
             </div>`
    };
  },
    events: datesToEvents(props.datesService)
});

// Mettre à jour optionCal.events quand datesService change
watch(
    () => props.datesService,
    (newDates) => {
        optionCal.value = {
            ...optionCal.value,
            events: datesToEvents(newDates)
        };
    },
    { immediate: true }
);

// Mettre à jour optionCal.headerToolbar quand showHeader change
watch(
    () => props.showHeader,
    (val) => {
        optionCal.value.headerToolbar = val ? { left: 'prev,next today', center: 'title', right: '' } : false;
    }
);

// ⚡ Watcher pour suivre les changements de currentView
watch(
    () => props.currentView,
    (newView) => {
        if (calendarRef.value) {
            calendarRef.value.getApi().changeView(newView);
        }
    },
    { immediate: true }
);

function datesToEvents(dates) {
    if (!dates) return [];
    return dates.map((dateStr) => ({
        date: dateStr
    }));
}
</script>

<template>
    <div>
        <FullCalendar :options="optionCal" ref="calendarRef">
            <template v-slot:eventContent="arg">
                <div class="flex justify-center mt-3 flex-wrap">
                    <Button class="text-wrap" label="Ajouter" @click="$emit('showModal', arg.event.startStr)" v-tooltip="'Ajouter mes disponibilite'" severity="help" icon="pi pi-calendar-plus" size="large" />
                </div>
            </template>
        </FullCalendar>
    </div>
</template>
