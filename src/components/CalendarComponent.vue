<script setup>
import frLocal from '@fullcalendar/core/locales/fr-ca';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import FullCalendar from '@fullcalendar/vue3';
import { ref } from 'vue';

const optionCal = ref({
    plugins: [dayGridPlugin, interactionPlugin],
    initialView: 'dayGridMonth',
    locale: frLocal,
    eventColor: '#ffffff',
    events: [
        { title: 'event 1', date: '2025-06-01' },
        { title: 'event 2', date: '2025-06-02' }
    ]
});
</script>

<template>
    <div>
        <FullCalendar :options="optionCal">
            <template v-slot:eventContent="arg">
                <div class="flex justify-center mt-3 flex-wrap">
                    <Button class="text-wrap" label="Ajouter" @click="$emit('showModal')" v-tooltip="'Ajouter mes disponibilite'" severity="help" icon="pi pi-bookmark" size="large" />
                </div>
            </template>
        </FullCalendar>
    </div>
</template>
