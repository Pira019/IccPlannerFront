<script setup>
    const props = defineProps({
        titlePage: { type: String, required: true }
    });
</script>
<template>
    <div className="card">
        <div class="font-semibold text-xl mb-4">
            <h1>
                {{ titlePage }}
            </h1>
        </div>
        <slot class="mb-4">
            le conntenu dans le slot
        </slot>
    </div>
</template>
