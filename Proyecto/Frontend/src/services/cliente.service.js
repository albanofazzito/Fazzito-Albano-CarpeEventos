import { apiClient } from "./apiClient.js";

/**
 * cliente.service.js
 * CRUD de Cliente (/api/clientes). El listado, el alta y la baja son del
 * administrador; un cliente solo consulta y modifica sus propios datos.
 */
const RESOURCE = "/clientes";

export function getClientes() {
  return apiClient.get(RESOURCE);
}

export function getClienteById(id) {
  return apiClient.get(`${RESOURCE}/${id}`);
}

export function createCliente(cliente) {
  return apiClient.post(RESOURCE, cliente);
}

export function updateCliente(id, cambios) {
  return apiClient.put(`${RESOURCE}/${id}`, cambios);
}

export function deleteCliente(id) {
  return apiClient.delete(`${RESOURCE}/${id}`);
}
