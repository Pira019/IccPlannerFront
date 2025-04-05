import { createApp } from 'vue';
import { createI18n } from 'vue-i18n';
import { z } from 'zod';
import App from './App.vue';
import router from './router';

import Aura from '@primeuix/themes/aura';
import PrimeVue from 'primevue/config';
import ConfirmationService from 'primevue/confirmationservice';
import ToastService from 'primevue/toastservice';

import en from "@/lang/en.json";
import fr from "@/lang/fr.json";


import '@/assets/styles.scss';
import { makeZodI18nMap } from 'zod-vue-i18n';

const app = createApp(App);

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
app.use(i18n);
app.use(router);
app.use(PrimeVue, {
    theme: {
        preset: Aura,
        options: {
            darkModeSelector: '.app-dark'
        }
    }
});
app.use(ToastService);
app.use(ConfirmationService);

app.mount('#app');
