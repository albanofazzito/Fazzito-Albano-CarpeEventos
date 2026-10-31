import { parseISODate } from "./dates.js";

const LOCALE = "es-AR";

const fechaLargaFormatter = new Intl.DateTimeFormat(LOCALE, {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
});
const mesCortoFormatter = new Intl.DateTimeFormat(LOCALE, { month: "short" });
const diaSemanaCortoFormatter = new Intl.DateTimeFormat(LOCALE, { weekday: "short" });
const precioFormatter = new Intl.NumberFormat(LOCALE, {
  style: "currency",
  currency: "ARS",
  maximumFractionDigits: 0,
});

const capitalize = (texto) => texto.charAt(0).toUpperCase() + texto.slice(1);
const sinPunto = (texto) => texto.replace(/\.$/, "");

/** "2026-11-14" -> "Sábado, 14 de noviembre de 2026" */
export function formatFechaLarga(fechaISO) {
  const fecha = parseISODate(fechaISO);
  return fecha ? capitalize(fechaLargaFormatter.format(fecha)) : fechaISO;
}

/** "2026-11-14" -> { dia: "14", mes: "nov", diaSemana: "sáb" } (para el bloque de fecha). */
export function getPartesFecha(fechaISO) {
  const fecha = parseISODate(fechaISO);
  if (!fecha) return { dia: "--", mes: "", diaSemana: "" };

  return {
    dia: String(fecha.getDate()),
    mes: sinPunto(mesCortoFormatter.format(fecha)),
    diaSemana: sinPunto(diaSemanaCortoFormatter.format(fecha)),
  };
}

export function formatHorario(horaInicio, horaFin) {
  return `${horaInicio} a ${horaFin} h`;
}

export function formatPrecio(valor) {
  return precioFormatter.format(valor);
}

export function formatInvitados(cantidad) {
  return `${cantidad} ${cantidad === 1 ? "invitado" : "invitados"}`;
}

export function formatNombreCompleto(cliente) {
  return cliente ? `${cliente.nombre} ${cliente.apellido}` : "Cliente sin datos";
}
