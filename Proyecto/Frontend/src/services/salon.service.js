import { apiClient, toQueryString } from "./apiClient.js";

/**
 * salon.service.js
 * Datos públicos del salón (/api/salon): aforo, reglas de cotización y
 * franjas ocupadas de cada mes.
 */
const RESOURCE = "/salon";

export function getInfoSalon() {
  return apiClient.get(RESOURCE);
}

/** mes: "AAAA-MM". Devuelve { mes, dias: [{ fecha, franjas: [{ horaInicio, horaFin }] }] }. */
export function getDisponibilidad(mes) {
  return apiClient.get(`${RESOURCE}/disponibilidad${toQueryString({ mes })}`);
}
