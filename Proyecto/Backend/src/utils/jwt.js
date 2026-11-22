import jwt from "jsonwebtoken";
import { AUTH } from "../config/auth.config.js";

/**
 * jwt.js
 * Firma y verificación de los tokens de sesión. El token solo guarda el id
 * del usuario y su rol; el resto de los datos se busca en cada petición
 * (así, si un usuario se elimina, su token deja de servir).
 */
export function signToken(usuario) {
  return jwt.sign({ sub: String(usuario.id), rol: usuario.rol }, AUTH.jwtSecret, {
    expiresIn: AUTH.jwtExpiresIn,
  });
}

/** Devuelve el payload si el token es válido. Si no, lanza el error de jsonwebtoken. */
export function verifyToken(token) {
  return jwt.verify(token, AUTH.jwtSecret);
}

export function isTokenExpiredError(error) {
  return error instanceof jwt.TokenExpiredError;
}
