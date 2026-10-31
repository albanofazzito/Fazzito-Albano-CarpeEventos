/**
 * estados.js
 * Ciclo de vida de un Evento. Replica enums/EstadoEvento.js del backend
 * para que la interfaz ofrezca solo las acciones posibles en cada estado;
 * igualmente la API vuelve a validar cada cambio y es la que tiene la última
 * palabra.
 */
export const ESTADOS = Object.freeze({
  PENDIENTE: "Pendiente",
  PRESUPUESTADO: "Presupuestado",
  CONFIRMADO: "Confirmado",
  EN_CURSO: "En curso",
  FINALIZADO: "Finalizado",
  CANCELADO: "Cancelado",
});

export const LISTA_ESTADOS = Object.freeze(Object.values(ESTADOS));

/** Recorrido normal de un evento, sin contar la cancelación. */
export const FLUJO_PRINCIPAL = Object.freeze([
  ESTADOS.PENDIENTE,
  ESTADOS.PRESUPUESTADO,
  ESTADOS.CONFIRMADO,
  ESTADOS.EN_CURSO,
  ESTADOS.FINALIZADO,
]);

const TRANSICIONES_VALIDAS = Object.freeze({
  [ESTADOS.PENDIENTE]: [ESTADOS.PRESUPUESTADO, ESTADOS.CANCELADO],
  [ESTADOS.PRESUPUESTADO]: [ESTADOS.CONFIRMADO, ESTADOS.CANCELADO],
  [ESTADOS.CONFIRMADO]: [ESTADOS.EN_CURSO, ESTADOS.CANCELADO],
  [ESTADOS.EN_CURSO]: [ESTADOS.FINALIZADO],
  [ESTADOS.FINALIZADO]: [],
  [ESTADOS.CANCELADO]: [],
});

const ESTADOS_ELIMINABLES = [ESTADOS.PENDIENTE, ESTADOS.PRESUPUESTADO, ESTADOS.CANCELADO];

// Según el análisis del sistema, los datos de una reserva se modifican
// mientras no empezó; una vez en curso, finalizada o cancelada queda cerrada.
const ESTADOS_EDITABLES = [ESTADOS.PENDIENTE, ESTADOS.PRESUPUESTADO, ESTADOS.CONFIRMADO];

export const DESCRIPCION_ESTADO = Object.freeze({
  [ESTADOS.PENDIENTE]: "La solicitud está registrada y espera que se le envíe un presupuesto.",
  [ESTADOS.PRESUPUESTADO]: "El presupuesto ya se envió; falta que el cliente lo apruebe.",
  [ESTADOS.CONFIRMADO]: "El cliente aprobó el presupuesto y la fecha quedó reservada.",
  [ESTADOS.EN_CURSO]: "El evento se está realizando en este momento.",
  [ESTADOS.FINALIZADO]: "El evento terminó y queda guardado en el historial.",
  [ESTADOS.CANCELADO]: "El evento se canceló y la fecha quedó libre para otras reservas.",
});

/** Texto del botón que lleva un evento a cada estado. */
export const ACCION_HACIA_ESTADO = Object.freeze({
  [ESTADOS.PRESUPUESTADO]: {
    label: "Marcar como presupuestado",
    ayuda: "Cuando ya le enviaste el presupuesto al cliente.",
  },
  [ESTADOS.CONFIRMADO]: {
    label: "Confirmar evento",
    ayuda: "Reserva la fecha. No puede superponerse con otro evento confirmado.",
  },
  [ESTADOS.EN_CURSO]: {
    label: "Iniciar evento",
    ayuda: "El día de la fiesta, cuando empieza el evento.",
  },
  [ESTADOS.FINALIZADO]: {
    label: "Finalizar evento",
    ayuda: "Cuando la celebración terminó.",
  },
  [ESTADOS.CANCELADO]: {
    label: "Cancelar evento",
    ayuda: "Libera la fecha. No se puede deshacer.",
  },
});

export function getTransicionesPosibles(estado) {
  return TRANSICIONES_VALIDAS[estado] ?? [];
}

export function puedeEliminarse(estado) {
  return ESTADOS_ELIMINABLES.includes(estado);
}

export function puedeEditarse(estado) {
  return ESTADOS_EDITABLES.includes(estado);
}

/** "En curso" -> "en-curso": se usa para elegir la clase CSS de cada estado. */
export function getEstadoSlug(estado) {
  return estado.toLowerCase().replace(/\s+/g, "-");
}
