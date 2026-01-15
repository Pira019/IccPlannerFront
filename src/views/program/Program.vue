<template>
    <PageComponent :title-page="$t('Programs')">
        <div class="flex flex-col h-screen">
            <!-- Barre d'outils -->
            <div class="border-b border-gray-200 p-4 flex items-center justify-between flex-wrap">
                <div class="flex items-center gap-2">
                    <!-- Hamburger mobile -->
                    <Button icon="pi pi-bars" text @click="sidebarOpen = !sidebarOpen" class="sm:hidden" />
                    <span class="text-lg font-medium">Aujourd'hui</span>
                </div>

                <div class="flex items-center gap-2 flex-wrap mt-2 sm:mt-0">
                    <Button label="Mois" icon="pi pi-calendar" outlined class="hidden sm:flex" />
                    <Button label="Filtre appliqué" icon="pi pi-filter" outlined class="hidden sm:flex" />
                    <Button icon="pi pi-ellipsis-h" text />
                    <Button label="Nouveau" icon="pi pi-plus" severity="primary" />
                </div>
            </div>

            <!-- Contenu principal -->
            <div class="flex flex-1 flex-col sm:flex-row overflow-hidden">
                <!-- Sidebar -->
                <div :class="[
          'bg-white border-r border-gray-200 p-4 overflow-y-auto',
          'w-full sm:w-64', // full width mobile, 64px desktop
          sidebarOpen || 'hidden sm:flex' // mobile toggle
        ]">
                    <div>
                         dd
                         dd
                    </div>
                    </div>

                <!-- Calendrier principal -->
                <div class="flex-1 p-4 overflow-auto">
                    <CalendarComponent />
                </div>
            </div>
        </div>
    </PageComponent>

</template>
 
