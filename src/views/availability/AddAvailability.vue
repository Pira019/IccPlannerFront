<script setup lang="ts">
import LoadingDialogComponent from '@/components/LoadingDialogComponent.vue';
import AvailabilityService from '@/service/AvailabilityService';
import ServicePrgService from '@/service/ServicePrgService';
import { useHandleAsyncError } from '@/utils/handleAsyncError';
import { computed, onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';

const { handleAsyncError } = useHandleAsyncError();
const { t, locale } = useI18n();

const loading = ref(false);
const errorReq = ref(null);
const data = ref(null);

const emit = defineEmits(['closeModal', 'navigateDate']);

const props = defineProps({
    datePrg: {
        type: [String],
        required: true
    },
    idDepart: {
        type: [Number],
        default: null
    },
    availableDates: {
        type: Array,
        default: () => []
    },
    notInDepartment: {
        type: Boolean,
        default: false
    }
});

const errorReqToggle = ref({});
const loadingIndex = ref(null);
const loadingAllIndex = ref(null);

// Navigation entre dates disponibles
const currentDateIndex = computed(() => {
    return props.availableDates.indexOf(props.datePrg);
});

const hasPrevDate = computed(() => currentDateIndex.value > 0);
const hasNextDate = computed(() => currentDateIndex.value < props.availableDates.length - 1);

function goToPrevDate() {
    if (hasPrevDate.value) {
        emit('navigateDate', props.availableDates[currentDateIndex.value - 1]);
    }
}

function goToNextDate() {
    if (hasNextDate.value) {
        emit('navigateDate', props.availableDates[currentDateIndex.value + 1]);
    }
}

// Formater une date courte (ex: "25 juin")
function formatShortDate(dateStr) {
    if (!dateStr) return '';
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString(locale.value, { day: 'numeric', month: 'long' });
}

const prevDateLabel = computed(() => hasPrevDate.value ? formatShortDate(props.availableDates[currentDateIndex.value - 1]) : '');
const nextDateLabel = computed(() => hasNextDate.value ? formatShortDate(props.availableDates[currentDateIndex.value + 1]) : '');

// Date formatée lisible
const formattedDate = computed(() => {
    if (!props.datePrg) return '';
    const d = new Date(props.datePrg + 'T00:00:00');
    return d.toLocaleDateString(locale.value, {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });
});

// Compteur de dispos par programme
function availableCount(servicePrograms) {
    if (!servicePrograms) return { selected: 0, total: 0 };
    const total = servicePrograms.length;
    const selected = servicePrograms.filter(s => s.isAvailable).length;
    return { selected, total };
}

// Vérifier si tout est sélectionné dans un programme
function isAllSelected(servicePrograms) {
    return servicePrograms?.length > 0 && servicePrograms.every(s => s.isAvailable);
}

onMounted(async () => {
    const { result, error } = await handleAsyncError(
        () => ServicePrgService.GetServicePrgByDepartAsync(props.idDepart, props.datePrg),
        (val: boolean) => (loading.value = val)
    );
    errorReq.value = error;
    data.value = result;
});

async function addAvailable(serviceProgramId) {
    const { error } = await handleAsyncError(
        () => AvailabilityService.addAvailability(props.idDepart, [serviceProgramId]),
        () => {},
        true,
        'msgAvailability'
    );
    return error;
}

async function deleteAvailable(serviceProgramId) {
    const { error } = await handleAsyncError(
        () => AvailabilityService.delete(serviceProgramId),
        () => {},
        true,
        'msgUnAvailability'
    );
    return error;
}

async function toggleAvailable(serviceProgramId, indexDept, indexServicePrg) {
    errorReqToggle.value = {};
    loadingIndex.value = `${indexDept}-${indexServicePrg}`;

    const isAvailable = !data.value.servicePrgDates[indexDept].servicePrg[indexServicePrg].isAvailable;
    const error = isAvailable
        ? await addAvailable(serviceProgramId)
        : await deleteAvailable(serviceProgramId);

    if (!error?.message) {
        data.value.servicePrgDates[indexDept].servicePrg[indexServicePrg].isAvailable = isAvailable;
    } else {
        errorReqToggle.value = { [indexDept]: error };
    }

    loadingIndex.value = null;
}

async function toggleAll(indexDept) {
    loadingAllIndex.value = indexDept;
    errorReqToggle.value = {};
    const item = data.value.servicePrgDates[indexDept];
    const allSelected = isAllSelected(item.servicePrg);

    if (allSelected) {
        // Désélectionner tout — un par un (delete ne prend qu'un ID)
        for (let i = 0; i < item.servicePrg.length; i++) {
            const sp = item.servicePrg[i];
            if (sp.isAvailable) {
                await toggleAvailable(sp.id, indexDept, i);
            }
        }
    } else {
        // Sélectionner tout — un seul appel API avec tous les IDs non sélectionnés
        const idsToAdd = item.servicePrg.filter(sp => !sp.isAvailable).map(sp => sp.id);
        if (idsToAdd.length > 0) {
            const { error } = await handleAsyncError(
                () => AvailabilityService.addAvailability(props.idDepart, idsToAdd),
                () => {},
                true,
                'msgAvailability'
            );
            if (!error?.message) {
                item.servicePrg.forEach(sp => { sp.isAvailable = true; });
            } else {
                errorReqToggle.value = { [indexDept]: error };
            }
        }
    }
    loadingAllIndex.value = null;
}
</script>

<template>
    <div class="flex flex-col gap-4 sm:gap-5 p-0 sm:p-1">
        <LoadingDialogComponent :onLoading="loading" :error-req="errorReq" />

        <!-- Header avec date formatée -->
        <div class="flex items-center gap-3">
            <div class="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10">
                <i class="pi pi-calendar-clock text-primary text-lg"></i>
            </div>
            <div class="flex flex-col">
                <h2 class="text-lg font-bold m-0 text-surface-800">{{ $t('liAvailability') }}</h2>
                <span class="text-sm text-surface-400 capitalize">{{ formattedDate }}</span>
            </div>
        </div>

        <Divider class="m-0" />

        <!-- Message si pas dans le département -->
        <Message v-if="props.notInDepartment" severity="warn" :closable="false">
            {{ $t('notInDepartment') }}
        </Message>

        <!-- Contenu scrollable -->
        <div class="flex flex-col gap-5 max-h-[60vh] overflow-y-auto pr-1" :class="{ 'opacity-50 pointer-events-none': props.notInDepartment }">
            <div v-for="(item, indexDept) in data?.servicePrgDates" :key="indexDept" class="flex flex-col gap-3">
                <!-- Nom du programme + compteur + tout sélectionner -->
                <div class="flex items-center justify-between">
                    <div class="flex items-center gap-2">
                        <i class="pi pi-bookmark-fill text-primary text-sm"></i>
                        <span class="font-semibold text-surface-700 text-sm uppercase tracking-wide">{{ item.prgName }}</span>
                        <Tag :value="`${availableCount(item.servicePrg).selected}/${availableCount(item.servicePrg).total}`"
                            :severity="availableCount(item.servicePrg).selected > 0 ? 'success' : 'secondary'"
                            rounded class="text-xs" />
                    </div>
                    <div class="flex items-center gap-2 cursor-pointer" @click="toggleAll(indexDept)">
                        <ProgressSpinner v-if="loadingAllIndex === indexDept" style="width: 20px; height: 20px" strokeWidth="4" />
                        <Checkbox v-else :modelValue="isAllSelected(item.servicePrg)" :binary="true" :disabled="loadingIndex !== null || loadingAllIndex !== null" @click.stop="toggleAll(indexDept)" />
                        <label class="text-sm cursor-pointer">{{ isAllSelected(item.servicePrg) ? $t('liDeselectAll') : $t('liSelectAll') }}</label>
                    </div>
                </div>

                <!-- Erreur pour ce programme -->
                <Message v-if="errorReqToggle[indexDept]" severity="error" :closable="false" class="text-xs">
                    {{ errorReqToggle[indexDept]?.message }}
                </Message>

                <!-- Services -->
                <TransitionGroup name="card-toggle" tag="div" class="flex flex-col gap-2">
                    <div
                        v-for="(servicePrg, indexServicePrg) in item.servicePrg"
                        :key="servicePrg.id"
                        class="flex items-center justify-between gap-3 p-3 sm:p-4 rounded-xl border transition-all duration-300 cursor-pointer"
                        :class="servicePrg.isAvailable
                            ? 'border-green-200 bg-green-50 hover:bg-green-100/70 shadow-sm'
                            : 'border-surface-200 bg-surface-0 hover:bg-surface-50 hover:shadow-sm'"
                        role="button"
                        :aria-label="`${servicePrg.displayName} - ${servicePrg.startTime} ${servicePrg.endTime} - ${servicePrg.isAvailable ? $t('liAvailable') : $t('liUnavailable')}`"
                        @click="toggleAvailable(servicePrg.id, indexDept, indexServicePrg)"
                    >
                        <!-- Indicateur gauche -->
                        <div class="flex items-start gap-3 min-w-0 flex-1">
                            <div
                                class="w-1 self-stretch rounded-full flex-shrink-0 transition-colors duration-300"
                                :class="servicePrg.isAvailable ? 'bg-green-400' : 'bg-surface-200'"
                            ></div>

                            <div class="flex flex-col gap-1.5 min-w-0">
                                <span class="font-semibold text-sm sm:text-base text-surface-800">{{ servicePrg.displayName }}</span>

                                <div class="flex items-center gap-1.5">
                                    <i class="pi pi-clock text-xs text-surface-400"></i>
                                    <span class="text-xs sm:text-sm text-surface-500">{{ servicePrg.startTime }} – {{ servicePrg.endTime }}</span>
                                </div>

                                <!-- Heure d'arrivée -->
                                <div v-if="servicePrg.arrivalTime" class="flex items-center gap-1.5 mt-0.5">
                                    <i class="pi pi-exclamation-triangle text-xs text-orange-500"></i>
                                    <span class="text-xs text-orange-600">{{ servicePrg.arrivalTime }}</span>
                                </div>

                                <!-- Commentaire -->
                                <div v-if="servicePrg.comment" class="flex items-center gap-1.5 mt-0.5">
                                    <i class="pi pi-info-circle text-xs text-blue-400"></i>
                                    <span class="text-xs text-blue-500">{{ servicePrg.comment }}</span>
                                </div>
                            </div>
                        </div>

                        <!-- Toggle ou Spinner -->
                        <div class="flex-shrink-0 flex items-center gap-2">
                            <ProgressSpinner v-if="loadingIndex === `${indexDept}-${indexServicePrg}`"
                                style="width: 24px; height: 24px" strokeWidth="4" />
                            <ToggleSwitch
                                :modelValue="servicePrg.isAvailable"
                                :disabled="loadingIndex !== null"
                            />
                        </div>
                    </div>
                </TransitionGroup>
            </div>

            <!-- État vide -->
            <div v-if="!loading && (!data?.servicePrgDates || data.servicePrgDates.length === 0)" class="flex flex-col items-center gap-3 py-8 text-surface-400">
                <i class="pi pi-calendar text-4xl"></i>
                <span class="text-sm">{{ $t('liNoElement') }}</span>
            </div>
        </div>

        <Divider class="m-0" />

        <!-- Footer avec navigation dates -->
        <div class="flex items-center justify-between">
            <!-- Bouton fermer à gauche -->
            <Button severity="secondary" @click="$emit('closeModal')" :label="$t('bntClose')" outlined rounded />

            <!-- Nav dates à droite -->
            <div class="flex items-center gap-2">
                <Button v-if="hasPrevDate"
                    :label="prevDateLabel"
                    icon="pi pi-chevron-left"
                    outlined rounded
                    @click="goToPrevDate" />

                <Button v-if="hasNextDate"
                    :label="nextDateLabel"
                    icon="pi pi-chevron-right"
                    iconPos="right"
                    outlined rounded
                    @click="goToNextDate" />
            </div>
        </div>
    </div>
</template>

<style scoped>
.card-toggle-enter-active,
.card-toggle-leave-active {
    transition: all 0.3s ease;
}
.card-toggle-enter-from,
.card-toggle-leave-to {
    opacity: 0;
    transform: translateY(-10px);
}
</style>
