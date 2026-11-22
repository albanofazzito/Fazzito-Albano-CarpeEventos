import { Rol } from "../enums/Rol.js";

/**
 * permisos.js
 * Preguntas simples sobre el usuario que hace la petición (req.usuario, lo
 * completa el middleware de autenticación). Los services las usan para
 * aplicar la regla "un Cliente solo ve sus propios datos".
 */
export function esAdministrador(usuario) {
  return usuario?.rol === Rol.ADMINISTRADOR;
}

/** El administrador accede a cualquier cliente; un cliente, solo a sí mismo. */
export function puedeAccederAlCliente(usuario, clienteId) {
  return esAdministrador(usuario) || (usuario?.clienteId !== null && usuario?.clienteId === clienteId);
}
