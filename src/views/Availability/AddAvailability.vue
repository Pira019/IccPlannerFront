<script setup lang="ts">
import { ProgressSpinner } from 'primevue';
</script>

<template>
    <div class="text-center">
        <ProgressSpinner />
        <div class="p-4 space-y-4">
            <h3 class="h1 font-bold">Régie</h3>
            <div class="flex items-center justify-between bg-gray-100 p-3 rounded-lg shadow">
                <p><i class="pi pi-info-circle pr-1" v-tooltip="'Ajouter mes disponibilite'"></i> <span class="font-bold"> APP - </span> Service 1 — Heure d'arrivée : <span class="font-bold"> 8 h 30</span></p>
                <Button severity="contrast" icon="pi pi-plus" aria-label="Accueil" />
            </div>
            <Message severity="info" class="mt-5" icon="pi pi-info-circle"> Cliquez sur le bouton a droite pour pouvoir mettre vos disponobilite. </Message>
        </div>
        <div class="text-right mt-5">
            <Button severity="contrast" label="Fermer" />
        </div>
    </div>
</template>
