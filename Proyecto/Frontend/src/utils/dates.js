/** Fecha de hoy como "AAAA-MM-DD" según la hora local (toISOString usaría UTC). */
export function getTodayISO() {
  const hoy = new Date();
  const mes = String(hoy.getMonth() + 1).padStart(2, "0");
  const dia = String(hoy.getDate()).padStart(2, "0");
  return `${hoy.getFullYear()}-${mes}-${dia}`;
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
