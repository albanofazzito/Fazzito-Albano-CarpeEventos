import { apiClient } from "./apiClient.js";

/**
 * servicio.service.js
 * Catálogo de servicios del salón (solo lectura). Alimenta la sección
 * "Servicios estrella" de la landing y el selector de tipo de evento.
 */
const RESOURCE = "/servicios";

export function getServicios() {
  return apiClient.get(RESOURCE);
}

export function getServicioById(id) {
  return apiClient.get(`${RESOURCE}/${id}`);
}
