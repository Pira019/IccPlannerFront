
<template>
  <div class="py-8">
    <LoadingDialogComponent :errorReq="errorReq" :onLoading="servicePrgLoading"/>
    <!-- Groupe de programmes -->
    <div v-if="servicesPrg?.length > 0">
     <div v-for="(group, index) in servicesPrg" :key="group.groupKey || index" class="mb-12">
      <div class="flex items-center gap-4 mb-6">
        <h2 class="text-2xl font-bold text-slate-800 tracking-tight">{{  getDayNameFromGroupKey(group.groupKey,$t) }}</h2>
        <div class="h-px bg-slate-200 flex-grow"></div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div v-for="item in group.servicePrograms" :key="item.id || item.title">
          <Card class="h-full border border-slate-200 shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden">
            <template #title>
              <div class="flex justify-between items-start gap-3">
                <span class="text-xl font-bold text-slate-900 leading-tight">{{ item.title }}</span>
                <div class="flex items-center gap-2">
                  <Tag :value="item.shortName" :severity="getShortNameColor(item.shortName)" />
                  <Button 
                    icon="pi pi-ellipsis-v" 
                    size="small" 
                    text 
                    severity="secondary"
                    @click="toggleMenu($event, item)"
                  />
                </div>
              </div>
            </template>
            <!--
            <template #subtitle>
              <div class="flex items-center gap-2 text-indigo-600 font-semibold mt-1">
                <i class="pi pi-calendar-clock" aria-hidden="true"></i>
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
                    <li v-for="service in item.services" :key="service.id || service.serviceTitle" class="flex flex-col gap-1 border-b border-slate-200/50 last:border-0 pb-2 last:pb-0">
                      <div class="flex items-center justify-between text-sm">
                        <div class="flex items-center gap-2">
                          <i :class="item.services.length === 1 ? 'pi pi-star-fill text-amber-500 text-[10px]' : 'pi pi-circle-fill text-[8px] text-primary-500'" aria-hidden="true"></i>
                          <span class="font-bold text-slate-700">{{ service.serviceTitle }}</span>
                        </div>
                        <span class="text-xs font-mono bg-primary-600 text-white px-2 py-0.5 rounded shadow-sm">
                          {{ service.startTime }}
                        </span>
                      </div>
                      <!-- Heure d'arrivée -->
                      <div v-if="service.arrival" class="flex items-center gap-1.5 pl-5 text-[11px] text-slate-500 italic">
                        <i class="pi pi-clock text-[9px]" aria-hidden="true"></i>
                        <span>Arrivée : <span class="font-semibold">{{ service.arrivalTime }}</span></span>
                      </div>
                    </li>
                  </ul>
                </div>
              </div>
            </template>
          </Card>
        </div>
      </div>
     </div>
    </div>
    <Message v-else-if="!servicePrgLoading && !errorReq">{{$t('liNonPrg')}}</Message>    
    <!-- Menu contextuel unique pour tous les items -->
    <Menu ref="menu" :model="menuItems" :popup="true" />
    
    <!-- Dialog pour ajouter un service -->
    <AddService 
      v-model="showAddServiceDialog" 
      :program="selectedItem" 
      @save="handleSaveService"
    />
  </div>
</template>

<script setup>
import LoadingDialogComponent from '@/components/LoadingDialogComponent.vue';
import TabServicePrgService from '@/service/TabServicePrgService';
import { useHandleAsyncError } from '@/utils/handleAsyncError';
import { getDayNameFromGroupKey } from '@/utils/Utils';
import Button from 'primevue/button';
import Card from 'primevue/card';
import Menu from 'primevue/menu';
import Tag from 'primevue/tag';
import { computed, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import AddService from './AddService.vue';

const { t } = useI18n();

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
const menu = ref();
const selectedItem = ref(null);
const showAddServiceDialog = ref(false);

const menuItems = computed(() => [
  {
    label: t('liAddService'),
    icon: 'pi pi-plus',
    command: () => addService(selectedItem.value)
  },
  {
    label: t('liModifier'),
    icon: 'pi pi-pencil',
    command: () => editProgram(selectedItem.value)
  },
  {
    label: t('btnDel'),
    icon: 'pi pi-trash',
    command: () => deleteProgram(selectedItem.value)
  }
]);

function toggleMenu(event, item) {
  selectedItem.value = item;
  menu.value.toggle(event);
}

function addService(item) {
  selectedItem.value = item;
  showAddServiceDialog.value = true;
}

function handleSaveService(serviceData) {
  // TODO: Appeler l'API pour sauvegarder le service
  console.log('Sauvegarder le service:', serviceData);
  // Recharger les données après sauvegarde
  getTabServices();
}

function editProgram(item) {
  // TODO: Implémenter la logique de modification
  console.log('Modifier le programme:', item);
}

function deleteProgram(item) {
  // TODO: Implémenter la logique de suppression
  console.log('Supprimer le programme:', item);
}

async function getTabServices(){
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

    await getTabServices();
  },
  { immediate: true }
);

</script>

 