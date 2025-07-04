<script setup>
import frLocal from '@fullcalendar/core/locales/fr-ca';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import FullCalendar from '@fullcalendar/vue3';
import { ref, watch } from 'vue';

const emit = defineEmits(['month-changed', 'showModal']);
const props = defineProps(['datesService']);

const optionCal = ref({
    plugins: [dayGridPlugin, interactionPlugin],
    initialView: 'dayGridMonth',
    locale: frLocal,
    eventColor: '#ffffff',
    datesSet: (info) => {
        const currentDate = info.view.currentStart;
        const month = currentDate.getMonth() + 1;
        const year = currentDate.getFullYear();
        emit('month-changed', { month, year });
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
    }
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
        <FullCalendar :options="optionCal">
            <template v-slot:eventContent="arg">
                <div class="flex justify-center mt-3 flex-wrap">
                    <Button class="text-wrap" label="Ajouter" @click="$emit('showModal', arg.event.startStr)" v-tooltip="'Ajouter mes disponibilite'" severity="help" icon="pi pi-calendar-plus" size="large" />
                </div>
            </template>
        </FullCalendar>
    </div>
</template>
