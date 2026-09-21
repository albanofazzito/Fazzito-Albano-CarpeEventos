/**
 * AppError.js
 * Clase base para todos los errores "esperados" de la aplicación (errores de
 * negocio/validación), distintos de un error de programación inesperado.
 *
 * El middleware de manejo centralizado de errores (middlewares/errorHandler.js)
 * reconoce instancias de AppError y responde con el statusCode y el message
 * que cada una define, en el formato de respuesta estándar de la API.
 */
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.isOperational = true; // distingue errores de negocio de bugs inesperados
    Error.captureStackTrace(this, this.constructor);
  }
}

/** 400 — la solicitud tiene datos inválidos, faltantes o mal formados. */
export class BadRequestError extends AppError {
  constructor(message) {
    super(message, 400);
  }
}

/** 404 — el recurso solicitado no existe. */
export class NotFoundError extends AppError {
  constructor(message) {
    super(message, 404);
  }
}

/** 409 — la solicitud entra en conflicto con el estado actual del recurso. */
export class ConflictError extends AppError {
  constructor(message) {
    super(message, 409);
  }
}

/** 422 — los datos son sintácticamente correctos pero viola una regla de negocio. */
export class UnprocessableEntityError extends AppError {
  constructor(message) {
    super(message, 422);
  }
}

/** 500 — error interno controlado (por ejemplo, una dependencia falló). */
export class InternalServerError extends AppError {
  constructor(message) {
    super(message, 500);
  }
}

export default AppError;
