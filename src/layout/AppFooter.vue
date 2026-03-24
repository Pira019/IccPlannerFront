<script setup>
const currentYear = new Date().getFullYear();
const appVersion = '4.3.0';
</script>

<template>
    <div class="layout-footer">
        <div class="flex flex-col sm:flex-row items-center justify-between w-full gap-2 text-sm">
            <span class="text-muted-color">
                © {{ currentYear }} ICC Star Planning — {{ $t('footer.by', 'Par') }}
                <a href="https://lfgl-tech.com/" target="_blank" rel="noopener noreferrer" class="text-primary font-medium hover:underline">Lfgl-tech</a>
            </span>
            <div class="flex items-center gap-4 text-muted-color">
                <span>v{{ appVersion }}</span>
            </div>
        </div>
    </div>
</template>
