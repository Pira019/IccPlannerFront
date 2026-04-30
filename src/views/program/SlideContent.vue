<script setup>
import { ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

const props = defineProps({
  prgs: { type: Array, default: () => [] },
  departments: { type: Array, default: () => [] }
});

const emit = defineEmits(['filterChanged']);

const selectedPrgs = ref([]);
const selectedDepts = ref([]);

watch(
  () => props.prgs,
  (newPrograms) => {
    selectedPrgs.value = newPrograms.map(p => p.id);
  },
  { immediate: true, deep: true }
);

watch(
  () => props.departments,
  (newDepts) => {
    selectedDepts.value = newDepts.map(d => d.id);
  },
  { immediate: true, deep: true }
);

// Émettre les filtres quand les sélections changent
watch([selectedPrgs, selectedDepts], () => {
  emit('filterChanged', {
    programIds: selectedPrgs.value,
    departmentIds: selectedDepts.value
  });
}, { deep: true });
</script>

<template>
    <Accordion :value="['0', '1']" multiple>
        <AccordionPanel value="0">
            <AccordionHeader>{{ $t("liLstPrgs") }}</AccordionHeader>
            <AccordionContent>
                <div class="flex flex-col gap-2">
                    <div v-for="prg in prgs" :key="prg.id" class="flex items-center gap-2 py-1">
                        <Checkbox v-model="selectedPrgs" :inputId="'prg-' + prg.id" :value="prg.id" />
                        <label :for="'prg-' + prg.id" class="text-sm truncate cursor-pointer">{{ prg.name }}</label>
                    </div>
                    <div v-if="prgs.length === 0" class="text-sm text-muted-color py-2">{{ $t('liNonPrg') }}</div>
                </div>
            </AccordionContent>
        </AccordionPanel>
        <AccordionPanel value="1">
            <AccordionHeader>{{ $t('liDepart') }}</AccordionHeader>
            <AccordionContent>
                <div class="flex flex-col gap-2">
                    <div v-for="dept in departments" :key="dept.id" class="flex items-center gap-2 py-1">
                        <Checkbox v-model="selectedDepts" :inputId="'dept-' + dept.id" :value="dept.id" />
                        <label :for="'dept-' + dept.id" class="text-sm truncate cursor-pointer">{{ dept.name }}</label>
                    </div>
                    <div v-if="departments.length === 0" class="text-sm text-muted-color py-2">{{ $t('liNoElement') }}</div>
                </div>
            </AccordionContent>
        </AccordionPanel>
    </Accordion>
</template>
