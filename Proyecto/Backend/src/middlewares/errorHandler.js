import AppError from "../exceptions/AppError.js";
import { Messages } from "../enums/Messages.js";
import { ApiResponse } from "../responses/ApiResponse.js";

/**
 * errorHandler.js
 * Middleware de manejo CENTRALIZADO de errores. Se registra al final de la
 * cadena de middlewares de Express (ver app.js). Ningún controller/service
 * debería armar una respuesta de error por su cuenta: simplemente lanzan
 * (throw) un AppError (o subclase) y este middleware lo transforma en la
 * respuesta HTTP con el formato estándar { success: false, message }.
 *
 * Firma de 4 parámetros: Express lo reconoce como middleware de errores
 * solo si tiene (err, req, res, next).
 */
// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, next) {
  if (err instanceof AppError) {
    return ApiResponse.error(res, err.message, err.statusCode);
  }

  // Error inesperado (no operacional): se loguea completo en el servidor
  // pero nunca se expone el detalle interno al cliente de la API.
  console.error("[ERROR NO CONTROLADO]", err);
  return ApiResponse.error(res, Messages.INTERNAL_SERVER_ERROR, 500);
}

export default errorHandler;
