import { getToken } from "./session.js";

/**
 * apiClient.js
 * Único lugar del frontend que usa fetch. Los servicios de cada recurso
 * (evento.service.js, cliente.service.js, auth.service.js, ...) se apoyan en
 * estas funciones, así ninguna pantalla repite la lógica de las peticiones.
 *
 * La API responde siempre con el mismo formato (ver Backend/README.md):
 *   éxito -> { success: true, data }
 *   error -> { success: false, message }
 * Por eso acá se devuelve directamente `data`, y ante cualquier problema se
 * lanza un ApiError con el mensaje que mandó el backend.
 *
 * Si hay una sesión abierta, cada petición lleva el token en el header
 * Authorization. Si la API lo rechaza (401), se avisa a quien se haya
 * suscripto con onSessionExpired (el AuthProvider), que cierra la sesión.
 */
const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000/api";

const NETWORK_ERROR_MESSAGE =
  "No pudimos conectarnos con el servidor. Revisá tu conexión e intentá de nuevo en unos minutos.";

let sessionExpiredHandler = null;

export function onSessionExpired(handler) {
  sessionExpiredHandler = handler;
}

export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

async function request(path, { method = "GET", body } = {}) {
  const token = getToken();
  const headers = {};
  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (token) headers.Authorization = `Bearer ${token}`;

  let response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    // fetch solo rechaza la promesa cuando no hubo respuesta (servidor caído, sin red, CORS).
    throw new ApiError(NETWORK_ERROR_MESSAGE, 0);
  }

  const payload = await response.json().catch(() => null);

  if (!response.ok || !payload?.success) {
    const message = payload?.message ?? `El servidor respondió con un error inesperado (${response.status}).`;
    // Un 401 con token significa que la sesión venció o ya no es válida.
    // (Sin token, un 401 es por ejemplo una contraseña incorrecta en el login.)
    if (response.status === 401 && token) sessionExpiredHandler?.(message);
    throw new ApiError(message, response.status);
  }

  return payload.data;
}

/** Arma "?clave=valor&..." ignorando los valores vacíos. */
export function toQueryString(params = {}) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([clave, valor]) => {
    if (valor !== undefined && valor !== null && valor !== "") query.set(clave, valor);
  });
  const texto = query.toString();
  return texto ? `?${texto}` : "";
}

export const apiClient = {
  get: (path) => request(path),
  post: (path, body) => request(path, { method: "POST", body }),
  put: (path, body) => request(path, { method: "PUT", body }),
  patch: (path, body) => request(path, { method: "PATCH", body }),
  delete: (path) => request(path, { method: "DELETE" }),
};

export default apiClient;
