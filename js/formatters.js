/**
 * Utilitários de formatação de data e hora para os padrões visuais da Weather App.
 */

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const DAYS_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/**
 * Faz o parse seguro de strings de data/hora (ISO) evitando deslocamento indevido de fuso horário.
 */
function parseDateParts(input) {
  if (input instanceof Date) {
    return {
      year: input.getFullYear(),
      month: input.getMonth(),
      day: input.getDate(),
      dayOfWeek: input.getDay(),
      hours: input.getHours(),
      minutes: input.getMinutes(),
    };
  }

  // Tratamento para strings como "2025-08-05T15:00" ou "2025-08-05" ou "2025-08-05T12:00:00Z"
  if (typeof input === 'string') {
    const cleanStr = input.trim();
    const match = cleanStr.match(/^(\d{4})-(\d{2})-(\d{2})(?:[T\s](\d{2}):(\d{2}))?/);
    if (match) {
      const year = parseInt(match[1], 10);
      const month = parseInt(match[2], 10) - 1;
      const day = parseInt(match[3], 10);
      const hours = match[4] !== undefined ? parseInt(match[4], 10) : 12;
      const minutes = match[5] !== undefined ? parseInt(match[5], 10) : 0;
      // Cria a data no meio-dia local para calcular o dia da semana com segurança
      const dateObj = new Date(year, month, day, hours, minutes);
      return {
        year,
        month,
        day,
        dayOfWeek: dateObj.getDay(),
        hours,
        minutes,
      };
    }
  }

  const d = new Date(input);
  return {
    year: d.getUTCFullYear(),
    month: d.getUTCMonth(),
    day: d.getUTCDate(),
    dayOfWeek: d.getUTCDay(),
    hours: d.getUTCHours(),
    minutes: d.getUTCMinutes(),
  };
}

/**
 * Formata para padrão: Tuesday, Aug 5, 2025
 */
export function formatDate(input) {
  const parts = parseDateParts(input);
  const dayName = DAYS[parts.dayOfWeek];
  const monthName = MONTHS_SHORT[parts.month];
  return `${dayName}, ${monthName} ${parts.day}, ${parts.year}`;
}

/**
 * Retorna o dia da semana por extenso ou abreviado (ex: "Tuesday" ou "Tue")
 */
export function formatDayOfWeek(input, short = false) {
  const parts = parseDateParts(input);
  return short ? DAYS_SHORT[parts.dayOfWeek] : DAYS[parts.dayOfWeek];
}

/**
 * Formata hora no padrão 12h (ex: "3 PM", "12 AM", "12 PM")
 */
export function formatHour(input) {
  const parts = parseDateParts(input);
  const h = parts.hours;
  const suffix = h >= 12 ? 'PM' : 'AM';
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12} ${suffix}`;
}

/**
 * Retorna a data no padrão YYYY-MM-DD
 */
export function formatIsoDate(input) {
  const parts = parseDateParts(input);
  const y = parts.year;
  const m = String(parts.month + 1).padStart(2, '0');
  const d = String(parts.day).padStart(2, '0');
  return `${y}-${m}-${d}`;
}
