import { apiClient, toQueryString } from "./apiClient.js";

/**
 * servicio.service.js
 * Catálogo de servicios del salón (/api/servicios). La lectura es pública
 * (alimenta la landing y el formulario de reserva); crear, modificar y dar
 * de baja es solo del administrador.
 */
const RESOURCE = "/servicios";

/** Con { incluirInactivos: true } el administrador recibe también los dados de baja. */
export function getServicios({ incluirInactivos = false } = {}) {
  return apiClient.get(`${RESOURCE}${toQueryString({ incluirInactivos: incluirInactivos || undefined })}`);
}

export function getServicioById(id) {
  return apiClient.get(`${RESOURCE}/${id}`);
}

export function createServicio(servicio) {
  return apiClient.post(RESOURCE, servicio);
}

export function updateServicio(id, cambios) {
  return apiClient.put(`${RESOURCE}/${id}`, cambios);
}

/** Baja lógica: el servicio deja de ofrecerse pero queda en el historial. */
export function deleteServicio(id) {
  return apiClient.delete(`${RESOURCE}/${id}`);
}
