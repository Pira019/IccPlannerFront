<script setup>
const props = defineProps({
    titlePage: { type: String, required: true },
    subtitle: { type: String, default: null },
    icon: { type: String, default: null },
    showAddBtn: { type: Boolean, default: true },
    addBtnLabel: { type: String, default: null },
    breadcrumbs: { type: Array, default: () => [] },
    actions: { type: Array, default: () => [] }
});

const emit = defineEmits(['btn-add']);

const home = { icon: 'pi pi-home', route: '/' };
</script>

<template>
    <div class="card">
        <!-- Breadcrumbs -->
        <Breadcrumb v-if="breadcrumbs.length > 0" :home="home" :model="breadcrumbs" class="mb-4 !bg-transparent !p-0">
            <template #item="{ item }">
                <router-link v-if="item.route" :to="item.route" class="text-primary font-medium no-underline hover:underline">
                    <i v-if="item.icon" :class="item.icon" class="mr-1"></i>
                    {{ item.label }}
                </router-link>
                <span v-else class="text-muted-color">
                    <i v-if="item.icon" :class="item.icon" class="mr-1"></i>
                    {{ item.label }}
                </span>
            </template>
        </Breadcrumb>

        <!-- Header -->
        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div>
                <div class="flex items-center gap-3">
                    <i v-if="icon" :class="icon" class="text-2xl text-primary"></i>
                    <h1 class="text-[clamp(1.5rem,5vw,2.5rem)] font-semibold text-primary m-0">{{ titlePage }}</h1>
                </div>
                <p v-if="subtitle" class="text-muted-color mt-1 mb-0">{{ subtitle }}</p>
            </div>
            <div class="flex items-center gap-2">
                <!-- Custom actions -->
                <Button
                    v-for="(action, i) in actions"
                    :key="i"
                    :label="$t(action.label)"
                    :icon="action.icon"
                    :severity="action.severity || 'secondary'"
                    @click="action.action"
                    outlined
                />
                <!-- Default add button -->
                <Button
                    v-if="showAddBtn"
                    :label="addBtnLabel || $t('Add')"
                    icon="pi pi-plus"
                    @click="emit('btn-add')"
                />
            </div>
        </div>

        <slot></slot>
    </div>
</template>
