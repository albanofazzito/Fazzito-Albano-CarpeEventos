/**
 * validators.js
 * Funciones puras de validación de formato. No conocen reglas de negocio
 * ni lanzan excepciones: solo devuelven true/false. Quien las usa (la
 * capa de servicios) decide qué AppError lanzar en cada caso.
 */

export function isNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

/** Texto no vacío cuya longitud (sin espacios en los extremos) está entre min y max. */
export function isStringOfLength(value, min, max) {
  if (typeof value !== "string") return false;
  const length = value.trim().length;
  return length >= min && length <= max;
}

export function isValidEmail(value) {
  if (!isNonEmptyString(value)) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

/** Deja solo los dígitos de un teléfono: "+54 9 11 5555-0101" -> "5491155550101". */
export function onlyDigits(value) {
  return String(value).replace(/\D/g, "");
}

/**
 * Teléfono/WhatsApp argentino: números, espacios, guiones y un "+" inicial,
 * con 10 dígitos (característica + número) o hasta 13 si incluye +54 9.
 */
export function isValidPhone(value) {
  if (!isNonEmptyString(value) || !/^\+?[\d\s-]+$/.test(value.trim())) return false;
  const digits = onlyDigits(value).length;
  return digits >= 10 && digits <= 13;
}

export function isValidPassword(value, minLength) {
  return typeof value === "string" && value.length >= minLength;
}

/**
 * Fecha con formato AAAA-MM-DD que además representa una fecha real.
 * Date "corre" las fechas imposibles (31/02 pasa a ser 03/03), así que si
 * los componentes cambiaron, la fecha no existía.
 */
export function isValidDateString(value) {
  if (!isNonEmptyString(value) || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [anio, mes, dia] = value.split("-").map(Number);
  const date = new Date(anio, mes - 1, dia);
  return date.getFullYear() === anio && date.getMonth() === mes - 1 && date.getDate() === dia;
}

/** La fecha (AAAA-MM-DD) es hoy o posterior a hoy. */
export function isFutureOrTodayDate(value) {
  if (!isValidDateString(value)) return false;
  const [anio, mes, dia] = value.split("-").map(Number);
  const date = new Date(anio, mes - 1, dia);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return date.getTime() >= today.getTime();
}

/** Mes con formato AAAA-MM. */
export function isValidMonthString(value) {
  return isNonEmptyString(value) && /^\d{4}-(0[1-9]|1[0-2])$/.test(value);
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
