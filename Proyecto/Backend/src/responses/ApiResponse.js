/**
 * ApiResponse.js
 * Centraliza el formato de TODAS las respuestas HTTP de la API, para que
 * controllers y middlewares nunca armen el objeto de respuesta "a mano".
 *
 * Éxito:  { "success": true,  "data": { ... } }
 * Error:  { "success": false, "message": "..." }
 */
export class ApiResponse {
  static success(res, data, statusCode = 200) {
    return res.status(statusCode).json({
      success: true,
      data,
    });
  }

  static error(res, message, statusCode = 500) {
    return res.status(statusCode).json({
      success: false,
      message,
    });
  }
}

export default ApiResponse;
