<script setup>
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import listPlugin from '@fullcalendar/list';
import timeGridPlugin from '@fullcalendar/timegrid';
import FullCalendar from '@fullcalendar/vue3';
import { nextTick, ref, watch } from 'vue';

import enLocal from '@fullcalendar/core/locales/en-gb';
import frLocal from '@fullcalendar/core/locales/fr-ca';
import { useI18n } from 'vue-i18n';


    const emit = defineEmits(['month-changed', 'showModal', 'CurrentMonthYear','clickedDate']);
    const props = defineProps({
        lstEvents: Array,
        showHeader: { type: Boolean, default: true },
        currentView: { type: String, default: 'dayGridMonth' },
        addCalendarContent: { type: Boolean}
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
        plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin,listPlugin ],
        initialView: props.currentView,
        timeZone: 'local', // important !
        firstDay: 0,
        displayEventTime: false,
        eventDisplay: 'auto',
        allDaySlot: false,
        dayMaxEvents: false,
        fixedWeekCount: false,
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
                year: 'numeric' // "2025",
            });

            const monthInt = currentDate.getMonth() + 1;
            emit('CurrentMonthYear', {formattedMonthYear, month,year});
        },
        eventClick(info) {
            info.jsEvent.preventDefault();
            const dateStr = info.event.startStr.split('T')[0];
            emit('clickedDate', dateStr);
        },

        dateClick(info) {
            emit('clickedDate', info.dateStr);
        },
        eventDidMount: function(info) {
            info.el.style.cursor = 'pointer';
        },
         dayCellClassNames(arg) {
            const events = props.lstEvents || [];
            const dateStr = arg.date.toISOString().split('T')[0];
            const hasEvent = events.some(e => e.date === dateStr);

            if (!hasEvent) {
                return ["bg-gray-100", "opacity-70", "cursor-not-allowed"];
            }

            return ["cursor-pointer"];
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
        events: eventsToCalendarEvents(props.lstEvents)
    });

    // Mettre à jour les events quand lstEvents change
    watch(
        () => props.lstEvents,
        (newDates) => {
            const newEvents = eventsToCalendarEvents(newDates);
            optionCal.value = {
                ...optionCal.value,
                events: newEvents
            };
            // Forcer la mise à jour via l'API FullCalendar (nécessaire pour la vue liste)
            if (calendarRef.value) {
                const api = calendarRef.value.getApi();
                api.removeAllEvents();
                newEvents.forEach(e => api.addEvent(e));
            }
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

    watch(
        () => props.currentView,
        (newView) => {
            if (calendarRef.value) {
                calendarRef.value.getApi().changeView(newView);
            }
        },
        { immediate: true }
    );

  function eventsToCalendarEvents(events) {
  if (!events) return [];

  return events
    .map(e => {

      if (!e.date) return null; // sécurité, mais on suppose qu'elle existe

      let startDate, endDate;
      let allDay = true;

      // Si startTime fourni - événement horaire précis
      if (e.startTime) {
        startDate = new Date(`${e.date}T${e.startTime}`);
        endDate = e.endTime ? new Date(`${e.date}T${e.endTime}`) : startDate;
        allDay = false;
      } else {
        startDate = new Date(`${e.date}T00:00:00`);
        endDate = startDate;
      }

      return {
        id: e?.id || '',
        title:e?.title || '',
        start: isNaN(startDate.getTime()) ? null : startDate.toISOString(),
        end: isNaN(endDate?.getTime()) ? null : endDate?.toISOString(),
        allDay: allDay,
        extendedProps: {
          idPrg: e?.idPrg || null,
          indRecurrent: e?.indRecurrent || false,
          startTime: e?.startTime || null,
          endTime: e?.endTime || null,
          hasAvailability: e?.hasAvailability || false,
          programName: e?.programName || null,
        }
      };


    })
    .filter(Boolean);
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
            <template v-slot:eventContent="arg" v-if="addCalendarContent">
                <slot name="fullCalendarContent" :arg="arg"></slot>
            </template>
        </FullCalendar>
    </div>
</template>

<style>
.fc-event {
    background-color: var(--primary-color) !important;
    border-color: var(--primary-color) !important;
    color: white !important;
    cursor: pointer;
}

    .fc-day-today .fc-daygrid-day-bg {
        @apply border-2 border-primary rounded-lg;
    }

    .fc-day-today,
    .fc-day-today .fc-daygrid-day-bg,
    .fc-day-today .fc-daygrid-day-frame {
        background: transparent !important;
        box-shadow: none !important;
    }

        .fc-day-today .fc-daygrid-day-number {
            @apply bg-primary text-white p-1 w-6 h-6 flex items-center justify-center rounded-full;
        }

/* Mobile responsive */
@media (max-width: 640px) {
    .fc .fc-daygrid-day-frame {
        min-height: 60px !important;
    }

    .fc .fc-event {
        font-size: 0.65rem !important;
        padding: 1px 2px !important;
        line-height: 1.2 !important;
    }

    .fc .fc-col-header-cell-cushion {
        font-size: 0.7rem !important;
        padding: 4px 2px !important;
    }

    .fc .fc-daygrid-day-number {
        font-size: 0.75rem !important;
        padding: 2px 4px !important;
    }

    .fc .fc-daygrid-day-events {
        margin-top: 0 !important;
    }

    .fc .fc-daygrid-event {
        margin: 1px 0 !important;
    }
}

/* List view styles */
.fc .fc-list {
    border: none !important;
}

.fc .fc-list-day-cushion {
    background: var(--p-surface-50) !important;
    padding: 10px 16px !important;
    font-weight: 600 !important;
}

.fc .fc-list-event td {
    padding: 10px 16px !important;
    border-bottom: 1px solid var(--p-surface-200) !important;
}

.fc .fc-list-event:hover td {
    background: rgba(var(--p-primary-500), 0.05) !important;
    cursor: pointer;
}

.fc .fc-list-event-dot {
    border-color: var(--p-primary-color) !important;
}

.fc .fc-list-empty {
    background: transparent !important;
}
</style>

