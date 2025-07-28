// src/utils/formatters.js

// Função auxiliar para formatar datas para exibição
export const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  const year = date.getUTCFullYear();
  const month = (date.getUTCMonth() + 1).toString().padStart(2, '0');
  const day = date.getUTCDate().toString().padStart(2, '0');
  return `${day}/${month}/${year}`;
};

// Função auxiliar para formatar datas para inputs do tipo "date"
export const formatDateForInput = (isoDateString) => {
  if (!isoDateString) return '';
  const date = new Date(isoDateString);
  const utcYear = date.getUTCFullYear();
  const utcMonth = (date.getUTCMonth() + 1).toString().padStart(2, '0');
  const utcDay = date.getUTCDate().toString().padStart(2, '0');
  return `${utcYear}-${utcMonth}-${utcDay}`;
};