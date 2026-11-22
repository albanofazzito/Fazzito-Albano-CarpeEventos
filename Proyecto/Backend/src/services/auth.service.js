import bcrypt from "bcryptjs";
import { UsuarioRepository } from "../repositories/usuario.repository.js";
import { ClienteRepository } from "../repositories/cliente.repository.js";
import { ClienteService } from "./cliente.service.js";
import { AUTH } from "../config/auth.config.js";
import { Rol } from "../enums/Rol.js";
import { Messages } from "../enums/Messages.js";
import { BadRequestError, ConflictError, UnauthorizedError } from "../exceptions/AppError.js";
import { isTokenExpiredError, signToken, verifyToken } from "../utils/jwt.js";
import { isNonEmptyString, isValidEmail, isValidPassword } from "../utils/validators.js";

/**
 * auth.service.js
 * Registro e inicio de sesión (análisis del sistema, funcionalidad 1).
 *  - Registrarse crea un Cliente (datos de contacto) y su Usuario (email,
 *    contraseña hasheada y rol Cliente). El rol nunca lo elige quien se
 *    registra: desde la web solo se crean cuentas de Cliente.
 *  - Iniciar sesión devuelve un token JWT que el frontend manda en el
 *    header Authorization de cada petición.
 */

const NOMBRE_ADMINISTRADOR = "Administración";

/** Datos públicos del usuario (nunca incluye el hash de la contraseña). */
function toPerfil(usuario) {
  const cliente = usuario.clienteId ? ClienteRepository.findById(usuario.clienteId) : null;

  return {
    id: usuario.id,
    email: usuario.email,
    rol: usuario.rol,
    clienteId: usuario.clienteId,
    nombre: cliente?.nombre ?? NOMBRE_ADMINISTRADOR,
    apellido: cliente?.apellido ?? "",
    telefono: cliente?.telefono ?? null,
  };
}

function crearSesion(usuario) {
  return { token: signToken(usuario), usuario: toPerfil(usuario) };
}

export const AuthService = {
  async registrar({ nombre, apellido, telefono, email, password }) {
    const faltaAlguno = [nombre, apellido, telefono, email, password].some(
      (valor) => valor === undefined || valor === null || String(valor).trim() === ""
    );
    if (faltaAlguno) {
      throw new BadRequestError(Messages.AUTH_REGISTRO_CAMPOS_OBLIGATORIOS);
    }
    if (!isValidPassword(password, AUTH.passwordMinLength)) {
      throw new BadRequestError(Messages.AUTH_PASSWORD_INVALIDA);
    }
    if (isValidEmail(email) && UsuarioRepository.findByEmail(email)) {
      throw new ConflictError(Messages.AUTH_EMAIL_REGISTRADO);
    }

    // Se hashea antes de crear el cliente para no dejar un registro a medias si algo falla.
    const passwordHash = await bcrypt.hash(password, AUTH.bcryptRounds);
    const cliente = ClienteService.create({ nombre, apellido, telefono, email });

    const usuario = UsuarioRepository.create({
      email: cliente.email,
      passwordHash,
      rol: Rol.CLIENTE,
      clienteId: cliente.id,
    });
    return crearSesion(usuario);
  },

  async login({ email, password }) {
    if (!isNonEmptyString(email) || !isNonEmptyString(password)) {
      throw new BadRequestError(Messages.AUTH_LOGIN_CAMPOS_OBLIGATORIOS);
    }
    if (!isValidEmail(email)) {
      throw new BadRequestError(Messages.CLIENTE_EMAIL_INVALIDO);
    }

    // Mismo mensaje si el email no existe o si la contraseña no coincide,
    // para no revelar qué emails tienen cuenta.
    const usuario = UsuarioRepository.findByEmail(email);
    const coincide = usuario ? await bcrypt.compare(password, usuario.passwordHash) : false;
    if (!coincide) {
      throw new UnauthorizedError(Messages.AUTH_CREDENCIALES_INVALIDAS);
    }

    return crearSesion(usuario);
  },

  getPerfil(usuarioId) {
    const usuario = UsuarioRepository.findById(usuarioId);
    if (!usuario) {
      throw new UnauthorizedError(Messages.AUTH_TOKEN_INVALIDO);
    }
    return toPerfil(usuario);
  },

  /**
   * Valida el token y devuelve quién hace la petición. Lo usa el middleware
   * authenticate. El usuario se busca de nuevo en cada petición para que
   * una cuenta eliminada deje de tener acceso aunque su token no haya vencido.
   */
  autenticarToken(token) {
    let payload;
    try {
      payload = verifyToken(token);
    } catch (error) {
      throw new UnauthorizedError(isTokenExpiredError(error) ? Messages.AUTH_TOKEN_VENCIDO : Messages.AUTH_TOKEN_INVALIDO);
    }

    const usuario = UsuarioRepository.findById(Number(payload.sub));
    if (!usuario) {
      throw new UnauthorizedError(Messages.AUTH_TOKEN_INVALIDO);
    }

    return { id: usuario.id, email: usuario.email, rol: usuario.rol, clienteId: usuario.clienteId };
  },
};

export default AuthService;
