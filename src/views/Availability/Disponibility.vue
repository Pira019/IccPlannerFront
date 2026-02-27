<template>
    <div>
        {{
            departmentSelected
     }}
    </div>
  <div class="my-calendar">
    <CalendarEventComponent :add-calendar-content="true" :lst-events="listService">
      <template v-slot:fullCalendarContent="{ arg }">
        <div class="flex flex-col gap-1 p-2">
          <p class="font-semibold text-sm truncate m-0">{{ arg.event.title }}</p>
          <p class="text-sm truncate">{{ arg.event.title }}</p>
          <span class="flex items-center text-xs">
            <i class="pi pi-bell mr-1"></i> {{ arg.event.extendedProps.startTime }}
          </span>
          <span class="flex items-center text-xs">
            <i class="pi pi-clock mr-1"></i>
            {{ arg.event.extendedProps.startTime }} -
            {{ arg.event.extendedProps.endTime }}
          </span>
        </div>
      </template>
    </CalendarEventComponent>
  </div>
</template>

<script setup>
import CalendarEventComponent from "@/components/CalendarEventComponent.vue";

const props = defineProps({
  departmentSelected: [String, Number]
});

const listService = [
  {
    id: 1,
    title: "Rendez-vous",
    date: "2026-02-01",
    startTime: "14:30",
    endTime: "15:30",
  },
  {
    id: 2,
    title: "Consultation",
    date: "2026-02-05",
    startTime: "09:00",
    endTime: "10:00",
  },
  {
    id: 2,
    title: "Consultation",
    date: "2026-02-05",
    startTime: "09:00",
    endTime: "10:00",
  },
  {
    id: 2,
    title: "Consultation",
    date: "2026-02-05",
    startTime: "09:00",
    endTime: "10:00",
  },
];
</script>

<style>
.my-calendar .fc-event {
  background-color: var(--primary-color) !important;
  border-color: var(--primary-color) !important;
  color: white !important;
  cursor: pointer;
}
</style>
