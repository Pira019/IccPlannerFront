
<template>
  <div class="py-8">
    <LoadingDialogComponent :errorReq="errorReq" :onLoading="servicePrgLoading"/>
    <!-- Groupe de programmes -->
    <div v-if="servicesPrg?.length > 0 && errorReq == null">
     <div v-for="(servicesPrg,index ) in servicesPrg" :key="index" class="mb-12">
      <div class="flex items-center gap-4 mb-6">
        <h2 class="text-2xl font-bold text-slate-800 tracking-tight">{{  getDayNameFromGroupKey(servicesPrg.groupKey,$t) }}</h2>
        <div class="h-px bg-slate-200 flex-grow"></div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div v-for="(item, index ) in servicesPrg.servicePrograms" :key="index">
          <Card class="h-full border border-slate-200 shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden">
            <template #title>
              <div class="flex justify-between items-start gap-3">
                <span class="text-xl font-bold text-slate-900 leading-tight">{{ item.title }}</span>
                <Tag :value="item.shortName" :severity="getShortNameColor(item.shortName)" />
              </div>
            </template>
            <!--
            <template #subtitle>
              <div class="flex items-center gap-2 text-indigo-600 font-semibold mt-1">
                <i class="pi pi-calendar-clock"></i>
                <span>{{ item.time }}</span>
              </div>
            </template>
            -->
            <template #content>
              <div class="space-y-4">
                <p class="text-slate-600 leading-relaxed text-sm">
                  {{ item.description }}
                </p>

                <!-- Liste des Cultes / Services spécifiques -->
                <div v-if="item.services && item.services.length > 0" class="bg-slate-50 rounded-lg p-3 border border-slate-100">
                  <span class="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Sessions / Services</span>
                  <ul class="space-y-3">
                    <li v-for="(service, idx) in item.services" :key="idx" class="flex flex-col gap-1 border-b border-slate-200/50 last:border-0 pb-2 last:pb-0">
                      <div class="flex items-center justify-between text-sm">
                        <div class="flex items-center gap-2">
                          <i :class="item.services.length === 1 ? 'pi pi-star-fill text-amber-500 text-[10px]' : 'pi pi-circle-fill text-[8px] text-primary-500'"></i>
                          <span class="font-bold text-slate-700">{{ service.serviceTitle }}</span>
                        </div>
                        <span class="text-xs font-mono bg-primary-600 text-white px-2 py-0.5 rounded shadow-sm">
                          {{ service.startTime }}
                        </span>
                      </div>
                      <!-- Heure d'arrivée -->
                      <div v-if="service.arrival" class="flex items-center gap-1.5 pl-5 text-[11px] text-slate-500 italic">
                        <i class="pi pi-clock text-[9px]"></i>
                        <span>Arrivée : <span class="font-semibold">{{ service.arrivalTime }}</span></span>
                      </div>
                    </li>
                  </ul>
                </div>
              </div>
            </template>

            <template #footer v-if="false">
              <div class="flex justify-end gap-2 border-t border-slate-100 pt-4">
                <Button label="S'inscrire" icon="pi pi-check" text size="small" />
                <Button label="Détails" icon="pi pi-arrow-right" iconPos="right" size="small" class="bg-indigo-600 border-indigo-600" />
              </div>
            </template>
          </Card>
        </div>
      </div>
     </div>
    </div>
    <Message v-else>{{$t('liNonPrg')}}</Message>
  </div>
</template>

<script setup>
import LoadingDialogComponent from '@/components/LoadingDialogComponent.vue';
import TabServicePrgService from '@/service/TabServicePrgService';
import { useHandleAsyncError } from '@/utils/handleAsyncError';
import { getDayNameFromGroupKey } from '@/utils/Utils';
import Button from 'primevue/button';
import Card from 'primevue/card';
import Tag from 'primevue/tag';
import { onMounted, ref, watch } from 'vue';

const getShortNameColor = (shortName) => {
  const colors = [
    'info',
    'success',
    'warn',
    'danger',
    'help',
    'secondary',
    'contrast'
  ];

  let hash = 0;
  for (let i = 0; i < shortName.length; i++) {
    hash = shortName.charCodeAt(i) + ((hash << 5) - hash);
  }

  return colors[Math.abs(hash) % colors.length];
};
const { handleAsyncError } = useHandleAsyncError();

const props = defineProps({
    payload: {
        type: Object,
        default: () => ({})
    }
});

const servicePrgLoading = ref(false)
const servicesPrg  = ref([]);

const errorReq =  ref(null);

async function geGetTabServices(){
 const { error, result } = await handleAsyncError(
        () => TabServicePrgService.GetTabServicesPrgAsync(props.payload),
        (val) => (servicePrgLoading.value = val)
    );

    if(error)
    {
        errorReq.value = error;
        return;
    }
    servicesPrg.value = result;
}

//
watch(
  () => props.payload,
  async (newVal) => {
    if (!newVal) return;

    await geGetTabServices(newVal);
  },
  { immediate: true, deep: true }
);

onMounted(async () => {
     await geGetTabServices(props.payload)
});

</script>

<style scoped>
:deep(.p-card) {
  background: white;
}
:deep(.p-card-body) {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  height: 100%;
}
:deep(.p-card-content) {
  padding: 0;
  flex-grow: 1;
}
:deep(.p-card-title) {
  font-size: 1.25rem;
  margin-bottom: 0.25rem;
}
</style>
