import { Messages } from "../enums/Messages.js";
import { ApiResponse } from "../responses/ApiResponse.js";

/**
 * notFoundRoute.js
 * Se registra después de todas las rutas conocidas: cualquier request que
 * llegue hasta aquí es una ruta/verbo que no existe en la API.
 */
export function notFoundRoute(req, res) {
  return ApiResponse.error(res, Messages.ROUTE_NOT_FOUND, 404);
}

export default notFoundRoute;
