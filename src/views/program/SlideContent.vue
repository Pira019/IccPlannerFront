<script setup>
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

const props = defineProps({
  prgs: { type: Array, default: () => [] },
  departments: { type: Array, default: () => [] }
});
</script>

<template>
    <Accordion :value="['0', '1']" multiple>
        <AccordionPanel value="0">
            <AccordionHeader>{{ $t("liLstPrgs") }}</AccordionHeader>
            <AccordionContent>
                <div class="flex flex-col gap-2">
                    <div v-for="prg in prgs" :key="prg.id" class="flex items-center gap-2 py-1">
                        <i class="pi pi-circle-fill text-primary text-[8px]"></i>
                        <span class="text-sm break-words">
                            <span v-if="prg.shortName" class="font-bold uppercase mr-1">{{ prg.shortName }}</span>
                            {{ prg.name }}
                        </span>
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
                        <i class="pi pi-circle-fill text-blue-500 text-[8px]"></i>
                        <span class="text-sm break-words">
                            <span v-if="dept.shortName" class="font-bold uppercase mr-1">{{ dept.shortName }}</span>
                            {{ dept.name }}
                        </span>
                    </div>
                    <div v-if="departments.length === 0" class="text-sm text-muted-color py-2">{{ $t('liNoElement') }}</div>
                </div>
            </AccordionContent>
        </AccordionPanel>
    </Accordion>
</template>
