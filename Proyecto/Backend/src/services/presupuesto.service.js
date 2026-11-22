import { PresupuestoRepository } from "../repositories/presupuesto.repository.js";
import { EventoRepository } from "../repositories/evento.repository.js";
import { ServicioRepository } from "../repositories/servicio.repository.js";
import { NEGOCIO } from "../config/negocio.config.js";
import { EstadoEvento } from "../enums/EstadoEvento.js";
import { EstadoPresupuesto } from "../enums/EstadoPresupuesto.js";
import { Messages } from "../enums/Messages.js";
import {
  BadRequestError,
  ConflictError,
  ForbiddenError,
  NotFoundError,
  UnprocessableEntityError,
} from "../exceptions/AppError.js";
import { getTodayISO, hasMomentPassed } from "../utils/dates.js";
import { puedeAccederAlCliente } from "../utils/permisos.js";
import { isPositiveInteger } from "../utils/validators.js";

/**
 * presupuesto.service.js
 * Reglas de negocio del Presupuesto:
 *  - El monto se calcula, no se ingresa a mano: precio del servicio (que
 *    incluye hasta NEGOCIO.invitadosIncluidos personas) más un recargo por
 *    cada invitado adicional.
 *  - Solo se genera para un evento Pendiente, y al generarlo el evento pasa
 *    a Presupuestado.
 *  - El cliente (o el administrador en su nombre) lo aprueba o lo rechaza.
 *    Si lo rechaza, el evento vuelve a Pendiente para ajustarlo.
 */

function calcular(servicio, cantidadInvitados) {
  const { invitadosIncluidos, precioInvitadoAdicional } = NEGOCIO;
  const adicionales = Math.max(0, cantidadInvitados - invitadosIncluidos);

  const detalle = [
    {
      concepto: `${servicio.nombre} (incluye hasta ${invitadosIncluidos} invitados)`,
      cantidad: 1,
      precioUnitario: servicio.precio,
      subtotal: servicio.precio,
    },
  ];

  if (adicionales > 0) {
    detalle.push({
      concepto: "Invitados adicionales",
      cantidad: adicionales,
      precioUnitario: precioInvitadoAdicional,
      subtotal: adicionales * precioInvitadoAdicional,
    });
  }

  const montoTotal = detalle.reduce((total, item) => total + item.subtotal, 0);
  return { detalle, montoTotal };
}

function obtenerPresupuestoOFallar(id) {
  const presupuesto = PresupuestoRepository.findById(id);
  if (!presupuesto) {
    throw new NotFoundError(Messages.PRESUPUESTO_NOT_FOUND);
  }
  return presupuesto;
}

function obtenerEventoOFallar(eventoId) {
  const evento = EventoRepository.findById(eventoId);
  if (!evento) {
    throw new NotFoundError(Messages.EVENTO_NOT_FOUND);
  }
  return evento;
}

function verificarAcceso(evento, usuario) {
  if (!puedeAccederAlCliente(usuario, evento.clienteId)) {
    throw new ForbiddenError(Messages.PRESUPUESTO_SIN_PERMISO);
  }
}

/** Aprobar o rechazar: mismas validaciones, distinto estado final. */
function responder(id, usuario, respuesta) {
  const presupuesto = obtenerPresupuestoOFallar(id);
  const evento = obtenerEventoOFallar(presupuesto.eventoId);
  verificarAcceso(evento, usuario);

  if (presupuesto.estado !== EstadoPresupuesto.PENDIENTE) {
    throw new ConflictError(Messages.PRESUPUESTO_YA_RESPONDIDO);
  }
  if (evento.estado !== EstadoEvento.PRESUPUESTADO) {
    throw new ConflictError(Messages.PRESUPUESTO_EVENTO_CERRADO);
  }
  if (respuesta === EstadoPresupuesto.APROBADO && hasMomentPassed(evento.fecha, evento.horaInicio)) {
    throw new ConflictError(Messages.EVENTO_YA_COMENZO);
  }

  const actualizado = PresupuestoRepository.update(id, { estado: respuesta, fechaRespuesta: getTodayISO() });

  // Rechazado: la reserva vuelve a Pendiente para que se pueda modificar
  // (por ejemplo, con menos invitados) y volver a cotizar.
  if (respuesta === EstadoPresupuesto.RECHAZADO) {
    EventoRepository.update(evento.id, { estado: EstadoEvento.PENDIENTE });
  }

  return actualizado;
}

