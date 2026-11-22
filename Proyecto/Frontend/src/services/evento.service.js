import { apiClient, toQueryString } from "./apiClient.js";

/**
 * evento.service.js
 * Peticiones de Evento (/api/eventos), la entidad principal de la API.
 * La API ya devuelve cada evento con su cliente, servicio y presupuesto,
 * y filtra según el rol: un cliente recibe solo sus eventos.
 * Las reglas de negocio (fechas, aforo, transiciones de estado,
 * superposición de horarios) las valida el backend; si alguna falla,
 * apiClient lanza un ApiError con el mensaje correspondiente.
 */
const RESOURCE = "/eventos";

/** filtros: { estado, clienteId } (clienteId solo lo usa el administrador). */
export function getEventos(filtros) {
  return apiClient.get(`${RESOURCE}${toQueryString(filtros)}`);
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
  return apiClient.patch(`${RESOURCE}/${id}/estado`, { estado });
}

export function deleteEvento(id) {
  return apiClient.delete(`${RESOURCE}/${id}`);
}
