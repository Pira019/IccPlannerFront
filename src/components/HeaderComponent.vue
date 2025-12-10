<template>
    <div className="card">
        <div class="flex">
            <div class="font-semibold text-xl mb-4 w-14">
                <h1 class="text-primary">
                    {{ titlePage }}
                </h1>
            </div>

            <div class="w-32">
                <button>dd</button>
            </div>
            
        </div>
    </div>
</template>

<script setup>
const props = defineProps({
    titlePage: { type: String, required: true }
});
</script>
