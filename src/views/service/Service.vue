<template>
     <page-component :title-page="$t('servicesCulte')"
        :breadcrumbs="[{ label: $t('servicesCulte') }]"
        :showAddBtn="false">
        <div>
           <SearchComponent/>
        </div>
     </page-component>
</template>

<script setup>
import SearchComponent from './SearchComponent.vue';

</script>

