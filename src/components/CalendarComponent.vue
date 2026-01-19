<script setup>
    import dayGridPlugin from '@fullcalendar/daygrid';
    import timeGridPlugin from '@fullcalendar/timegrid';
    import interactionPlugin from '@fullcalendar/interaction';
    import FullCalendar from '@fullcalendar/vue3';
    import { nextTick, ref, watch } from 'vue';

    import frLocal from '@fullcalendar/core/locales/fr-ca';
    import enLocal from '@fullcalendar/core/locales/en-gb';
    import { useI18n } from 'vue-i18n';


    const emit = defineEmits(['month-changed', 'showModal', 'CurrentMonthYear']);
    const props = defineProps({
        datesService: Array,
        showHeader: { type: Boolean, default: true },
        currentView: { type: String, default: 'dayGridMonth' }
    });

    const { locale } = useI18n();

    // Locales disponibles pour le calendrier
    const calendarLocales = {
        'fr-FR': frLocal,
        'en-US': enLocal
    };
    // Méthodes exposées au parent pour naviguer dans le calendrier
    defineExpose({
        // Naviguer vers la période précédente
        navigatePrev() {
            if (!calendarRef.value) return;
            const calendarApi = calendarRef.value.getApi();
            const view = calendarApi.view;

            let newDate = new Date(view.currentStart);

            switch (view.type) {
                case 'timeGridWeek':
                    newDate.setDate(newDate.getDate() - 7);
                    break;
                case 'dayGridMonth':
                    newDate.setMonth(newDate.getMonth() - 1);
                    break;
                case 'timeGridDay':
                    newDate.setDate(newDate.getDate() - 1);
                    break;
                default:
                    calendarApi.prev();
                    return;
            }

            calendarApi.gotoDate(newDate);
        },

        // Naviguer vers la période suivante
        navigateNext() {
            if (!calendarRef.value) return;
            const calendarApi = calendarRef.value.getApi();
            const view = calendarApi.view;

            let newDate = new Date(view.currentStart);

            switch (view.type) {
                case 'timeGridWeek':
                    newDate.setDate(newDate.getDate() + 7);
                    break;
                case 'dayGridMonth':
                    newDate.setMonth(newDate.getMonth() + 1);
                    break;
                case 'timeGridDay':
                    newDate.setDate(newDate.getDate() + 1);
                    break;
                default:
                    calendarApi.next();
                    return;
            }

            calendarApi.gotoDate(newDate);
        },

        // Naviguer vers une date spécifique.
        gotoDate(date) {
            if (calendarRef.value) {
                calendarRef.value.getApi().gotoDate(date);
            }
        },
    });

    const calendarRef = ref(null); // <-- référence du calendrier
    const optionCal = ref({
        plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
        initialView: props.currentView,
        timeZone: 'local', // important !
        firstDay: 0,
        locale: calendarLocales[locale.value],
        height: '100%',
        headerToolbar: props.showHeader ? { left: 'prev,next today', center: 'title', right: '' } : false,
        datesSet: (info) => {
            const currentDate = info.view.currentStart;
            const month = currentDate.getMonth() + 1;
            const year = currentDate.getFullYear();
            emit('month-changed', { month, year });

            const formattedMonthYear = currentDate.toLocaleDateString(locale.value, {
                month: 'long', // "janvier", "February", etc.
                year: 'numeric' // "2025"
            });

            emit('CurrentMonthYear', formattedMonthYear);
        },
        dayHeaderContent: (arg) => {
            const dayNumber = arg.date.getDate(); // 15, 16...
            const viewType = arg.view.type;

            const showDayNumber = viewType === 'timeGridDay'

            return {
                html: `
                    <div class="flex flex-col items-center">
                      <span class="font-medium mb-2 uppercase">${arg.text}</span>
                      ${showDayNumber
                        ? `<span class="text-sm text-gray-500">${dayNumber}</span>`
                        : ''
                    }
                    </div>
                         `
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
    watch(locale, (newLocale) => {
        if (!calendarRef.value) return;

        const api = calendarRef.value.getApi();

        api.destroy();

        nextTick(() => {
            api.render();
            api.setOption('locale', calendarLocales[newLocale]);
        });
    });

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

<style>
    .fc-day-today .fc-daygrid-day-bg {
        @apply border-2 border-primary rounded-lg;
    }

    .fc-day-today,
    .fc-day-today .fc-daygrid-day-bg,
    .fc-day-today .fc-daygrid-day-frame {
        background: transparent !important; /* supprime tout fond */
        box-shadow: none !important; /* supprime éventuels ombrages */
    }

        .fc-day-today .fc-daygrid-day-number {
            @apply bg-primary text-white p-1 w-6 h-6 flex items-center justify-center rounded-full;
        }


</style>

