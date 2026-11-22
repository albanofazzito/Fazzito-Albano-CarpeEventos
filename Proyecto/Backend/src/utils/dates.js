/**
 * dates.js
 * Helpers de fecha y hora en formato texto ("AAAA-MM-DD" y "HH:mm"), que
 * es como se guardan en los modelos. Se calculan con la hora local del
 * servidor (toISOString usaría UTC y en Argentina correría el día a la noche).
 */
const pad = (numero) => String(numero).padStart(2, "0");

/** Fecha de hoy como "AAAA-MM-DD". */
export function getTodayISO(ahora = new Date()) {
  return `${ahora.getFullYear()}-${pad(ahora.getMonth() + 1)}-${pad(ahora.getDate())}`;
}

/** Hora actual como "HH:mm". */
export function getCurrentTime(ahora = new Date()) {
  return `${pad(ahora.getHours())}:${pad(ahora.getMinutes())}`;
}

/** Suma (o resta, con negativos) días a hoy y devuelve "AAAA-MM-DD". Se usa para los datos de prueba. */
export function daysFromToday(dias, ahora = new Date()) {
  const fecha = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate() + dias);
  return getTodayISO(fecha);
}

/** true si el momento (fecha + hora) ya llegó o pasó. */
export function hasMomentPassed(fecha, hora, ahora = new Date()) {
  const hoy = getTodayISO(ahora);
  return fecha < hoy || (fecha === hoy && hora <= getCurrentTime(ahora));
}
