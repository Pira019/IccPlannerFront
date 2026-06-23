<template>
<div class="my-calendar">
    <Message v-if="notInDepartment" severity="warn" :closable="false" class="mb-4">
      {{ $t('notInDepartment') }}
    </Message>
    <CalendarEventComponent :add-calendar-content="true"
    :loading="loading"
    :errorReq="errorReq"
    :lstEvents="mergedEvents" @CurrentMonthYear="CurrentMonthYear=$event"
    @clickedDate="openDialog">
      <template v-slot:fullCalendarContent="{ arg }">
        <div class="flex flex-col p-1" v-if="arg.event.extendedProps.hasAvailability">
          <span class="text-xs font-semibold truncate text-white">
            <i class="pi pi-check-circle mr-1 text-green-300"></i>{{ arg?.event?.title }}
          </span>
          <span class="text-xs text-white/70 truncate hidden sm:block">{{ arg.event.extendedProps.programName }}</span>
        </div>
        <div v-else class="p-1">
          <span class="text-xs text-white/70 hidden sm:inline">{{ $t('liNoAvailability') }}</span>
          <i class="pi pi-minus-circle text-white/50 sm:hidden text-xs"></i>
        </div>
      </template>
      <template #rightContent>
        <Button v-if="availableDates.length > 0 && !notInDepartment" :label="$t('addDispo')"
        @click="openDialogFirstDate"
        icon="pi pi-fw pi-calendar-plus" />
      </template>
    </CalendarEventComponent>
</div> 
  <Dialog v-model:visible="dialogVisible" :modal="true" @hide="onDialogClose" :style="{ width: '50rem' }" :breakpoints="{ '1199px': '75vw', '575px': '100vw' }" :maximizable="true">
    <AddAvailability :key="clickedDate" @closeModal="onDialogClose" @navigateDate="onNavigateDate" :date-prg="clickedDate" :id-depart="departmentSelected" :available-dates="availableDates" :not-in-department="notInDepartment"/>
  </Dialog>
</template>

<script setup>
import CalendarEventComponent from "@/components/CalendarEventComponent.vue";
import AvailabilityService from "@/service/AvailabilityService";
import MemberService from "@/service/MemberService";
import ServicePrgService from "@/service/ServicePrgService";
import { useHandleAsyncError } from "@/utils/handleAsyncError";
import { computed, ref, watch } from "vue";
import AddAvailability from "./AddAvailability.vue";

const props = defineProps({
  departmentSelected: [String, Number]
});

const { handleAsyncError } = useHandleAsyncError();

const dialogVisible = ref(false)

const CurrentMonthYear = ref(null)
const clickedDate = ref(null)

const loading = ref(true)
const errorReq = ref(null)
const notInDepartment = ref(false)

const lstDisponibility = ref(null);
const myAvailabilities = ref([]);

const availableDates = computed(() => {
  if (!lstDisponibility.value) return [];
  const dates = [...new Set(lstDisponibility.value.map(e => e.date))].filter(Boolean);
  return dates.sort();
});

const onDialogClose = () => {
  clickedDate.value = null;
  dialogVisible.value = false;
  getMyAvailabilities();
}

async function getDisponibility(){
 const { error, result } = await handleAsyncError(
        () => ServicePrgService.getDatesAsync( CurrentMonthYear.value?.month,CurrentMonthYear.value?.year,props.departmentSelected),
        (val) => (loading.value = val)
    );

    if(error)
    {
        errorReq.value = error;
        return;
    }

     lstDisponibility.value = result

}

async function getMyAvailabilities() {
  if (!CurrentMonthYear.value) return;
  const { result } = await handleAsyncError(
    () => AvailabilityService.getMyAvailabilities(props.departmentSelected, CurrentMonthYear.value.month, CurrentMonthYear.value.year)
  );
  myAvailabilities.value = result || [];
}

// Fusionner les dates du calendrier avec les disponibilités de l'utilisateur
const mergedEvents = computed(() => {
  const baseEvents = lstDisponibility.value || [];

  // Créer un map des disponibilités par date
  const availMap = {};
  myAvailabilities.value.forEach(day => {
    const dateStr = day.date;
    availMap[dateStr] = day.items;
  });

  const events = [];

  baseEvents.forEach(e => {
    const items = availMap[e.date];
    if (items && items.length > 0) {
      // L'utilisateur a des dispos → afficher chaque service
      items.forEach(item => {
        events.push({
          date: e.date,
          id: `avail-${item.availabilityId}`,
          title: item.serviceName,
          startTime: item.startTime,
          endTime: item.endTime,
          programName: item.programName,
          hasAvailability: true
        });
      });
    } else if (availableDates.value.includes(e.date)) {
      // Date avec services mais pas de dispo - garder cliquable
      events.push({
        date: e.date,
        id: `date-${e.date}`,
        title: '',
        hasAvailability: false
      });
    }
  });

  return events;
});

async function checkBelongsToDepartment() {
  notInDepartment.value = false;
  const { result } = await handleAsyncError(
    () => MemberService.belongsToDepartment(props.departmentSelected)
  );
  if (result === false) {
    notInDepartment.value = true;
    loading.value = false;
  }
}

watch(
  () => [props.departmentSelected, CurrentMonthYear.value],
  async ()  => {
    if(props.departmentSelected){
       await checkBelongsToDepartment();
       await getDisponibility()
       await getMyAvailabilities()
    }
  },
  { immediate: true }
)

const openDialog = (date) => {
  // Ne pas ouvrir si la date n'a pas de services
  if (!availableDates.value.includes(date)) return;
  clickedDate.value = date
  dialogVisible.value = true
}

const onNavigateDate = (date) => {
  clickedDate.value = date
}

const openDialogFirstDate = () => {
  clickedDate.value = availableDates.value.length > 0 ? availableDates.value[0] : null
  dialogVisible.value = true
}
</script>

<style>
</style>
