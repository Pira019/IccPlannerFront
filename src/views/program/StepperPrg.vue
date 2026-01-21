<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import EditProgram from './EditProgram.vue';

const emit = defineEmits(['closeModal']);

const editProgramRef = ref(null);
const programId = ref(null);

const isSubmitting = computed(() => editProgramRef.value?.isSubmitting?.value ?? false);

function submitProgram() {
    editProgramRef.value?.submit();
}

function onProgramSaved(payload: { programId: string }) {
    programId.value = payload.programId;
    activateCallback('2');
}

function closeDialog() {
    emit('closeDialog');
}

watch(
    () => editProgramRef.value?.isSubmitting?.value,
    (val) => console.log('isSubmitting changed:', val)
)
</script>

<template>
    <div class="flex justify-center">
        <Stepper value="1" linear class="basis-[50rem]">
            <StepList>
                <Step value="1">Header I</Step>
                <Step value="2">Header II</Step>
                <Step value="3">Header III</Step>
            </StepList>
            <StepPanels>
                <StepPanel v-slot="{ activateCallback }" value="1">
                    <div class="flex flex-col">
                        <EditProgram :showBtn="false" ref="editProgramRef" />
                    </div>
                    <div class="flex pt-6 gap-2 justify-end">
                        <Button type="button" severity="danger" size="small" @click="closeDialog" outlined :label="$t('Cancel')" icon="pi pi-times" />
                        <Button type="submit" size="small" @click="submitProgram" :label="$t('Save')" :loading="isSubmitting" icon="pi pi-save" @saved="onProgramSaved" />
                    </div>
                </StepPanel>
                <StepPanel v-slot="{ activateCallback }" value="2">
                    <div class="flex flex-col h-48">
                        <div class="border-2 border-dashed border-surface-200 dark:border-surface-700 rounded bg-surface-50 dark:bg-surface-950 flex-auto flex justify-center items-center font-medium">Content II</div>
                    </div>
                    <div class="flex pt-6 justify-between">
                        <Button label="Back" severity="secondary" icon="pi pi-arrow-left" @click="activateCallback('1')" />
                        <Button label="Next" icon="pi pi-arrow-right" iconPos="right" @click="activateCallback('3')" />
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
