import { computed, ref } from 'vue';

export const WEEK_DAYS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

/**
 * Construit la grille calendrier (semaines × 7 jours) pour un mois donné.
 * Chaque cellule contient { day, dateStr, isToday } + les champs ajoutés par cellBuilder.
 *
 * @param {number} month - 1-12
 * @param {number} year
 * @param {(dateStr: string, dateObj: Date) => object} cellBuilder - retourne les champs supplémentaires pour chaque cellule
 * @returns {Array<Array<object|null>>} semaines
 */
export function buildCalendarWeeks(month, year, cellBuilder = () => ({})) {
    const firstDay = new Date(year, month - 1, 1);
    const lastDay = new Date(year, month, 0);
    const totalDays = lastDay.getDate();
    let startDow = firstDay.getDay() - 1;
    if (startDow < 0) startDow = 6;

    const weeks = [];
    let currentWeek = new Array(startDow).fill(null);
    const today = new Date();

    for (let day = 1; day <= totalDays; day++) {
        const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const dateObj = new Date(year, month - 1, day);
        const isToday = dateObj.getDate() === today.getDate() && dateObj.getMonth() === today.getMonth() && dateObj.getFullYear() === today.getFullYear();

        const extra = cellBuilder(dateStr, dateObj);
        currentWeek.push({ day, dateStr, isToday, ...extra });

        if (currentWeek.length === 7) {
            weeks.push(currentWeek);
            currentWeek = [];
        }
    }
    if (currentWeek.length > 0) {
        while (currentWeek.length < 7) currentWeek.push(null);
        weeks.push(currentWeek);
    }
    return weeks;
}

/**
 * Composable pour la navigation mensuelle avec label formaté.
 */
export function useMonthNavigation(initialMonth = null, initialYear = null) {
    const now = new Date();
    const month = ref(initialMonth ?? now.getMonth() + 1);
    const year = ref(initialYear ?? now.getFullYear());

    const monthLabel = computed(() => {
        const date = new Date(year.value, month.value - 1);
        return date.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
    });

    function navigateMonth(direction) {
        let m = month.value + direction;
        let y = year.value;
        if (m < 1) { m = 12; y--; }
        if (m > 12) { m = 1; y++; }
        month.value = m;
        year.value = y;
    }

    return { month, year, monthLabel, navigateMonth };
}

/**
 * Générateur pseudo-aléatoire avec seed pour des résultats stables.
 */
export function createSeededRandom(seed) {
    let s = seed;
    return function () {
        s = (s * 16807) % 2147483647;
        return (s - 1) / 2147483646;
    };
}

/**
 * Retourne les dimanches d'un mois donné au format YYYY-MM-DD.
 */
export function getSundays(month, year) {
    const sundays = [];
    const d = new Date(year, month - 1, 1);
    while (d.getMonth() === month - 1) {
        if (d.getDay() === 0) sundays.push(d.toISOString().split('T')[0]);
        d.setDate(d.getDate() + 1);
    }
    return sundays;
}
