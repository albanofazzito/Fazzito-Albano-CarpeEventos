import { ServicioRepository } from "../repositories/servicio.repository.js";
import { EventoRepository } from "../repositories/evento.repository.js";
import { ESTADOS_ACTIVOS } from "../enums/EstadoEvento.js";
import { Messages } from "../enums/Messages.js";
import { BadRequestError, ConflictError, NotFoundError } from "../exceptions/AppError.js";
import { esAdministrador } from "../utils/permisos.js";
import { isPositiveNumber, isStringOfLength } from "../utils/validators.js";

/**
 * servicio.service.js
 * Catálogo de servicios del salón. Cualquiera puede consultarlo; solo el
 * Administrador lo modifica (regla de negocio "Solo el Administrador
 * gestiona el catálogo", aplicada con el middleware authorize en las rutas).
 *
 * La baja es lógica (activo = false): un servicio dado de baja ya no se
 * puede elegir para nuevas reservas, pero los eventos que lo usaron siguen
 * mostrando su nombre y precio en el historial.
 */

function obtenerServicioOFallar(id) {
  const servicio = ServicioRepository.findById(id);
  if (!servicio) {
    throw new NotFoundError(Messages.SERVICIO_NOT_FOUND);
  }
  return servicio;
}

function validarDatosServicio({ nombre, descripcion, precio, categoria, activo }) {
  const faltaAlguno = [nombre, precio, categoria].some(
    (valor) => valor === undefined || valor === null || String(valor).trim() === ""
  );
  if (faltaAlguno) {
    throw new BadRequestError(Messages.SERVICIO_CAMPOS_OBLIGATORIOS);
  }

  const descripcionValida = descripcion === undefined || descripcion === null || isStringOfLength(descripcion, 0, 200);
  if (!isStringOfLength(nombre, 3, 60) || !isStringOfLength(categoria, 3, 60) || !descripcionValida) {
    throw new BadRequestError(Messages.SERVICIO_TEXTO_INVALIDO);
  }
  if (!isPositiveNumber(precio)) {
    throw new BadRequestError(Messages.SERVICIO_PRECIO_INVALIDO);
  }
  if (typeof activo !== "boolean") {
    throw new BadRequestError(Messages.SERVICIO_ACTIVO_INVALIDO);
  }

  return {
    nombre: nombre.trim(),
    descripcion: descripcion?.trim() ?? "",
    precio,
    categoria: categoria.trim(),
    activo,
  };
}

function validarNombreUnico(nombre, excludeId) {
  if (ServicioRepository.findByNombre(nombre, excludeId)) {
    throw new ConflictError(Messages.SERVICIO_NOMBRE_DUPLICADO);
  }
}

export const ServicioService = {
  /** El público ve solo los servicios activos; el administrador puede pedir todos. */
  getAll({ incluirInactivos = false } = {}, usuario = null) {
    return incluirInactivos && esAdministrador(usuario)
      ? ServicioRepository.findAll()
      : ServicioRepository.findActivos();
  },

  getById(id) {
    return obtenerServicioOFallar(id);
  },

  create(datos) {
    const servicio = validarDatosServicio({ ...datos, activo: datos.activo ?? true });
    validarNombreUnico(servicio.nombre);
    return ServicioRepository.create(servicio);
  },

  /** Modifica datos y precio. También sirve para reactivar un servicio ({ activo: true }). */
  update(id, cambios) {
    const actual = obtenerServicioOFallar(id);

    const servicio = validarDatosServicio({
      nombre: cambios.nombre ?? actual.nombre,
      descripcion: cambios.descripcion ?? actual.descripcion,
      precio: cambios.precio ?? actual.precio,
      categoria: cambios.categoria ?? actual.categoria,
      activo: cambios.activo ?? actual.activo,
    });
    validarNombreUnico(servicio.nombre, id);

    return ServicioRepository.update(id, servicio);
  },

  /**
   * Baja lógica. No se permite mientras haya reservas abiertas con este
   * servicio, para no dejar eventos en marcha con un servicio que ya no existe.
   */
  remove(id) {
    obtenerServicioOFallar(id);

    const reservasAbiertas = EventoRepository.findByServicioId(id).filter((evento) =>
      ESTADOS_ACTIVOS.includes(evento.estado)
    );
    if (reservasAbiertas.length > 0) {
      throw new ConflictError(Messages.SERVICIO_CON_RESERVAS_ACTIVAS);
    }

    return ServicioRepository.update(id, { activo: false });
  },
};

export default ServicioService;
