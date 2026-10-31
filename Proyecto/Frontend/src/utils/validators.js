import { getTodayISO, parseISODate } from "./dates.js";

const HORA_REGEX = /^([01]\d|2[0-3]):[0-5]\d$/;
const ENTERO_POSITIVO_REGEX = /^\d+$/;

/**
 * Valida el formulario de Evento con las mismas reglas que aplica el backend
 * (services/evento.service.js), para marcar los errores antes de enviar.
 * Devuelve { campo: mensaje } solo con los campos que tienen problemas.
 */
export function validateEventoForm(values, hoy = getTodayISO()) {
  const errors = {};

  if (!values.clienteId) {
    errors.clienteId = "Elegí quién hace la reserva.";
  }

  if (!values.servicioId) {
    errors.servicioId = "Elegí el tipo de evento.";
  }

  if (!values.fecha) {
    errors.fecha = "Ingresá la fecha del evento.";
  } else if (!parseISODate(values.fecha)) {
    errors.fecha = "La fecha no es válida.";
  } else if (values.fecha < hoy) {
    errors.fecha = "La fecha no puede ser anterior a hoy.";
  }

  const horaInicioValida = HORA_REGEX.test(values.horaInicio);
  if (!values.horaInicio) {
    errors.horaInicio = "Ingresá la hora de inicio.";
  } else if (!horaInicioValida) {
    errors.horaInicio = "Usá el formato HH:MM, por ejemplo 18:00.";
  }

  if (!values.horaFin) {
    errors.horaFin = "Ingresá la hora de finalización.";
  } else if (!HORA_REGEX.test(values.horaFin)) {
    errors.horaFin = "Usá el formato HH:MM, por ejemplo 23:00.";
  } else if (horaInicioValida && values.horaFin <= values.horaInicio) {
    errors.horaFin = "Tiene que ser posterior a la hora de inicio.";
  }

  const invitados = String(values.cantidadInvitados).trim();
  if (!invitados) {
    errors.cantidadInvitados = "Ingresá la cantidad de invitados.";
  } else if (!ENTERO_POSITIVO_REGEX.test(invitados) || Number(invitados) <= 0) {
    errors.cantidadInvitados = "Tiene que ser un número entero mayor a cero.";
  }

  return errors;
}
