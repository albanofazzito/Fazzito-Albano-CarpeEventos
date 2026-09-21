import { EventoRepository } from "../repositories/evento.repository.js";
import { ClienteRepository } from "../repositories/cliente.repository.js";
import { ServicioRepository } from "../repositories/servicio.repository.js";
import { EstadoEvento, TRANSICIONES_VALIDAS, ESTADOS_ELIMINABLES } from "../enums/EstadoEvento.js";
import { Messages } from "../enums/Messages.js";
import { BadRequestError, NotFoundError, ConflictError } from "../exceptions/AppError.js";
import {
  isValidDateString,
  isFutureOrTodayDate,
  isValidTimeString,
  isEndTimeAfterStartTime,
  isPositiveInteger,
} from "../utils/validators.js";

/**
 * evento.service.js
 * Única responsabilidad: reglas de negocio y validaciones sobre Evento.
 * Es la única capa que conoce simultáneamente al EventoRepository, al
 * ClienteRepository y al ServicioRepository (para validar las FK). Los
 * controllers NUNCA acceden a un repositorio directamente.
 *
 * Cada regla de negocio documentada en el análisis del sistema
 * (sección 2 del entregable anterior) se implementa acá como una
 * validación explícita que lanza un AppError si no se cumple.
 */

const ESTADOS_CON_FECHA_BLOQUEADA = [EstadoEvento.CONFIRMADO, EstadoEvento.EN_CURSO];

function validarCamposObligatorios({ fecha, horaInicio, horaFin, cantidadInvitados, clienteId, servicioId }) {
  const faltaAlguno =
    fecha === undefined ||
    horaInicio === undefined ||
    horaFin === undefined ||
    cantidadInvitados === undefined ||
    clienteId === undefined ||
    servicioId === undefined;

  if (faltaAlguno) {
    throw new BadRequestError(Messages.EVENTO_CAMPOS_OBLIGATORIOS);
  }
}

function validarFecha(fecha) {
  if (!isValidDateString(fecha) || !isFutureOrTodayDate(fecha)) {
    throw new BadRequestError(Messages.EVENTO_FECHA_INVALIDA);
  }
}

function validarHorario(horaInicio, horaFin) {
  if (!isValidTimeString(horaInicio) || !isValidTimeString(horaFin) || !isEndTimeAfterStartTime(horaInicio, horaFin)) {
    throw new BadRequestError(Messages.EVENTO_HORARIO_INVALIDO);
  }
}

function validarCantidadInvitados(cantidadInvitados) {
  if (!isPositiveInteger(cantidadInvitados)) {
    throw new BadRequestError(Messages.EVENTO_CANTIDAD_INVITADOS_INVALIDA);
  }
}

function validarClienteExiste(clienteId) {
  const cliente = ClienteRepository.findById(clienteId);
  if (!cliente) {
    throw new NotFoundError(Messages.CLIENTE_NOT_FOUND);
  }
  return cliente;
}

function validarServicioExiste(servicioId) {
  const servicio = ServicioRepository.findById(servicioId);
  if (!servicio) {
    throw new NotFoundError(Messages.SERVICIO_NOT_FOUND);
  }
  return servicio;
}

/**
 * Regla de negocio: "No se puede confirmar un evento en una fecha y franja
 * horaria que ya tenga otro evento Confirmado o En curso para el salón."
 */
function validarDisponibilidad({ fecha, horaInicio, horaFin, excludeId }) {
  const solapados = EventoRepository.findOverlapping({
    fecha,
    horaInicio,
    horaFin,
    estados: ESTADOS_CON_FECHA_BLOQUEADA,
    excludeId,
  });
  if (solapados.length > 0) {
    throw new ConflictError(Messages.EVENTO_FECHA_NO_DISPONIBLE);
  }
}

function obtenerEventoOFallar(id) {
  const evento = EventoRepository.findById(id);
  if (!evento) {
    throw new NotFoundError(Messages.EVENTO_NOT_FOUND);
  }
  return evento;
}

function validarEstado(estado) {
  const estadosValidos = Object.values(EstadoEvento);
  if (!estadosValidos.includes(estado)) {
    throw new BadRequestError(Messages.EVENTO_ESTADO_INVALIDO);
  }
}

