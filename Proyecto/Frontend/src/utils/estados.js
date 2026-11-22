import { getTodayISO } from "./dates.js";
import { ESTADOS_PRESUPUESTO } from "./presupuestos.js";
import { ROLES } from "./roles.js";

/**
 * estados.js
 * Ciclo de vida de un Evento. Replica enums/EstadoEvento.js y los permisos
 * por rol de evento.service.js del backend, para que la interfaz ofrezca
 * solo las acciones posibles en cada estado; igualmente la API vuelve a
 * validar cada cambio y es la que tiene la última palabra.
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
  [ESTADOS.PRESUPUESTADO]: [ESTADOS.CONFIRMADO, ESTADOS.PENDIENTE, ESTADOS.CANCELADO],
  [ESTADOS.CONFIRMADO]: [ESTADOS.EN_CURSO, ESTADOS.CANCELADO],
  [ESTADOS.EN_CURSO]: [ESTADOS.FINALIZADO],
  [ESTADOS.FINALIZADO]: [],
  [ESTADOS.CANCELADO]: [],
});

/** Quién puede pedir cada estado a mano. Pendiente y Presupuestado los asigna el sistema. */
const ROLES_POR_ESTADO_DESTINO = Object.freeze({
  [ESTADOS.CONFIRMADO]: [ROLES.ADMINISTRADOR],
  [ESTADOS.EN_CURSO]: [ROLES.ADMINISTRADOR],
  [ESTADOS.FINALIZADO]: [ROLES.ADMINISTRADOR],
  [ESTADOS.CANCELADO]: [ROLES.ADMINISTRADOR, ROLES.CLIENTE],
});

const ESTADOS_ELIMINABLES = [ESTADOS.PENDIENTE, ESTADOS.PRESUPUESTADO, ESTADOS.CANCELADO];

// Según el análisis del sistema, los datos de una reserva se modifican
// mientras está Pendiente o Presupuestada. Un evento confirmado ya no se
// cambia: si hace falta, se cancela y se pide uno nuevo.
const ESTADOS_EDITABLES = [ESTADOS.PENDIENTE, ESTADOS.PRESUPUESTADO];

export const DESCRIPCION_ESTADO = Object.freeze({
  [ESTADOS.PENDIENTE]: "La solicitud está registrada y espera que se genere el presupuesto.",
  [ESTADOS.PRESUPUESTADO]: "El presupuesto ya está listo; falta que el cliente lo apruebe.",
  [ESTADOS.CONFIRMADO]: "El presupuesto se aprobó y la fecha quedó reservada para este evento.",
  [ESTADOS.EN_CURSO]: "El evento se está realizando en este momento.",
  [ESTADOS.FINALIZADO]: "El evento terminó y queda guardado en el historial.",
  [ESTADOS.CANCELADO]: "El evento se canceló y la fecha quedó libre para otras reservas.",
});

const ACCION_HACIA_ESTADO = Object.freeze({
  [ESTADOS.CONFIRMADO]: {
    label: "Confirmar evento",
    ayuda: "Reserva la fecha. Necesita el presupuesto aprobado y que la franja siga libre.",
  },
  [ESTADOS.EN_CURSO]: {
    label: "Iniciar evento",
    ayuda: "El día de la fiesta. Igual pasa solo a la hora de inicio.",
  },
  [ESTADOS.FINALIZADO]: {
    label: "Finalizar evento",
    ayuda: "Cuando la celebración terminó. Igual pasa solo al terminar el horario.",
  },
  [ESTADOS.CANCELADO]: {
    label: "Cancelar evento",
    ayuda: "Libera la fecha. No se puede deshacer.",
  },
});

/** Por qué una acción permitida todavía no se puede usar (o null si se puede). */
function getMotivoBloqueo(evento, destino) {
  if (destino === ESTADOS.CONFIRMADO && evento.presupuesto?.estado !== ESTADOS_PRESUPUESTO.APROBADO) {
    return "Se habilita cuando el cliente aprueba el presupuesto.";
  }
  if (destino === ESTADOS.EN_CURSO && evento.fecha !== getTodayISO()) {
    return "Se habilita el día del evento.";
  }
  return null;
}

/**
 * Cambios de estado que el usuario puede pedir sobre el evento, con su
 * texto y, si corresponde, el motivo por el que todavía están bloqueados.
 */
export function getAccionesDeEstado(evento, rol) {
  return (TRANSICIONES_VALIDAS[evento.estado] ?? [])
    .filter((destino) => ROLES_POR_ESTADO_DESTINO[destino]?.includes(rol))
    .map((destino) => ({
      destino,
      ...ACCION_HACIA_ESTADO[destino],
      ...(destino === ESTADOS.CANCELADO && rol === ROLES.CLIENTE && { label: "Cancelar mi reserva" }),
      motivoBloqueo: getMotivoBloqueo(evento, destino),
    }));
}

export function esEstadoFinal(estado) {
  return (TRANSICIONES_VALIDAS[estado] ?? []).length === 0;
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
