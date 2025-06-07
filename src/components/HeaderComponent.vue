<template>
    <div className="card">
        <div class="font-semibold text-xl mb-4">
            <h1>
                {{ titlePage }}
            </h1>
        </div>
    </div>
</template>

<script setup>
const props = defineProps({
    titlePage: { type: String, required: true }
});
</script>