/**
 * Regla de negocio: "No se cancela un evento una vez iniciado" (y, en
 * general, solo se permiten las transiciones de estado definidas en el
 * diagrama de estados del análisis del sistema).
 */
function validarTransicionEstado(estadoActual, estadoNuevo) {
  if (estadoActual === estadoNuevo) return; // no-op, no es una transición
  const permitidos = TRANSICIONES_VALIDAS[estadoActual] ?? [];
  if (!permitidos.includes(estadoNuevo)) {
    throw new ConflictError(Messages.EVENTO_TRANSICION_INVALIDA);
  }
}

export const EventoService = {
  getAll() {
    return EventoRepository.findAll();
  },

  getById(id) {
    return obtenerEventoOFallar(id);
  },

  /**
   * Crea un Evento nuevo. Siempre nace en estado PENDIENTE (regla de
   * negocio: el estado inicial no lo decide quien llama a la API, lo
   * decide el sistema) y solo requiere disponibilidad de fecha una vez
   * que se confirme (ver update()).
   */
  create({ fecha, horaInicio, horaFin, cantidadInvitados, clienteId, servicioId }) {
    validarCamposObligatorios({ fecha, horaInicio, horaFin, cantidadInvitados, clienteId, servicioId });
    validarFecha(fecha);
    validarHorario(horaInicio, horaFin);
    validarCantidadInvitados(cantidadInvitados);
    validarClienteExiste(clienteId);
    validarServicioExiste(servicioId);

    return EventoRepository.create({
      fecha,
      horaInicio,
      horaFin,
      cantidadInvitados,
      clienteId,
      servicioId,
      estado: EstadoEvento.PENDIENTE,
    });
  },

  /**
   * Actualiza un Evento existente. Permite modificar datos y/o estado.
   * - Si se envían fecha/horario nuevos, se vuelven a validar por completo.
   * - Si se envía un nuevo estado, se valida la transición y, si el
   *   destino es CONFIRMADO o EN_CURSO, se valida disponibilidad.
   */
  update(id, cambios) {
    const eventoActual = obtenerEventoOFallar(id);

    const nuevaFecha = cambios.fecha ?? eventoActual.fecha;
    const nuevaHoraInicio = cambios.horaInicio ?? eventoActual.horaInicio;
    const nuevaHoraFin = cambios.horaFin ?? eventoActual.horaFin;
    const nuevaCantidad = cambios.cantidadInvitados ?? eventoActual.cantidadInvitados;
    const nuevoClienteId = cambios.clienteId ?? eventoActual.clienteId;
    const nuevoServicioId = cambios.servicioId ?? eventoActual.servicioId;
    const nuevoEstado = cambios.estado ?? eventoActual.estado;

    validarFecha(nuevaFecha);
    validarHorario(nuevaHoraInicio, nuevaHoraFin);
    validarCantidadInvitados(nuevaCantidad);
    validarClienteExiste(nuevoClienteId);
    validarServicioExiste(nuevoServicioId);
    validarEstado(nuevoEstado);
    validarTransicionEstado(eventoActual.estado, nuevoEstado);

    if (ESTADOS_CON_FECHA_BLOQUEADA.includes(nuevoEstado)) {
      validarDisponibilidad({
        fecha: nuevaFecha,
        horaInicio: nuevaHoraInicio,
        horaFin: nuevaHoraFin,
        excludeId: id,
      });
    }

    return EventoRepository.update(id, {
      fecha: nuevaFecha,
      horaInicio: nuevaHoraInicio,
      horaFin: nuevaHoraFin,
      cantidadInvitados: nuevaCantidad,
      clienteId: nuevoClienteId,
      servicioId: nuevoServicioId,
      estado: nuevoEstado,
    });
  },

  /**
   * Elimina (hard delete) un Evento. Regla de negocio: no se puede borrar
   * un evento Confirmado, En curso o Finalizado — primero hay que
   * cancelarlo (transición de estado) mediante update().
   */
  remove(id) {
    const evento = obtenerEventoOFallar(id);

    if (!ESTADOS_ELIMINABLES.includes(evento.estado)) {
      throw new ConflictError(Messages.EVENTO_NO_SE_PUEDE_ELIMINAR);
    }

    EventoRepository.delete(id);
  },
};

export default EventoService;
