<script setup>
import { useI18n } from 'vue-i18n';
const { t } = useI18n();
</script>

<template>
    <div class="bg-surface-50 min-h-screen min-w-[100vw] overflow-hidden">
    <div class="flex justify-end p-4">
        <LangConfiguration />
    </div>
    <!-- Contenu principal centré -->
    <div class="flex items-center justify-center min-h-[calc(100vh-5rem)]">
        <div class="flex flex-col items-center justify-center">
            <div style="border-radius: 56px; padding: 0.3rem; background: linear-gradient(180deg, rgba(233, 30, 99, 0.4) 10%, rgba(33, 150, 243, 0) 30%)">
                <div class="w-full bg-surface-0 dark:bg-surface-900 py-20 px-8 sm:px-20 flex flex-col items-center" style="border-radius: 53px">
                    <div class="gap-4 flex flex-col items-center">
                        <div class="flex justify-center items-center border-2 border-pink-500 rounded-full" style="height: 3.2rem; width: 3.2rem">
                            <i class="pi pi-fw pi-exclamation-circle !text-2xl text-pink-500"></i>
                        </div>
                        <h1 class="text-surface-900 dark:text-surface-0 font-bold text-5xl mb-2"> {{t?.('errorOccured')}} </h1>
                        <span class="text-muted-color mb-8">{{t?.('internalError')}}</span>
                        <img src="/demo/images/error/asset-error.svg" alt="Error" class="mb-8" width="80%" />
                        <div class="col-span-12 mt-8 text-center">
                            <Button as="router-link" label="Go to Dashboard" to="/" severity="danger" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
</template>
