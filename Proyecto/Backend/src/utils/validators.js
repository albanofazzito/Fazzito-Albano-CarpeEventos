/**
 * validators.js
 * Funciones puras de validación de formato. No conocen reglas de negocio
 * ni lanzan excepciones: solo devuelven true/false. Quien las usa (la
 * capa de servicios) decide qué AppError lanzar en cada caso.
 */

export function isNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

export function isValidEmail(value) {
  if (!isNonEmptyString(value)) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

export function isValidPhone(value) {
  if (!isNonEmptyString(value)) return false;
  // Solo números, espacios, guiones o "+", entre 8 y 20 caracteres.
  return /^[+\d][\d\s-]{7,19}$/.test(value.trim());
}

/** Fecha con formato AAAA-MM-DD que además representa una fecha real. */
export function isValidDateString(value) {
  if (!isNonEmptyString(value) || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00`);
  return !Number.isNaN(date.getTime());
}

/** La fecha (AAAA-MM-DD) es hoy o posterior a hoy. */
export function isFutureOrTodayDate(value) {
  if (!isValidDateString(value)) return false;
  const date = new Date(`${value}T00:00:00`);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return date.getTime() >= today.getTime();
}

/** Horario con formato HH:mm (24 hs). */
export function isValidTimeString(value) {
  return isNonEmptyString(value) && /^([01]\d|2[0-3]):([0-5]\d)$/.test(value);
}

/** Compara dos horarios "HH:mm": true si fin es estrictamente posterior a inicio. */
export function isEndTimeAfterStartTime(horaInicio, horaFin) {
  if (!isValidTimeString(horaInicio) || !isValidTimeString(horaFin)) return false;
  return horaFin > horaInicio; // comparación de strings funciona por el padding fijo "HH:mm"
}

export function isPositiveInteger(value) {
  return typeof value === "number" && Number.isInteger(value) && value > 0;
}

export function isPositiveNumber(value) {
  return typeof value === "number" && Number.isFinite(value) && value > 0;
}

/** Dos rangos horarios [inicioA, finA) y [inicioB, finB) se superponen. */
export function rangesOverlap(inicioA, finA, inicioB, finB) {
  return inicioA < finB && inicioB < finA;
}
