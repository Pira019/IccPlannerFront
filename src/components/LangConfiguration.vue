<script setup>
import { ref, watchEffect } from 'vue';
import { useI18n } from 'vue-i18n';

// Initialiser useI18n
const { locale } = useI18n();

// Array of available languages
const language = ref([
    { name: 'fr-FR', flag: 'flag-fr' },
    { name: 'en-US', flag: 'flag-us' }
]);

const savedLanguage = localStorage.getItem('Accept-Language');
const currentLanguage = ref(savedLanguage || 'fr');

// If the stored language is not in the array, default to 'fr-FR'
if (!language.value.some((lang) => lang.name === currentLanguage.value)) {
    localStorage.setItem('Accept-Language', currentLanguage.value); // Store the default language
}

// Function to switch language
function switchLang() {
    const nextLang = currentLanguage.value === 'fr' ? 'en' : 'fr'; // Toggle between fr-FR and en-US
    localStorage.setItem('Accept-Language', nextLang); // Save the selected language to localStorage
    currentLanguage.value = nextLang; // Update the currentLanguage ref
}

watchEffect(() => {
    locale.value = currentLanguage.value;
});
</script>

<template>
    <div class="fixed flex gap-4 top-8 right-8">
        <div class="relative">
            <button @click="switchLang">
                <!-- Dynamically update the flag based on currentLanguage -->
                <span class="flag" :class="currentLanguage === 'fr' ? 'flag-us' : 'flag-fr'"></span>
            </button>
        </div>
    </div>
</template>
