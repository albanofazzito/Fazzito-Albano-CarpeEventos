import { BadRequestError } from "../exceptions/AppError.js";
import { Messages } from "../enums/Messages.js";

/**
 * parseId.js
 * Convierte el :id de un parámetro de ruta (siempre string) a número
 * entero, o lanza BadRequestError si no es un entero válido. Se usa en
 * todos los controllers que reciben un :id para no duplicar esta
 * validación en cada uno.
 */
export function parseId(rawId) {
  const id = Number(rawId);
  if (!Number.isInteger(id) || id <= 0) {
    throw new BadRequestError(Messages.INVALID_ID);
  }
  return id;
}

export default parseId;
