<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import DetailPrg from './DetailPrg.vue';
import EditProgram from './EditProgram.vue';

const emit = defineEmits(['closeModal','step-title']);

const { t } = useI18n()

const programId = ref(null);
const activeStep = ref('1')
// List
const stepListRef = ref(null);

function closeDialog() {
    emit('closeModal');
}

const stepTitle = computed(() => {
  switch (activeStep.value) {
    case '1': return t('liModalAddPrg')
    case '2': return t('liModalAdDetail')
    case '3': return t('liModalAddService')
  }
})

const scrollToActiveStep = async () => {
  await nextTick();

  if (!stepListRef.value) return;

  // Trouver l'élément du step actif
  const stepListElement = stepListRef.value.$el;
  const activeStepElement = stepListElement?.querySelector('[aria-current="step"]');

  if (activeStepElement) {
    activeStepElement.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
      inline: 'center'
    });
  }
};


watch(activeStep, () => {
  emit('step-title', stepTitle.value)
  scrollToActiveStep();
},
 { immediate: true }
)

</script>

<template>
    <div class="flex justify-center px-4 sm:px-0">
        <Stepper :value="activeStep" linear @update:value="activeStep = $event" class="w-full max-w-[50rem]" >
            <StepList ref="stepListRef">
                <Step value="1">{{ $t('liModalAddPrg') }}</Step>
                <Step value="2">{{ $t('liModalAdDetail') }}</Step>
                <Step value="3">{{ $t('liModalAddService') }}</Step>
            </StepList>
            <StepPanels>
                <StepPanel v-slot="{ activateCallback }" value="1">
                    <div class="flex flex-col">
                        <EditProgram @closeDialog="closeDialog" @saved="programId = $event;activateCallback('2')">
                            <template #btnStep v-if="programId">
                                <div class="flex">
                                    <Button :label="t('liBtnNext')" size="small" severity="secondary" icon="pi pi-arrow-right" iconPos="right" @click="activateCallback('2')" />
                                </div>
                            </template>
                        </EditProgram>
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
