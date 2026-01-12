/**
 * Formata uma string de data (YYYY-MM-DD) para o formato brasileiro (DD/MM/YYYY)
 * sem problemas de timezone.
 */
export function formatDateBR(dateString: string | null | undefined): string {
  if (!dateString) return '';

  // Pega apenas a parte da data (YYYY-MM-DD), ignorando timezone
  const datePart = dateString.split('T')[0];
  const [year, month, day] = datePart.split('-');

  return `${day}/${month}/${year}`;
}

/**
 * Formata uma string de data/hora para o formato brasileiro completo
 * (DD/MM/YYYY HH:mm)
 */
export function formatDateTimeBR(dateString: string | null | undefined): string {
  if (!dateString) return '';

  const date = new Date(dateString);
  return date.toLocaleString('pt-BR');
}
