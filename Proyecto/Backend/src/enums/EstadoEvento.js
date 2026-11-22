/**
 * EstadoEvento.js
 * Enum con los estados válidos del ciclo de vida de un Evento
 * (definidos en el documento de análisis del sistema, sección 5).
 *
 * Flujo esperado:
 *   PENDIENTE -> PRESUPUESTADO -> CONFIRMADO -> EN_CURSO -> FINALIZADO
 * con posibilidad de pasar a CANCELADO desde PENDIENTE, PRESUPUESTADO o CONFIRMADO.
 * Si el cliente rechaza el presupuesto, el evento vuelve de PRESUPUESTADO a
 * PENDIENTE para que se pueda ajustar y volver a cotizar.
 */
export const EstadoEvento = Object.freeze({
  PENDIENTE: "Pendiente",
  PRESUPUESTADO: "Presupuestado",
  CONFIRMADO: "Confirmado",
  EN_CURSO: "En curso",
  FINALIZADO: "Finalizado",
  CANCELADO: "Cancelado",
});

/**
 * Mapa de transiciones válidas: desde qué estado se puede pasar a cuáles otros.
 * Se usa en la capa de servicio para validar cambios de estado (regla de negocio
 * "no se cancela un evento una vez iniciado", entre otras).
 */
export const TRANSICIONES_VALIDAS = Object.freeze({
  [EstadoEvento.PENDIENTE]: [EstadoEvento.PRESUPUESTADO, EstadoEvento.CANCELADO],
  [EstadoEvento.PRESUPUESTADO]: [EstadoEvento.CONFIRMADO, EstadoEvento.PENDIENTE, EstadoEvento.CANCELADO],
  [EstadoEvento.CONFIRMADO]: [EstadoEvento.EN_CURSO, EstadoEvento.CANCELADO],
  [EstadoEvento.EN_CURSO]: [EstadoEvento.FINALIZADO],
  [EstadoEvento.FINALIZADO]: [],
  [EstadoEvento.CANCELADO]: [],
});

/** Estados desde los que SÍ se puede eliminar (hard delete) un evento. */
export const ESTADOS_ELIMINABLES = Object.freeze([
  EstadoEvento.PENDIENTE,
  EstadoEvento.PRESUPUESTADO,
  EstadoEvento.CANCELADO,
]);

/** Estados en los que se pueden modificar los datos de la reserva (análisis, sección 6). */
export const ESTADOS_EDITABLES = Object.freeze([EstadoEvento.PENDIENTE, EstadoEvento.PRESUPUESTADO]);

/** Estados que ocupan la fecha y el horario del salón. */
export const ESTADOS_CON_FECHA_BLOQUEADA = Object.freeze([EstadoEvento.CONFIRMADO, EstadoEvento.EN_CURSO]);

/** Reservas que siguen abiertas (todavía no terminaron ni se cancelaron). */
export const ESTADOS_ACTIVOS = Object.freeze([
  EstadoEvento.PENDIENTE,
  EstadoEvento.PRESUPUESTADO,
  EstadoEvento.CONFIRMADO,
  EstadoEvento.EN_CURSO,
]);

export function esTransicionValida(estadoActual, estadoNuevo) {
  return (TRANSICIONES_VALIDAS[estadoActual] ?? []).includes(estadoNuevo);
}

export default EstadoEvento;
