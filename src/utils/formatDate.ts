/**
 * Formatea un timestamp ISO o cualquier string de fecha/hora en formato legible para Colombia.
 * Ej: "2026-07-29T21:42:08.212Z" → "29 jul. 2026, 04:42 p. m."
 * Si el valor es nulo o vacío retorna '-'.
 */
export const formatDateTime = (value: string | null | undefined): string => {
  if (!value) return '-'

  const date = new Date(value)
  if (isNaN(date.getTime())) return value

  return new Intl.DateTimeFormat('es-CO', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date)
}

/**
 * Formatea solo la parte de fecha de un timestamp.
 * Ej: "2026-07-29T21:42:08.212Z" → "29 jul. 2026"
 */
export const formatDate = (value: string | null | undefined): string => {
  if (!value) return '-'

  const date = new Date(value)
  if (isNaN(date.getTime())) return value

  return new Intl.DateTimeFormat('es-CO', {
    dateStyle: 'medium',
  }).format(date)
}

/**
 * Formatea solo la parte de hora de un timestamp ISO.
 * Ej: "2026-07-29T21:42:08.212Z" → "04:42 p. m."
 * Si la cadena ya tiene formato HH:MI AM (del backend) la devuelve tal cual.
 */
export const formatTime = (value: string | null | undefined): string => {
  if (!value) return '-'

  // Si ya viene formateada del backend (ej: "06:00 AM") la retorna directamente
  if (/^\d{1,2}:\d{2}\s?(AM|PM)$/i.test(value.trim())) return value.trim()

  const date = new Date(value)
  if (isNaN(date.getTime())) return value

  return new Intl.DateTimeFormat('es-CO', {
    timeStyle: 'short',
  }).format(date)
}
