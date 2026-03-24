<script setup>
const props = defineProps({
    icon: { type: String, default: 'pi pi-inbox' },
    title: { type: String, required: true },
    description: { type: String, default: null },
    actionLabel: { type: String, default: null },
    actionIcon: { type: String, default: 'pi pi-plus' }
});

const emit = defineEmits(['action']);
</script>

<template>
    <div class="flex flex-col items-center justify-center py-12 text-center">
        <div class="flex items-center justify-center w-20 h-20 rounded-full bg-surface-100 dark:bg-surface-700 mb-5">
            <i :class="icon" class="!text-4xl text-muted-color"></i>
        </div>
        <h3 class="text-xl font-semibold text-surface-900 dark:text-surface-0 mb-2 m-0">{{ $t(title) }}</h3>
        <p v-if="description" class="text-muted-color text-sm max-w-md mb-5">{{ $t(description) }}</p>
        <Button
            v-if="actionLabel"
            :label="$t(actionLabel)"
            :icon="actionIcon"
            @click="emit('action')"
            class="mt-2"
        />
    </div>
</template>
