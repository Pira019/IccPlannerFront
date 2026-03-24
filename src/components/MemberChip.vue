<script setup>
import { computed } from 'vue';

const props = defineProps({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    tag: { type: String, default: '' },
    size: { type: String, default: 'small' }
});

const initials = computed(() => {
    return (props.firstName?.[0] || '').toUpperCase() + (props.lastName?.[0] || '').toUpperCase();
});

const fullName = computed(() => {
    return `${props.firstName} ${props.lastName}`;
});
</script>

<template>
    <div class="member-chip flex items-center gap-1.5" :class="[`member-chip--${size}`]">
        <span
            class="member-chip__avatar flex items-center justify-center rounded-full bg-primary/15 text-primary font-semibold flex-shrink-0"
            :class="size === 'small' ? 'w-6 h-6 text-[0.625rem]' : 'w-8 h-8 text-xs'"
        >
            {{ initials }}
        </span>
        <span class="member-chip__name truncate" :class="size === 'small' ? 'text-[0.625rem]' : 'text-sm'">
            {{ fullName }}
        </span>
        <span v-if="tag" class="member-chip__tag rounded-sm px-1 py-px font-semibold bg-primary/10 text-primary" :class="size === 'small' ? 'text-[0.5rem]' : 'text-[0.625rem]'">
            {{ tag }}
        </span>
    </div>
</template>

<style scoped>
.member-chip {
    min-width: 0;
    max-width: 100%;
}

.member-chip--small {
    max-width: 180px;
}

.member-chip--normal {
    max-width: 200px;
}
</style>
