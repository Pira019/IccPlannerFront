<template>
<div class="my-calendar">
    <CalendarEventComponent :add-calendar-content="true"
    :loading="loading"
    :errorReq="errorReq"
    :lstEvents="lstDisponibility" @CurrentMonthYear="CurrentMonthYear=$event"
    @clickedDate="openDialog">
      <template v-slot:fullCalendarContent="{ arg }">
        <div class="flex flex-col gap-1 p-2"  v-if="arg.event.id">
          <p class="font-semibold text-sm truncate m-0">{{ arg?.event?.title }}</p>
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
      <template #rightContent>
        <Button :label="$t('addDispo')"
        @click="dialogVisible=true"
        icon="pi pi-fw pi-calendar-plus" />
      </template>
    </CalendarEventComponent>
</div>

  <Dialog v-model:visible="dialogVisible" :modal="true" @hide="onDialogClose" :style="{ width: '50rem' }" :breakpoints="{ '1199px': '75vw', '575px': '90vw' }">
    <AddAvailability @closeModal="onDialogClose" :date-prg="clickedDate" :id-depart="departmentSelected"/>
  </Dialog>
</template>

<script setup>
import CalendarEventComponent from "@/components/CalendarEventComponent.vue";
import ServicePrgService from "@/service/ServicePrgService";
import { useHandleAsyncError } from "@/utils/handleAsyncError";
import { ref, watch } from "vue";
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

const lstDisponibility = ref(null);

const onDialogClose = () => {
  clickedDate.value = null;
  dialogVisible.value = false
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

watch(
  () => [props.departmentSelected, CurrentMonthYear.value],
  async ()  => {
    if(props.departmentSelected){
       await getDisponibility()
    }
  }
)

const openDialog = (date) => {
  clickedDate.value = date
  dialogVisible.value = true
}
</script>

<style>
</style>
