/**
 * Usuario.js
 * Entidad de autenticación que el análisis del sistema (sección 7) pedía
 * incorporar al modelo. Guarda las credenciales y el rol; los datos de
 * contacto siguen viviendo en Cliente. Un usuario con rol Cliente está
 * asociado a un registro de Cliente (clienteId); el Administrador no.
 *
 * La contraseña nunca se guarda en texto plano: solo su hash (bcrypt).
 */
class Usuario {
  constructor({ id, email, passwordHash, rol, clienteId = null }) {
    this.id = id;
    this.email = email;
    this.passwordHash = passwordHash;
    this.rol = rol;
    this.clienteId = clienteId;
  }
}

export default Usuario;
