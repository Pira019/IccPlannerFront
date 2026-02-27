<template>
   <page-component :title-page="$t('liOverview')">
        <Tabs :value="$route.name" class="mb-5">
            <TabList>
                <Tab
                v-for="(tab, index) in items"
                :key="index"
                :value="tab.name"
                >
                <router-link
                    v-slot="{ href, navigate }"
                    :to="{ name: tab.name }"
                    custom
                >
                    <a
                    v-ripple
                    :href="href"
                    @click="navigate"
                    class="flex items-center gap-2 text-inherit"
                    >
                    <i :class="tab.icon" />
                    <span>{{ $t(tab.label) }}</span>
                    </a>
                </router-link>
                </Tab>
            </TabList>
        </Tabs>
        <div class="mb-5">
             <Fieldset class="w-full block">
                <div class="flex flex-col md:flex-row gap-4 md:justify-between md:items-center">
                    <DepartmentSelect @update:selected="departValue=$event"/>
                </div>
              </Fieldset>
        </div>
        <router-view v-slot="{ Component }">
            <component :is="Component" :department-selected="departValue"/>
        </router-view>
   </page-component>
</template>

<script setup>
import DepartmentSelect from '@/components/DepartmentSelect.vue';
import { ref } from 'vue';

const departValue = ref(null);

const items = ref([
    { name: 'planning', label: 'Dashboard', icon: 'pi pi-home' },
    { name: 'disponibility', label: 'liMydisponibility', icon: 'pi pi-calendar-plus' },
]);

</script>
