<template>
    <div class="flex justify-between items-center">
        <h1 class="text-[clamp(1.5rem,5vw,3rem)] font-semibold text-primary">
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
