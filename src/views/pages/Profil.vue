<script setup>
    
</script>

<template> 
    <PageComponent :title-page="$t('liProfil')">
        <!-- Information personnelle -->
        <div class="font-semibold mt-8 my-8">
            <h2 class="text-xl">Information personnelle</h2>
        </div>
        <div class="flex flex-col my-5">   
            <div class="flex flex-wrap gap-4">
                <div class="w-full sm:w-auto flex justify-center sm:justify-start">

                    <Avatar image="https://www.gravatar.com/avatar/05dfd4b41340d09cae045235eb0893c3?d=mp" class="flex items-center justify-center mr-2" size="xlarge"  />
                </div>
                <div class="flex flex-col flex-1 gap-4">
                    <div class="flex flex-col sm:flex-row sm:gap-4 w-full">
                        <!-- Name -->
                        <div class="flex flex-col flex-1 gap-2">
                            <label for="name2" class="font-semibold text-gray-700">Name</label>
                            <InputText id="name2" type="text" class="w-full" />
                        </div>

                        <!-- Email -->
                        <div class="flex flex-col flex-1 gap-2">
                            <label for="email2" class="font-semibold text-gray-700">Email</label>
                            <InputText id="email2" type="text" class="w-full" />
                        </div>
                    </div>
                </div>   
            </div>
        </div>
        <!-- Fin Information personnelle -->
        <!-- Information personnelle -->
        <div class="font-semibold mt-8 my-8">
            <h2 class="text-xl">Coordonnées</h2>
        </div>
            <div class="w-auto">
                <div class="flex flex-col gap-4">
                    <div class="flex flex-wrap gap-4">
                        <div class="flex flex-col grow  gap-2">
                            <label for="name2">Name</label>
                            <InputText id="name2" type="text" />
                        </div>
                        <div class="flex flex-col grow basis-0 gap-2">
                            <label for="email2">Email</label>
                            <InputText id="email2" type="text" />
                        </div>
                    </div>
                </div>
        </div>
        <!-- Fin Information personnelle -->
        <!-- Connexion et sécurité -->
        <div class="font-semibold mt-8 my-8">
            <h2 class="text-xl">Connexion et sécurité</h2>
        </div>
        <div class="flex items-center my-5">
            <div class="w-40">
                <Avatar icon="pi pi-user" size="xlarge" label="LF" />
            </div>
            <div class="w-auto">
                <div class="flex flex-col gap-4">
                    <div class="flex flex-wrap gap-4">
                        <div class="flex flex-col grow  gap-2">
                            <label for="name2">Name</label>
                            <InputText id="name2" type="text" />
                        </div>
                        <div class="flex flex-col grow basis-0 gap-2">
                            <label for="email2">Email</label>
                            <InputText id="email2" type="text" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <!-- Fin Connexion et sécurité -->

    </PageComponent> 
</template>
