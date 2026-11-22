const pad = (numero) => String(numero).padStart(2, "0");

/** Date -> "AAAA-MM-DD" según la hora local (toISOString usaría UTC). */
export function toISODate(fecha) {
  return `${fecha.getFullYear()}-${pad(fecha.getMonth() + 1)}-${pad(fecha.getDate())}`;
}

/** Fecha de hoy como "AAAA-MM-DD". */
export function getTodayISO() {
  return toISODate(new Date());
}

/** Hora actual como "HH:mm". */
export function getCurrentTime() {
  const ahora = new Date();
  return `${pad(ahora.getHours())}:${pad(ahora.getMinutes())}`;
}

/** Convierte "AAAA-MM-DD" en un Date a medianoche local, o null si la fecha no existe. */
export function parseISODate(value) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;

  const [anio, mes, dia] = value.split("-").map(Number);
  const date = new Date(anio, mes - 1, dia);

  // Date "corre" las fechas imposibles (31/02 pasa a ser 03/03): si cambió, no existía.
  if (date.getFullYear() !== anio || date.getMonth() !== mes - 1 || date.getDate() !== dia) {
    return null;
  }
  return date;
}

/** "2026-12-05" -> "2026-12" */
export function getMonthOf(fechaISO) {
  return fechaISO.slice(0, 7);
}

/** Suma meses a un "AAAA-MM": addMonths("2026-12", 1) -> "2027-01". */
export function addMonths(mes, cantidad) {
  const [anio, numeroMes] = mes.split("-").map(Number);
  const fecha = new Date(anio, numeroMes - 1 + cantidad, 1);
  return `${fecha.getFullYear()}-${pad(fecha.getMonth() + 1)}`;
}

/**
 * Semanas de un mes para dibujar un calendario que arranca el lunes.
 * Cada semana es un array de 7 posiciones con "AAAA-MM-DD" o null (días de
 * relleno antes del 1 y después del último día).
 */
export function getCalendarWeeks(mes) {
  const [anio, numeroMes] = mes.split("-").map(Number);
  const diasDelMes = new Date(anio, numeroMes, 0).getDate();
  // getDay(): 0 = domingo. Se corre para que el lunes sea la primera columna.
  const offset = (new Date(anio, numeroMes - 1, 1).getDay() + 6) % 7;

  const celdas = [
    ...Array(offset).fill(null),
    ...Array.from({ length: diasDelMes }, (_, i) => `${mes}-${pad(i + 1)}`),
  ];
  while (celdas.length % 7 !== 0) celdas.push(null);

  const semanas = [];
  for (let i = 0; i < celdas.length; i += 7) semanas.push(celdas.slice(i, i + 7));
  return semanas;
}

/** Dos franjas "HH:mm" se superponen (misma regla que usa el backend). */
export function rangesOverlap(inicioA, finA, inicioB, finB) {
  return inicioA < finB && inicioB < finA;
}
