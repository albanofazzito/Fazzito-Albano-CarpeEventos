/**
 * apiClient.js
 * Único lugar del frontend que usa fetch. Los servicios de cada recurso
 * (evento.service.js, cliente.service.js, servicio.service.js) se apoyan en
 * estas funciones, así ninguna pantalla repite la lógica de las peticiones.
 *
 * La API responde siempre con el mismo formato (ver Backend/README.md):
 *   éxito -> { success: true, data }
 *   error -> { success: false, message }
 * Por eso acá se devuelve directamente `data`, y ante cualquier problema se
 * lanza un ApiError con el mensaje que mandó el backend.
 */
const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000/api";

const NETWORK_ERROR_MESSAGE =
  "No pudimos conectarnos con el servidor. Revisá tu conexión e intentá de nuevo en unos minutos.";

export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

async function request(path, { method = "GET", body } = {}) {
  let response;

  try {
    response = await fetch(`${API_URL}${path}`, {
      method,
      headers: body === undefined ? undefined : { "Content-Type": "application/json" },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    // fetch solo rechaza la promesa cuando no hubo respuesta (servidor caído, sin red, CORS).
    throw new ApiError(NETWORK_ERROR_MESSAGE, 0);
  }

  const payload = await response.json().catch(() => null);

  if (!response.ok || !payload?.success) {
    const message = payload?.message ?? `El servidor respondió con un error inesperado (${response.status}).`;
    throw new ApiError(message, response.status);
  }

  return payload.data;
}

export const apiClient = {
  get: (path) => request(path),
  post: (path, body) => request(path, { method: "POST", body }),
  put: (path, body) => request(path, { method: "PUT", body }),
  delete: (path) => request(path, { method: "DELETE" }),
};

export default apiClient;
