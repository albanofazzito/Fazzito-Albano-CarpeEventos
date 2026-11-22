import { ClienteRepository } from "../repositories/cliente.repository.js";
import { EventoRepository } from "../repositories/evento.repository.js";
import { UsuarioRepository } from "../repositories/usuario.repository.js";
import { Messages } from "../enums/Messages.js";
import { BadRequestError, ConflictError, ForbiddenError, NotFoundError } from "../exceptions/AppError.js";
import { puedeAccederAlCliente } from "../utils/permisos.js";
import { isStringOfLength, isValidEmail, isValidPhone } from "../utils/validators.js";

/**
 * cliente.service.js
 * Gestión de Clientes (análisis del sistema, funcionalidad 2):
 *  - El administrador da de alta, consulta, modifica y elimina clientes
 *    (por ejemplo, quienes reservan solo por WhatsApp, sin cuenta en la web).
 *  - Un cliente con cuenta solo puede ver y modificar sus propios datos.
 *  - Regla de negocio: "Cliente único por email/teléfono".
 */

function obtenerClienteOFallar(id) {
  const cliente = ClienteRepository.findById(id);
  if (!cliente) {
    throw new NotFoundError(Messages.CLIENTE_NOT_FOUND);
  }
  return cliente;
}

function verificarAcceso(clienteId, usuario) {
  if (!puedeAccederAlCliente(usuario, clienteId)) {
    throw new ForbiddenError(Messages.CLIENTE_SIN_PERMISO);
  }
}

/** Devuelve los datos limpios (sin espacios de más y email en minúsculas). */
function validarDatosCliente({ nombre, apellido, telefono, email }) {
  const faltaAlguno = [nombre, apellido, telefono, email].some(
    (valor) => valor === undefined || valor === null || String(valor).trim() === ""
  );
  if (faltaAlguno) {
    throw new BadRequestError(Messages.CLIENTE_CAMPOS_OBLIGATORIOS);
  }
  if (!isStringOfLength(nombre, 2, 60) || !isStringOfLength(apellido, 2, 60)) {
    throw new BadRequestError(Messages.CLIENTE_NOMBRE_INVALIDO);
  }
  if (!isValidEmail(email)) {
    throw new BadRequestError(Messages.CLIENTE_EMAIL_INVALIDO);
  }
  if (!isValidPhone(telefono)) {
    throw new BadRequestError(Messages.CLIENTE_TELEFONO_INVALIDO);
  }

  return {
    nombre: nombre.trim(),
    apellido: apellido.trim(),
    telefono: telefono.trim(),
    email: email.trim().toLowerCase(),
  };
}

/**
 * Regla de negocio: no puede haber dos clientes con el mismo email o
 * WhatsApp. El email tampoco puede estar usado por otra cuenta (por
 * ejemplo, la del administrador), porque es el dato con el que se ingresa.
 */
function validarNoDuplicado({ email, telefono }, { clienteId, usuarioId } = {}) {
  if (ClienteRepository.findByEmailOrTelefono(email, telefono, clienteId)) {
    throw new ConflictError(Messages.CLIENTE_DUPLICADO);
  }
  if (UsuarioRepository.findByEmail(email, usuarioId)) {
    throw new ConflictError(Messages.CLIENTE_DUPLICADO);
  }
}

/** Para el panel: si se registró en la web y cuántos eventos tiene. */
function toResumen(cliente) {
  return {
    ...cliente,
    tieneCuenta: Boolean(UsuarioRepository.findByClienteId(cliente.id)),
    cantidadEventos: EventoRepository.findByClienteId(cliente.id).length,
  };
}

const porApellidoYNombre = (a, b) =>
  `${a.apellido} ${a.nombre}`.localeCompare(`${b.apellido} ${b.nombre}`, "es", { sensitivity: "base" });

export const ClienteService = {
  getAll() {
    return ClienteRepository.findAll().sort(porApellidoYNombre).map(toResumen);
  },

  getById(id, usuario) {
    verificarAcceso(id, usuario);
    return toResumen(obtenerClienteOFallar(id));
  },

  /** Alta de un cliente. La usa el administrador y también el registro de la web. */
  create(datos) {
    const cliente = validarDatosCliente(datos);
    validarNoDuplicado(cliente);
    return toResumen(ClienteRepository.create(cliente));
  },

  /**
   * Modifica los datos de contacto. Si el cliente tiene cuenta, el email
   * de ingreso se actualiza junto con el de contacto.
   */
  update(id, cambios, usuario) {
    verificarAcceso(id, usuario);
    const actual = obtenerClienteOFallar(id);
    const cuenta = UsuarioRepository.findByClienteId(id);

    const cliente = validarDatosCliente({
      nombre: cambios.nombre ?? actual.nombre,
      apellido: cambios.apellido ?? actual.apellido,
      telefono: cambios.telefono ?? actual.telefono,
      email: cambios.email ?? actual.email,
    });
    validarNoDuplicado(cliente, { clienteId: id, usuarioId: cuenta?.id });

    const actualizado = ClienteRepository.update(id, cliente);
    if (cuenta) {
      UsuarioRepository.update(cuenta.id, { email: cliente.email });
    }
    return toResumen(actualizado);
  },

  /**
   * Elimina un cliente y su cuenta. No se permite si tiene eventos: el
   * historial de reservas del salón tiene que conservarse.
   */
  remove(id) {
    obtenerClienteOFallar(id);

    if (EventoRepository.findByClienteId(id).length > 0) {
      throw new ConflictError(Messages.CLIENTE_CON_EVENTOS);
    }

    UsuarioRepository.deleteByClienteId(id);
    ClienteRepository.delete(id);
  },
};

export default ClienteService;
