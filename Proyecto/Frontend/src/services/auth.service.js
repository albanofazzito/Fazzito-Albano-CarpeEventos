import { apiClient } from "./apiClient.js";

/**
 * auth.service.js
 * Registro, inicio de sesión y datos del usuario logueado (/api/auth).
 * Login y registro devuelven { token, usuario }; guardar el token lo
 * resuelve el AuthProvider.
 */
const RESOURCE = "/auth";

export function login(credenciales) {
  return apiClient.post(`${RESOURCE}/login`, credenciales);
}

export function registrar(datos) {
  return apiClient.post(`${RESOURCE}/registro`, datos);
}

export function getPerfil() {
  return apiClient.get(`${RESOURCE}/perfil`);
}
