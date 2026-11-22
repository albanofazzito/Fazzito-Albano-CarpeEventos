import { apiClient, toQueryString } from "./apiClient.js";

/**
 * presupuesto.service.js
 * Presupuestos (/api/presupuestos). El monto siempre lo calcula la API:
 * el frontend nunca envía un importe.
 */
const RESOURCE = "/presupuestos";

/** Cotización orientativa, sin guardar nada (pública). */
export function estimarPresupuesto({ servicioId, cantidadInvitados }) {
  return apiClient.get(`${RESOURCE}/estimacion${toQueryString({ servicioId, cantidadInvitados })}`);
}

/** Solo administrador: genera el presupuesto y el evento pasa a Presupuestado. */
export function generarPresupuesto(eventoId) {
  return apiClient.post(RESOURCE, { eventoId });
}

export function aprobarPresupuesto(id) {
  return apiClient.patch(`${RESOURCE}/${id}/aprobar`);
}

/** Si se rechaza, el evento vuelve a Pendiente para ajustarlo. */
export function rechazarPresupuesto(id) {
  return apiClient.patch(`${RESOURCE}/${id}/rechazar`);
}
