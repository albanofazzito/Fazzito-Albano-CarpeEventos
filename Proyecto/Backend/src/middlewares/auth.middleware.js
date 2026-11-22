import { AuthService } from "../services/auth.service.js";
import { Messages } from "../enums/Messages.js";
import { ForbiddenError, UnauthorizedError } from "../exceptions/AppError.js";

/**
 * auth.middleware.js
 * Middlewares de autenticación y autorización. Se aplican en las rutas:
 *
 *   router.get("/", authenticate, authorize(Rol.ADMINISTRADOR), Controller.getAll);
 *
 * - authenticate: exige el header "Authorization: Bearer <token>" y deja
 *   en req.usuario quién hace la petición ({ id, email, rol, clienteId }).
 * - optionalAuthenticate: igual, pero si no hay token (o no es válido) la
 *   petición sigue como visitante. Se usa en rutas públicas que muestran
 *   algo extra al administrador.
 * - authorize(...roles): corta con 403 si el rol del usuario no está entre
 *   los permitidos. Siempre va después de authenticate.
 *
 * Los errores no se responden acá: se pasan a next() y los arma el
 * errorHandler centralizado, como en el resto de la API.
 */

function extraerToken(req) {
  const [tipo, token] = (req.headers.authorization ?? "").split(" ");
  return tipo === "Bearer" && token ? token : null;
}

export function authenticate(req, res, next) {
  const token = extraerToken(req);
  if (!token) {
    return next(new UnauthorizedError(Messages.AUTH_TOKEN_REQUERIDO));
  }

  try {
    req.usuario = AuthService.autenticarToken(token);
    return next();
  } catch (error) {
    return next(error);
  }
}

export function optionalAuthenticate(req, res, next) {
  const token = extraerToken(req);
  if (token) {
    try {
      req.usuario = AuthService.autenticarToken(token);
    } catch {
      req.usuario = null;
    }
  }
  return next();
}

export function authorize(...rolesPermitidos) {
  return (req, res, next) => {
    if (!req.usuario || !rolesPermitidos.includes(req.usuario.rol)) {
      return next(new ForbiddenError(Messages.AUTH_SIN_PERMISO));
    }
    return next();
  };
}
