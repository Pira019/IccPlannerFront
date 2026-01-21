<script setup lang="ts">
import { nextTick, ref } from 'vue';
import DetailPrg from './DetailPrg.vue';
import EditProgram from './EditProgram.vue';

const emit = defineEmits(['closeModal']);

const programId = ref(null);
// List
const stepListRef = ref(null);

function closeDialog() {
    emit('closeModal');
}

function scrollStepListToActive() {
  nextTick(() => {
    const stepListEl = stepListRef.value;
    const activeStepEl = stepListEl?.querySelector('.p-stepper-step.p-highlight'); // classe active par PrimeVue

    if (activeStepEl && stepListEl) {
      const offsetLeft = activeStepEl.offsetLeft;
      const width = stepListEl.clientWidth;
      stepListEl.scrollTo({
        left: offsetLeft - width / 2 + activeStepEl.clientWidth / 2,
        behavior: 'smooth'
      });
    }
  });
}
</script>

<template>
    <div class="flex justify-center px-4 sm:px-0">
        <Stepper value="1" linear class="w-full max-w-[50rem]">
            <StepList>
                <Step value="1">Ajouter le programme</Step>
                <Step value="2">Ajouter les détails</Step>
                <Step value="3">Ajouter les services</Step>
            </StepList>
            <StepPanels>
                <StepPanel v-slot="{ activateCallback }" value="1">
                    <div class="flex flex-col">
                        <EditProgram @closeDialog="closeDialog" @next="()=> activateCallback('2')" />
                    </div>
                </StepPanel>
                <StepPanel v-slot="{ activateCallback }" value="2">
                    <div class="flex flex-col">
                        <DetailPrg @closeModal="closeDialog">
                            <template #btnPreview>
                                 <Button label="Back" size="small" severity="secondary" icon="pi pi-arrow-left" @click="activateCallback('1')" />
                            </template>
                        </DetailPrg>
                    </div>
                </StepPanel>
                <StepPanel v-slot="{ activateCallback }" value="3">
                    <div class="flex flex-col h-48">
                        <div class="border-2 border-dashed border-surface-200 dark:border-surface-700 rounded bg-surface-50 dark:bg-surface-950 flex-auto flex justify-center items-center font-medium">Content III</div>
                    </div>
                    <div class="pt-6">
                        <Button label="Back" severity="secondary" icon="pi pi-arrow-left" @click="activateCallback('2')" />
                    </div>
                </StepPanel>
            </StepPanels>
        </Stepper>
    </div>
</template>
