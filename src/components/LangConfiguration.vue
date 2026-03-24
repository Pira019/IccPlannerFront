<script setup>
import { ref, watchEffect } from 'vue';
import { useI18n } from 'vue-i18n';

const props = defineProps({
    isLoginPage: { type: Boolean, required: false }
});

const { locale } = useI18n();

const language = ref([{ name: 'fr-FR' }, { name: 'en-US' }]);

const savedLanguage = localStorage.getItem('Accept-Language');
const currentLanguage = ref(language.value.some((lang) => lang.name === savedLanguage) ? savedLanguage : 'fr-FR');

localStorage.setItem('Accept-Language', currentLanguage.value);
locale.value = currentLanguage.value;

function switchLang() {
    const nextLang = currentLanguage.value === 'fr-FR' ? 'en-US' : 'fr-FR';
    localStorage.setItem('Accept-Language', nextLang);
    currentLanguage.value = nextLang;
}

watchEffect(() => {
    locale.value = currentLanguage.value;
});

const flagSrc = (lang) => (lang === 'fr-FR' ? '/images/flag-fr.svg' : '/images/flag-gb.svg');
</script>

<template>
    <div :class="props.isLoginPage ? 'fixed flex gap-4 top-8 right-8' : ''">
        <button
            @click="switchLang"
            class="flex items-center gap-2 px-2 py-1 rounded-md hover:bg-surface-100 dark:hover:bg-surface-700 transition-colors cursor-pointer"
            :title="currentLanguage === 'fr-FR' ? 'Switch to English' : 'Passer en Français'"
        >
            <img
                :src="flagSrc(currentLanguage === 'fr-FR' ? 'en-US' : 'fr-FR')"
                :alt="currentLanguage === 'fr-FR' ? 'English' : 'Français'"
                class="w-6 h-4 rounded-sm object-cover shadow-sm border border-surface-200"
            />
            <span class="text-sm font-medium hidden sm:inline">{{ currentLanguage === 'fr-FR' ? 'EN' : 'FR' }}</span>
        </button>
    </div>
</template>
