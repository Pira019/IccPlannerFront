<script setup>
import { useLayout } from '@/layout/composables/layout';
import { onMounted, ref, watch } from 'vue';

const props = defineProps({
    loading: {
        type: Boolean,
        default: false
    }
});

const { getPrimary, getSurface, isDarkTheme } = useLayout();

const chartData = ref(null);
const chartOptions = ref(null);

// Mock data — disponibilités par département
const departmentAvailability = [
    { departmentName: 'Louange', rate: 85 },
    { departmentName: 'Accueil', rate: 72 },
    { departmentName: 'Technique', rate: 60 },
    { departmentName: 'Intercession', rate: 90 },
    { departmentName: 'Enfants', rate: 55 },
    { departmentName: 'Communication', rate: 78 }
];

function setChartData() {
    const documentStyle = getComputedStyle(document.documentElement);

    return {
        labels: departmentAvailability.map((d) => d.departmentName),
        datasets: [
            {
                label: 'Disponibilité (%)',
                backgroundColor: departmentAvailability.map((d) => {
                    if (d.rate >= 80) return documentStyle.getPropertyValue('--p-green-400');
                    if (d.rate >= 60) return documentStyle.getPropertyValue('--p-primary-400');
                    return documentStyle.getPropertyValue('--p-orange-400');
                }),
                data: departmentAvailability.map((d) => d.rate),
                borderRadius: 6,
                barThickness: 32
            }
        ]
    };
}

function setChartOptions() {
    const documentStyle = getComputedStyle(document.documentElement);
    const borderColor = documentStyle.getPropertyValue('--surface-border');
    const textMutedColor = documentStyle.getPropertyValue('--text-color-secondary');

    return {
        maintainAspectRatio: false,
        aspectRatio: 0.8,
        indexAxis: 'y',
        plugins: {
            legend: {
                display: false
            },
            tooltip: {
                callbacks: {
                    label: (context) => `${context.parsed.x}%`
                }
            }
        },
        scales: {
            x: {
                min: 0,
                max: 100,
                ticks: {
                    color: textMutedColor,
                    callback: (value) => `${value}%`
                },
                grid: {
                    color: borderColor,
                    drawBorder: false
                }
            },
            y: {
                ticks: {
                    color: textMutedColor
                },
                grid: {
                    display: false
                }
            }
        }
    };
}

watch([getPrimary, getSurface, isDarkTheme], () => {
    chartData.value = setChartData();
    chartOptions.value = setChartOptions();
});

onMounted(() => {
    chartData.value = setChartData();
    chartOptions.value = setChartOptions();
});
</script>

<template>
    <div class="card">
        <div class="font-semibold text-xl mb-4">Disponibilités par département</div>

        <!-- Skeleton loader -->
        <template v-if="loading">
            <div class="flex flex-col gap-4">
                <Skeleton width="100%" height="1.5rem" v-for="i in 5" :key="i" />
            </div>
        </template>

        <!-- Chart -->
        <template v-else>
            <Chart type="bar" :data="chartData" :options="chartOptions" class="h-80" />
        </template>
    </div>
</template>
