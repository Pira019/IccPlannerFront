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
