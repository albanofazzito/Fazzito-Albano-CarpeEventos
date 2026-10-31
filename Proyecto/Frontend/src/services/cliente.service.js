import { apiClient } from "./apiClient.js";

/**
 * cliente.service.js
 * La API expone Cliente solo para lectura: se usa para elegir quién hace
 * la reserva y para mostrar sus datos de contacto en el detalle del evento.
 */
const RESOURCE = "/clientes";

export function getClientes() {
  return apiClient.get(RESOURCE);
}

export function getClienteById(id) {
  return apiClient.get(`${RESOURCE}/${id}`);
}
