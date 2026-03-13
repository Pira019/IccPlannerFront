import { PrimeVueResolver } from '@primevue/auto-import-resolver'
import vue from '@vitejs/plugin-vue'
import fs from 'fs'
import { fileURLToPath, URL } from 'node:url'
import Components from 'unplugin-vue-components/vite'
import { defineConfig } from 'vite'

export default defineConfig(({ command }) => {

  const isDev = command === 'serve'

  return {
    server: {
      host: 'localhost',
      port: 5173,
      strictPort: true,
      https: isDev
        ? {
            key: fs.readFileSync('localhost-key.pem'),
            cert: fs.readFileSync('localhost.pem')
          }
        : false
    },

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
    }
  }

})
