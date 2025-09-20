<script setup>
    const props = defineProps({
        titlePage: { type: String, required: true }
    });
</script>
<template>
    <div className="card"> 
            <h1>
                {{ titlePage }}
            </h1>  
            <slot></slot> 
    </div>
</template>
