<script setup>
    
</script>

<template> 
    <PageComponent :title-page="$t('liProfil')"> 
        <div class="flex items-center gap-5">
            <div>
                <Avatar icon="pi pi-user" size="xlarge" label="LF" />
            </div>
            <div class="">
                <p class="font-bold text-xl">Pires Lufunula</p>
                <p>
                    <a href="mailto:xxx@xxx.com">
                        <i class="pi pi-envelope px-1" style="font-size: 1rem"></i>
                         exeplmeEmail@gmail.com</a>
                </p>
                <p class="font-bold">
                    <i class="pi pi-gift px-1" style="font-size: 1rem"></i>  12 Mai</p>
            </div>
        </div>
    </PageComponent> 
</template>
