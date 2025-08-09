<script setup>
import { useLayout } from '@/layout/composables/layout';
import { updatePreset } from '@primeuix/themes';
import { onMounted, ref } from 'vue';

const { layoutConfig } = useLayout();
const primaryColor = ref({
    name: 'iccPurple',
    palette: {
        50: '#f3e9fb',
        100: '#dfc7f4',
        200: '#c39aec',
        300: '#a46ddb',
        400: '#8549c5',
        500: '#70358e', // couleur principale
        600: '#602e7d',
        700: '#4f2669',
        800: '#3f2057',
        900: '#2d153f',
        950: '#1a0a23'
    }
});

function getPresetExt() {
    return {
        semantic: {
            primary: primaryColor.value.palette,
            colorScheme: {
                light: {
                    primary: {
                        color: '{primary.500}',
                        contrastColor: '#ffffff',
                        hoverColor: '{primary.600}',
                        activeColor: '{primary.700}'
                    },
                    highlight: {
                        background: '{primary.50}',
                        focusBackground: '{primary.100}',
                        color: '{primary.700}',
                        focusColor: '{primary.800}'
                    }
                },
                dark: {
                    primary: {
                        color: '{primary.400}',
                        contrastColor: '{surface.900}',
                        hoverColor: '{primary.300}',
                        activeColor: '{primary.200}'
                    },
                    highlight: {
                        background: 'color-mix(in srgb, {primary.400}, transparent 84%)',
                        focusBackground: 'color-mix(in srgb, {primary.400}, transparent 76%)',
                        color: 'rgba(255,255,255,.87)',
                        focusColor: 'rgba(255,255,255,.87)'
                    }
                }
            }
        }
    };
}

onMounted(() => {
    layoutConfig.primary = primaryColor.value.name;
    updatePreset(getPresetExt());
});
</script>
