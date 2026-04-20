<script setup>
import MemberService from '@/service/MemberService';
import PlanningService from '@/service/PlanningService';
import { useHandleAsyncError } from '@/utils/handleAsyncError';
import { computed, onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';

const { t, locale } = useI18n();
const { handleAsyncError } = useHandleAsyncError();
const router = useRouter();

const profile = ref(null);
const assignments = ref([]);
const birthdays = ref([]);
const loading = ref(false);

const now = new Date();
const currentMonth = now.getMonth() + 1;
const currentYear = now.getFullYear();

const todayStr = computed(() => {
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
});

const greeting = computed(() => {
    const hour = now.getHours();
    if (hour < 12) { return t('dashboard.goodMorning'); }
    if (hour < 18) { return t('dashboard.goodAfternoon'); }
    return t('dashboard.goodEvening');
});

const todayFormatted = computed(() => {
    return now.toLocaleDateString(locale.value, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
});

// Toutes les assignations du mois triées
const allAssignments = computed(() => {
    return [...assignments.value].sort((a, b) => a.date.localeCompare(b.date));
});

// Prochaines (aujourd'hui + futur) pour la liste
const upcomingAssignments = computed(() => {
    const today = todayStr.value;
    return allAssignments.value.filter(a => a.date >= today).slice(0, 5);
});

// Compteur futur seulement (pas aujourd'hui)
const upcomingCount = computed(() => {
    const today = todayStr.value;
    return assignments.value.filter(a => a.date > today).length;
});

const totalThisMonth = computed(() => assignments.value.length);

const totalDepartments = computed(() => profile.value?.departments?.length || 0);

function formatDateShort(dateStr) {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString(locale.value, { weekday: 'short', day: 'numeric', month: 'short' });
}

function isToday(dateStr) { return dateStr === todayStr.value; }

async function fetchData() {
    const [profileRes, planningRes, birthdayRes] = await Promise.all([
        handleAsyncError(() => MemberService.getMyProfile(), (val) => (loading.value = val)),
        handleAsyncError(() => PlanningService.getMyPlanning(currentMonth, currentYear)),
        handleAsyncError(() => MemberService.getBirthdays(currentMonth))
    ]);
    if (profileRes.result) { profile.value = profileRes.result; }
    if (planningRes.result) { assignments.value = planningRes.result; }
    if (birthdayRes.result) { birthdays.value = birthdayRes.result; }
}

function goTo(name) { router.push({ name }); }

onMounted(() => fetchData());
</script>

<template>
    <div class="card">
        <!-- Loading -->
        <div v-if="loading" class="flex justify-center py-12">
            <ProgressSpinner />
        </div>

        <template v-else>
            <!-- Welcome -->
            <div class="mb-8">
                <h1 class="text-3xl font-bold m-0">
                    {{ greeting }}, {{ profile?.name || '' }} 👋
                </h1>
                <p class="text-muted-color mt-1 mb-0 capitalize">{{ todayFormatted }}</p>
            </div>

            <!-- Stats cards -->
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                <div class="bg-primary/10 rounded-xl p-5 flex items-center gap-4">
                    <div class="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                        <i class="pi pi-calendar-plus text-primary text-xl"></i>
                    </div>
                    <div>
                        <div class="text-2xl font-bold">{{ totalThisMonth }}</div>
                        <div class="text-sm text-muted-color">{{ t('dashboard.assignmentsThisMonth') }}</div>
                    </div>
                </div>
                <div class="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-5 flex items-center gap-4">
                    <div class="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-800/30 flex items-center justify-center">
                        <i class="pi pi-sitemap text-blue-600 text-xl"></i>
                    </div>
                    <div>
                        <div class="text-2xl font-bold">{{ totalDepartments }}</div>
                        <div class="text-sm text-muted-color">{{ t('dashboard.departments') }}</div>
                    </div>
                </div>
                <div class="bg-green-50 dark:bg-green-900/20 rounded-xl p-5 flex items-center gap-4">
                    <div class="w-12 h-12 rounded-full bg-green-100 dark:bg-green-800/30 flex items-center justify-center">
                        <i class="pi pi-check-circle text-green-600 text-xl"></i>
                    </div>
                    <div>
                        <div class="text-2xl font-bold">{{ upcomingCount }}</div>
                        <div class="text-sm text-muted-color">{{ t('dashboard.upcoming') }}</div>
                    </div>
                </div>
            </div>

            <!-- Quick actions -->
            <div class="flex flex-wrap gap-3 mb-8">
                <Button icon="pi pi-calendar" :label="t('dashboard.myPlanning')" outlined @click="goTo('my-planning')" />
                <Button icon="pi pi-calendar-plus" :label="t('dashboard.myAvailability')" outlined @click="goTo('disponibility')" />
                <Button icon="pi pi-user" :label="t('dashboard.myProfile')" outlined @click="goTo('profil')" />
            </div>

            <!-- Upcoming assignments -->
            <div>
                <h2 class="text-lg font-semibold mb-4 flex items-center gap-2">
                    <i class="pi pi-clock text-primary"></i>
                    {{ t('dashboard.nextAssignments') }}
                </h2>

                <div v-if="upcomingAssignments.length === 0 && allAssignments.length === 0" class="flex flex-col items-center py-8 text-surface-400">
                    <i class="pi pi-calendar text-4xl mb-3"></i>
                    <span>{{ t('dashboard.noUpcoming') }}</span>
                </div>

                <div v-else class="flex flex-col gap-3">
                    <div v-for="(a, idx) in (upcomingAssignments.length > 0 ? upcomingAssignments : allAssignments.slice(0, 5))" :key="idx"
                        class="flex items-center gap-4 p-4 rounded-xl border transition-all"
                        :class="{
                            'border-primary bg-primary/5 shadow-sm': isToday(a.date),
                            'border-surface-200 dark:border-surface-700': !isToday(a.date)
                        }">
                        <div class="flex flex-col items-center min-w-[70px]">
                            <span class="text-lg font-bold" :class="isToday(a.date) ? 'text-primary' : ''">
                                {{ new Date(a.date + 'T00:00:00').getDate() }}
                            </span>
                            <span class="text-xs uppercase" :class="isToday(a.date) ? 'text-primary' : 'text-muted-color'">
                                {{ new Date(a.date + 'T00:00:00').toLocaleDateString(locale, { month: 'short' }) }}
                            </span>
                            <span class="text-[0.6rem] uppercase text-muted-color">
                                {{ new Date(a.date + 'T00:00:00').toLocaleDateString(locale, { weekday: 'short' }) }}
                            </span>
                            <Tag v-if="isToday(a.date)" :value="t('liToDay')" severity="primary" class="text-[0.6rem] mt-1" />
                        </div>
                        <div class="flex-1">
                            <div class="font-semibold">{{ a.serviceName }}</div>
                            <div class="text-sm text-muted-color flex items-center gap-2 mt-0.5">
                                <Tag :value="a.programShortName || a.programName?.substring(0, 3)" severity="info" class="text-xs" />
                                <span>{{ a.departmentName }}</span>
                            </div>
                            <div v-if="a.posteName" class="mt-1">
                                <Tag :value="a.posteName" severity="secondary" class="text-xs" />
                                <Tag v-if="a.indTraining" :value="t('planning.trainingTag')" severity="warn" class="text-xs ml-1" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Birthdays -->
            <div class="mt-8" v-if="birthdays.length > 0">
                <h2 class="text-lg font-semibold mb-4 flex items-center gap-2">
                    <i class="pi pi-gift text-pink-500"></i>
                    {{ t('dashboard.birthdays') }} 🎂
                </h2>
                <div class="flex flex-wrap gap-3">
                    <div v-for="(b, idx) in birthdays" :key="idx"
                        class="flex items-center gap-3 px-4 py-3 rounded-xl border border-pink-200 dark:border-pink-800 bg-pink-50 dark:bg-pink-900/20"
                        :class="{ 'ring-2 ring-pink-400': b.day === now.getDate() }">
                        <div class="text-2xl">🎂</div>
                        <div>
                            <div class="font-semibold text-sm">{{ b.displayName }}</div>
                            <div class="text-xs text-muted-color">{{ b.day }} {{ new Date(2000, parseInt(b.birthDate.split('-')[0]) - 1).toLocaleDateString(locale, { month: 'long' }) }} · {{ b.departmentName }}</div>
                        </div>
                    </div>
                </div>
            </div>
        </template>
    </div>
</template>
