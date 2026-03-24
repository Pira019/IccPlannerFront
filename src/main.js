import { createApp, watch } from 'vue';
import { createI18n } from 'vue-i18n';
import { z } from 'zod';
import App from './App.vue';
import router from './router';

import { definePreset } from '@primeuix/themes';
import Aura from '@primeuix/themes/aura';
import PrimeVue from 'primevue/config';
import ConfirmationService from 'primevue/confirmationservice';
import DialogService from 'primevue/dialogservice';
import ToastService from 'primevue/toastservice';

import en from "@/lang/en.json";
import fr from "@/lang/fr.json";


import '@/assets/styles.scss';
import { createPinia } from 'pinia';
import { makeZodI18nMap } from 'zod-vue-i18n';
import { primevueLocales } from './lang/primevueLocales';

const app = createApp(App);
const pinia = createPinia();

const i18n = createI18n({
    legacy : false,
    locale: 'fr-FR',
    fallbackLocale: 'fr-FR',
    messages : {
        'fr-FR' : fr,
        'en-US' :  en
    }
})

z.setErrorMap(makeZodI18nMap(i18n))

const IccPreset = definePreset(Aura, {
    semantic: {
        primary: {
            50: '{neutral.50}',
            100: '{neutral.100}',
            200: '{neutral.200}',
            300: '{neutral.300}',
            400: '{neutral.400}',
            500: '{neutral.500}',
            600: '{neutral.600}',
            700: '{neutral.700}',
            800: '{neutral.800}',
            900: '{neutral.900}',
            950: '{neutral.950}'
        }
    }
});

app.use(pinia);
app.use(i18n);
app.use(router);
app.use(PrimeVue, {
    theme: {
        preset: IccPreset,
        options: {
            darkModeSelector: '.app-dark'
        }
    }
});
app.use(ToastService);
app.use(DialogService);
app.use(ConfirmationService);

app.mount('#app');

watch(
  () => i18n.global.locale.value,
  (newLocale) => {
    app.config.globalProperties.$primevue.config.locale =
      primevueLocales[newLocale] || primevueLocales[i18n.global.locale.value]
  },
  { immediate: true }
)
