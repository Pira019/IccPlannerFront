<script setup>
import { ref } from 'vue';

const selectedCity = ref();
const cities = ref([
    { name: 'New York', code: 'NY' },
    { name: 'Rome', code: 'RM' },
    { name: 'London', code: 'LDN' },
    { name: 'Istanbul', code: 'IST' },
    { name: 'Paris', code: 'PRS' }
]);
</script>

<template>
    <Accordion :value="['0']" multiple>
        <AccordionPanel value="0">
            <AccordionHeader>Liste de programmes</AccordionHeader>
            <AccordionContent>
                <div class="flex items-center w-full gap-2">
                    <Listbox v-model="selectedCity" multiple :options="cities" filter optionLabel="name" class="w-full md:w-56 p-0 m-0 border-none" >
                        <template #option="slotProps">
                        <div class="flex items-center justify-between w-full">
                            <!-- Nom de l'élément -->
                            <span>{{ slotProps.option.name }}</span>
                            <div>
                                <Button
                                    type="button"
                                    icon="pi pi-ellipsis-v"
                                    class="p-button-text p-button-rounded"
                                />
                                <!-- Menu spécifique à l'élément -->
                            </div>
                        </div>
                        </template>
                    </Listbox>
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
