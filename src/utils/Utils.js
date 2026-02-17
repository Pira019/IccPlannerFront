export function capitalize(str) {
  if (!str || typeof str !== 'string') return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

export function getSelectedLabels(selectedIds, lst) {
  if (!selectedIds || !selectedIds.length) return '';

  // Gère à la fois les refs et les tableaux simples
  const list = Array.isArray(lst) ? lst : lst?.value || [];

  return selectedIds
    .map(id => {
      const dept = list.find(d => d.id === id);
      return dept?.name ? capitalize(dept.name) : '';
    })
    .filter(Boolean)
    .join(', ');
}


export const getDays = (t) => [
  { name: t('liMonday'), value: 1 },
  { name: t('liTuesday'), value: 2 },
  { name: t('liWednesday'), value: 3 },
  { name: t('liThursday'), value: 4 },
  { name: t('liFriday'), value: 5 },
  { name: t('liSaturday'), value: 6 },
  { name: t('liSunday'), value: 0 }
];

export const getDayNameFromGroupKey = (groupKey, t) => {
  const days = getDays(t); // ta fonction i18n existante

  if (!isNaN(groupKey)) {
    const found = days.find(d => d.value === Number(groupKey));
    return found ? found.name : '';
  }

  const date = new Date(groupKey);
  if (!isNaN(date)) {
    const dayIndex = date.getDay(); // 0 = Dimanche
    const dayName = days.find(d => d.value === dayIndex)?.name || '';

    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // JS = 0-11
    const year = date.getFullYear();

    return `${dayName}, ${day}-${month}-${year}`;
  }

  return groupKey;
};
