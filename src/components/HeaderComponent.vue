<template>
    <div class="flex justify-between items-center">
        <h1 class="text-primary font-semibold">
            {{ titlePage }}
        </h1>
        <slot name="btn-add" />
    </div>
</template>

<script setup>
const props = defineProps({
    titlePage: { type: String, required: true }
});
</script>
