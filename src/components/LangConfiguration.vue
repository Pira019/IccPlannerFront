<script setup lang="ts">
import { ref, watchEffect } from 'vue';
import { useI18n } from 'vue-i18n';
import { boolean } from 'zod';

const props = defineProps({
    isLoginPage: { type: boolean, required: false }
});

// Initialiser useI18n
const { locale } = useI18n();

// Array of available languages
const language = ref([{ name: 'fr-FR' }, { name: 'en-US' }]);

const savedLanguage = localStorage.getItem('Accept-Language');
const currentLanguage = ref(language.value.some((lang) => lang.name === savedLanguage) ? savedLanguage : 'fr-FR');

// Met à jour localStorage et i18n avec la langue courante
localStorage.setItem('Accept-Language', currentLanguage.value);
locale.value = currentLanguage.value;

// Function to switch language
function switchLang() {
    const nextLang = currentLanguage.value === 'fr-FR' ? 'en-US' : 'fr-FR'; // Toggle between fr-FR and en-US
    localStorage.setItem('Accept-Language', nextLang); // Save the selected language to localStorage
    currentLanguage.value = nextLang; // Update the currentLanguage ref
}

watchEffect(() => {
    locale.value = currentLanguage.value;
});
</script>

<template>
    <div :class="props.isLoginPage ? 'fixed flex gap-4 top-8 right-8' : ''">
        <div class="relative">
            <button @click="switchLang">
                <!-- Dynamically update the flag based on currentLanguage -->
                <span class="flag" :class="currentLanguage === 'fr-FR' ? 'flag-us' : 'flag-fr'"></span>
            </button>
        </div>
    </div>
</template>
