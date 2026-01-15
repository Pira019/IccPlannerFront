<template>
    <Accordion :value="['0']" multiple>
        <AccordionPanel value="0">
            <AccordionHeader>Header I</AccordionHeader>
            <AccordionContent>
                <div>
                    <Listbox v-model="selectedCity" multiple :options="cities" filter optionLabel="name" class="w-full md:w-56 p-0 m-0 border-none" />
                </div>
            </AccordionContent>
        </AccordionPanel>
        <AccordionPanel value="1">
            <AccordionHeader>Header II</AccordionHeader>
            <AccordionContent>
                <div>
                    <Listbox v-model="selectedCity" multiple :options="cities" filter optionLabel="name" class="w-full md:w-56 p-0 m-0 border-none" />
                </div>
            </AccordionContent>
        </AccordionPanel>
    </Accordion>
</template>

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
