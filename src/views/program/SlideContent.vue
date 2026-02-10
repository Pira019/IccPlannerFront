<script setup>
import { ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

const props = defineProps({
  prgs: {
    type: Array,
    default: () => []
  }
});

const selectedPrgs = ref([]);

watch(
  () => props.prgs,
  (newPrograms) => {
    selectedPrgs.value = newPrograms.map(p => p.id);
  },
  { immediate: true, deep: true }
);

</script>

<template>
    <Accordion :value="['0']" multiple>
        <AccordionPanel value="0">
            <AccordionHeader>{{ $t("liLstPrgs") }} </AccordionHeader>
            <AccordionContent>
                <div class="flex items-center w-full gap-2">
                    <Listbox  :options="prgs" filter  optionLabel="name" class="w-full border-none" >
                        <template #option="slotProps">
                            <div class="flex items-center justify-between w-full">
                                <div class="flex items-center gap-2 flex-1 min-w-0">
                                    <Checkbox
                                        v-model="selectedPrgs"
                                        :inputId="'prg-' + slotProps.option.id"
                                        name="prgs"
                                        :value="slotProps.option.id"
                                    />
                                    <label :for="'prg-' + slotProps.option.id" class="truncate">
                                        {{ slotProps.option.name }}
                                    </label>
                                </div>

                                <Button
                                    type="button"
                                    icon="pi pi-ellipsis-v"
                                    class="p-button-text p-button-rounded"
                                />
                            </div>
                        </template>
                    </Listbox>
                </div>
                <div class="mt-5">
                    <Button :label="t('liSeeMore')" variant="link" />
                </div>
            </AccordionContent>
        </AccordionPanel>
        <AccordionPanel value="1">
            <AccordionHeader>Listes de departements</AccordionHeader>
            <AccordionContent>
                <div>
                    <Listbox v-model="selectedCity" multiple :options="cities" filter optionLabel="name" class="w-full md:w-56 p-0 m-0 border-none" />
                </div>
            </AccordionContent>
        </AccordionPanel>
    </Accordion>
</template>

<style scoped>
.p-listbox {
    border: none !important;
    padding: 0 !important;
    margin: 0 !important;
}
.p-listbox .p-listbox-item {
    padding: 0 !important;
}
</style>
