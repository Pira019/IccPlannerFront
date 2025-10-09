
<template>
    <div class="card">
        <Splitter style="height: 300px">
            <SplitterPanel class="flex items-center justify-center" :size="25" :minSize="10"> Panel 1 </SplitterPanel>
            <SplitterPanel class="flex items-center justify-center" :size="75"> Panel 2 </SplitterPanel>
        </Splitter>
    </div>

    <HeaderComponent :title-page="$t('AvailabilityTitlePage')" />
    <div class="card">
        <div class="text-center" v-if="loading">
            <ProgressSpinner aria-label="Loading" />
        </div>
        <Message class="mb-5" v-if="errorReq != null" severity="error">{{ errorReq?.message }}</Message>

        <Message v-if="dates" class="p-5 mb-5" icon="pi pi-info-circle" severity="info">{{ $t('defaultMsgAvailability') }}</Message>

        <CalendarComponent :dates-service="dates" @show-modal="show" @month-changed="onMonthChanged" />
    </div>
    <DynamicDialog /> 
</template>

<script setup>
</script>