export const PresupuestoService = {
  calcular,

  /** Cotización sin guardar nada: la usa el formulario de reserva antes de enviarla. */
  estimar({ servicioId, cantidadInvitados }) {
    if (!isPositiveInteger(servicioId) || !isPositiveInteger(cantidadInvitados)) {
      throw new BadRequestError(Messages.PRESUPUESTO_ESTIMACION_DATOS);
    }
    if (cantidadInvitados > NEGOCIO.capacidadMaxima) {
      throw new UnprocessableEntityError(Messages.EVENTO_AFORO_SUPERADO);
    }

    const servicio = ServicioRepository.findById(servicioId);
    if (!servicio) {
      throw new NotFoundError(Messages.SERVICIO_NOT_FOUND);
    }
    if (!servicio.activo) {
      throw new UnprocessableEntityError(Messages.SERVICIO_INACTIVO);
    }

    return {
      servicio: { id: servicio.id, nombre: servicio.nombre },
      cantidadInvitados,
      ...calcular(servicio, cantidadInvitados),
    };
  },

  getById(id, usuario) {
    const presupuesto = obtenerPresupuestoOFallar(id);
    verificarAcceso(obtenerEventoOFallar(presupuesto.eventoId), usuario);
    return presupuesto;
  },

  getByEventoId(eventoId) {
    return PresupuestoRepository.findByEventoId(eventoId);
  },

  /**
   * Genera el presupuesto de un evento Pendiente y lo pasa a Presupuestado.
   * Si el evento ya tenía uno (rechazado), se reemplaza por el nuevo cálculo.
   */
  generar(eventoId) {
    if (eventoId === undefined || eventoId === null) {
      throw new BadRequestError(Messages.PRESUPUESTO_EVENTO_OBLIGATORIO);
    }
    if (!isPositiveInteger(eventoId)) {
      throw new BadRequestError(Messages.INVALID_ID);
    }

    const evento = obtenerEventoOFallar(eventoId);
    if (evento.estado !== EstadoEvento.PENDIENTE) {
      throw new ConflictError(Messages.PRESUPUESTO_EVENTO_NO_PENDIENTE);
    }
    if (hasMomentPassed(evento.fecha, evento.horaInicio)) {
      throw new ConflictError(Messages.EVENTO_YA_COMENZO);
    }

    const servicio = ServicioRepository.findById(evento.servicioId);
    const datos = {
      ...calcular(servicio, evento.cantidadInvitados),
      estado: EstadoPresupuesto.PENDIENTE,
      fechaEmision: getTodayISO(),
      fechaRespuesta: null,
    };

    const existente = PresupuestoRepository.findByEventoId(evento.id);
    const presupuesto = existente
      ? PresupuestoRepository.update(existente.id, datos)
      : PresupuestoRepository.create({ ...datos, eventoId: evento.id });

    EventoRepository.update(evento.id, { estado: EstadoEvento.PRESUPUESTADO });
    return presupuesto;
  },

  /**
   * Si cambian los datos de un evento ya presupuestado, el monto anterior
   * deja de valer: se recalcula y vuelve a quedar pendiente de aprobación.
   */
  recalcular(evento) {
    const existente = PresupuestoRepository.findByEventoId(evento.id);
    if (!existente) return null;

    const servicio = ServicioRepository.findById(evento.servicioId);
    return PresupuestoRepository.update(existente.id, {
      ...calcular(servicio, evento.cantidadInvitados),
      estado: EstadoPresupuesto.PENDIENTE,
      fechaEmision: getTodayISO(),
      fechaRespuesta: null,
    });
  },

  aprobar(id, usuario) {
    return responder(id, usuario, EstadoPresupuesto.APROBADO);
  },

  rechazar(id, usuario) {
    return responder(id, usuario, EstadoPresupuesto.RECHAZADO);
  },

  eliminarPorEvento(eventoId) {
    PresupuestoRepository.deleteByEventoId(eventoId);
  },
};

export default PresupuestoService;
