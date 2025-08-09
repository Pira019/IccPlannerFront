import { fileURLToPath, URL } from 'node:url';

import { PrimeVueResolver } from '@primevue/auto-import-resolver';
import vue from '@vitejs/plugin-vue';
import Components from 'unplugin-vue-components/vite';

import { defineConfig } from 'vite';

import fs from "fs";
// https://vitejs.dev/config/
export default defineConfig({
    optimizeDeps: {
        noDiscovery: true
    },
    plugins: [
        vue(),
        Components({
            resolvers: [PrimeVueResolver()]
        })
    ],
    resolve: {
        alias: {
            '@': fileURLToPath(new URL('./src', import.meta.url))
        }

    },
    server:{
        https:{
            key : fs.readFileSync(new URL('localhost-key.pem', import.meta.url)),
            cert : fs.readFileSync(new URL('localhost.pem', import.meta.url)),
        },
        host : true
     }

});
