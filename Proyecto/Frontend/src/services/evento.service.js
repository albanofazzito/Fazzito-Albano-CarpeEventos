import { apiClient } from "./apiClient.js";

/**
 * evento.service.js
 * Peticiones del CRUD de Evento (/api/eventos), la entidad principal de la API.
 * Las reglas de negocio (fechas, transiciones de estado, superposición de
 * horarios) las valida el backend; si alguna falla, apiClient lanza un
 * ApiError con el mensaje correspondiente.
 */
const RESOURCE = "/eventos";

export function getEventos() {
  return apiClient.get(RESOURCE);
}

export function getEventoById(id) {
  return apiClient.get(`${RESOURCE}/${id}`);
}

export function createEvento(evento) {
  return apiClient.post(RESOURCE, evento);
}

export function updateEvento(id, cambios) {
  return apiClient.put(`${RESOURCE}/${id}`, cambios);
}

export function cambiarEstadoEvento(id, estado) {
  return apiClient.put(`${RESOURCE}/${id}`, { estado });
}

export function deleteEvento(id) {
  return apiClient.delete(`${RESOURCE}/${id}`);
}
