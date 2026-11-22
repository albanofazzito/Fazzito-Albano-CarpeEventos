import { EventoRepository } from "../repositories/evento.repository.js";
import { ClienteRepository } from "../repositories/cliente.repository.js";
import { ServicioRepository } from "../repositories/servicio.repository.js";
import { PresupuestoService } from "./presupuesto.service.js";
import { NEGOCIO } from "../config/negocio.config.js";
import {
  EstadoEvento,
  ESTADOS_ACTIVOS,
  ESTADOS_CON_FECHA_BLOQUEADA,
  ESTADOS_EDITABLES,
  ESTADOS_ELIMINABLES,
  esTransicionValida,
} from "../enums/EstadoEvento.js";
import { EstadoPresupuesto } from "../enums/EstadoPresupuesto.js";
import { Rol } from "../enums/Rol.js";
import { Messages } from "../enums/Messages.js";
import {
  BadRequestError,
  ConflictError,
  ForbiddenError,
  NotFoundError,
  UnprocessableEntityError,
} from "../exceptions/AppError.js";
import { getTodayISO, hasMomentPassed } from "../utils/dates.js";
import { esAdministrador, puedeAccederAlCliente } from "../utils/permisos.js";
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
 * Es la capa que conoce a los repositorios de Evento, Cliente y Servicio
 * (para validar las FK) y que coordina con PresupuestoService. Los
 * controllers NUNCA acceden a un repositorio directamente.
 *
 * Cada regla de negocio documentada en el análisis del sistema
 * (sección 2) se implementa acá como una validación explícita que lanza
 * un AppError si no se cumple.
 */

/**
 * Quién puede llevar un evento a cada estado con PATCH /eventos/:id/estado.
 * Pendiente y Presupuestado no figuran: los asigna el sistema al generar o
 * rechazar un presupuesto (ver presupuesto.service.js).
 */
const ROLES_POR_ESTADO_DESTINO = Object.freeze({
  [EstadoEvento.CONFIRMADO]: [Rol.ADMINISTRADOR],
  [EstadoEvento.EN_CURSO]: [Rol.ADMINISTRADOR],
  [EstadoEvento.FINALIZADO]: [Rol.ADMINISTRADOR],
  [EstadoEvento.CANCELADO]: [Rol.ADMINISTRADOR, Rol.CLIENTE],
});

function validarCamposObligatorios({ fecha, horaInicio, horaFin, cantidadInvitados, servicioId }) {
  const faltaAlguno = [fecha, horaInicio, horaFin, cantidadInvitados, servicioId].some(
    (valor) => valor === undefined || valor === null
  );

  if (faltaAlguno) {
    throw new BadRequestError(Messages.EVENTO_CAMPOS_OBLIGATORIOS);
  }
}

function validarIds(clienteId, servicioId) {
  if (!isPositiveInteger(clienteId) || !isPositiveInteger(servicioId)) {
    throw new BadRequestError(Messages.EVENTO_IDS_INVALIDOS);
  }
}

function validarFecha(fecha) {
  if (!isValidDateString(fecha) || !isFutureOrTodayDate(fecha)) {
    throw new BadRequestError(Messages.EVENTO_FECHA_INVALIDA);
  }
}

function validarHorario(fecha, horaInicio, horaFin) {
  if (!isValidTimeString(horaInicio) || !isValidTimeString(horaFin) || !isEndTimeAfterStartTime(horaInicio, horaFin)) {
    throw new BadRequestError(Messages.EVENTO_HORARIO_INVALIDO);
  }
  // Si el evento es hoy, no puede empezar en una hora que ya pasó.
  if (hasMomentPassed(fecha, horaInicio)) {
    throw new BadRequestError(Messages.EVENTO_HORARIO_PASADO);
  }
}

/** Regla de negocio: "Aforo del salón". */
function validarCantidadInvitados(cantidadInvitados) {
  if (!isPositiveInteger(cantidadInvitados)) {
    throw new BadRequestError(Messages.EVENTO_CANTIDAD_INVITADOS_INVALIDA);
  }
  if (cantidadInvitados > NEGOCIO.capacidadMaxima) {
    throw new UnprocessableEntityError(Messages.EVENTO_AFORO_SUPERADO);
  }
}

function validarClienteExiste(clienteId) {
  const cliente = ClienteRepository.findById(clienteId);
  if (!cliente) {
    throw new NotFoundError(Messages.CLIENTE_NOT_FOUND);
  }
  return cliente;
}

/**
 * El servicio tiene que existir y seguir en el catálogo. Si un evento ya
 * usaba un servicio que después se dio de baja, puede conservarlo.
 */
function validarServicioDisponible(servicioId, servicioActualId) {
  const servicio = ServicioRepository.findById(servicioId);
  if (!servicio) {
    throw new NotFoundError(Messages.SERVICIO_NOT_FOUND);
  }
  if (!servicio.activo && servicioId !== servicioActualId) {
    throw new UnprocessableEntityError(Messages.SERVICIO_INACTIVO);
  }
  return servicio;
}

/**
 * Regla de negocio: "No se puede confirmar un evento en una fecha y franja
 * horaria que ya tenga otro evento Confirmado o En curso para el salón."
 * También se aplica al pedir o modificar una reserva, para no aceptar
 * solicitudes en horarios que ya están tomados.
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

/** Evita solicitudes duplicadas: un cliente no pide dos veces la misma franja. */
function validarSolicitudNoDuplicada({ clienteId, fecha, horaInicio, horaFin, excludeId }) {
  const duplicadas = EventoRepository.findOverlapping({
    fecha,
    horaInicio,
    horaFin,
    estados: ESTADOS_ACTIVOS,
    excludeId,
    clienteId,
  });
  if (duplicadas.length > 0) {
    throw new ConflictError(Messages.EVENTO_SOLICITUD_DUPLICADA);
  }
}

/** Validaciones compartidas por el alta y la modificación de una reserva. */
function validarDatosReserva(datos, { excludeId, servicioActualId } = {}) {
  validarIds(datos.clienteId, datos.servicioId);
  validarFecha(datos.fecha);
  validarHorario(datos.fecha, datos.horaInicio, datos.horaFin);
  validarCantidadInvitados(datos.cantidadInvitados);
  validarClienteExiste(datos.clienteId);
  validarServicioDisponible(datos.servicioId, servicioActualId);
  validarDisponibilidad({ ...datos, excludeId });
  validarSolicitudNoDuplicada({ ...datos, excludeId });
}

function obtenerEventoOFallar(id) {
  const evento = EventoRepository.findById(id);
  if (!evento) {
    throw new NotFoundError(Messages.EVENTO_NOT_FOUND);
  }
  return evento;
}

/** Regla de negocio: "Un Cliente solo ve sus propios datos". */
function verificarAcceso(evento, usuario) {
  if (!puedeAccederAlCliente(usuario, evento.clienteId)) {
    throw new ForbiddenError(Messages.EVENTO_SIN_PERMISO);
  }
}

function validarEstado(estado) {
  if (!Object.values(EstadoEvento).includes(estado)) {
    throw new BadRequestError(Messages.EVENTO_ESTADO_INVALIDO);
  }
}

/** Reglas extra según el estado al que se quiere llevar el evento. */
function validarReglasDelEstadoDestino(evento, estadoNuevo) {
  if (estadoNuevo === EstadoEvento.CONFIRMADO) {
    // Regla de negocio: "Un evento no se confirma sin presupuesto aprobado".
    const presupuesto = PresupuestoService.getByEventoId(evento.id);
    if (presupuesto?.estado !== EstadoPresupuesto.APROBADO) {
      throw new ConflictError(Messages.EVENTO_SIN_PRESUPUESTO_APROBADO);
    }
    if (hasMomentPassed(evento.fecha, evento.horaInicio)) {
      throw new ConflictError(Messages.EVENTO_YA_COMENZO);
    }
    validarDisponibilidad({ ...evento, excludeId: evento.id });
  }

  if (estadoNuevo === EstadoEvento.EN_CURSO && evento.fecha !== getTodayISO()) {
    throw new ConflictError(Messages.EVENTO_INICIO_FUERA_DE_FECHA);
  }
}

/** Lo que devuelve la API: el evento con su cliente, servicio y presupuesto. */
function toDetalle(evento) {
  const cliente = ClienteRepository.findById(evento.clienteId);
  const servicio = ServicioRepository.findById(evento.servicioId);

  return {
    ...evento,
    cliente: cliente && {
      id: cliente.id,
      nombre: cliente.nombre,
      apellido: cliente.apellido,
      telefono: cliente.telefono,
      email: cliente.email,
    },
    servicio,
    presupuesto: PresupuestoService.getByEventoId(evento.id),
  };
}

const porFechaYHora = (a, b) => `${a.fecha} ${a.horaInicio}`.localeCompare(`${b.fecha} ${b.horaInicio}`);

export const EventoService = {
  /**
   * El administrador ve todos los eventos (y puede filtrar por cliente);
   * un cliente ve solo los suyos. Ambos pueden filtrar por estado.
   */
  getAll(usuario, { estado, clienteId } = {}) {
    if (estado !== undefined) validarEstado(estado);

    let eventos = esAdministrador(usuario)
      ? EventoRepository.findAll()
      : EventoRepository.findByClienteId(usuario.clienteId);

    if (esAdministrador(usuario) && clienteId !== undefined) {
      eventos = eventos.filter((evento) => evento.clienteId === clienteId);
    }
    if (estado !== undefined) {
      eventos = eventos.filter((evento) => evento.estado === estado);
    }

    return eventos.sort(porFechaYHora).map(toDetalle);
  },

  getById(id, usuario) {
    const evento = obtenerEventoOFallar(id);
    verificarAcceso(evento, usuario);
    return toDetalle(evento);
  },

  /**
   * Registra una solicitud de reserva. Siempre nace en estado PENDIENTE
   * (el estado inicial lo decide el sistema, no quien llama a la API).
   * Un cliente reserva siempre a su nombre; el administrador indica para
   * qué cliente es (por ejemplo, alguien que consultó por WhatsApp).
   */
  create(datos, usuario) {
    validarCamposObligatorios(datos);

    let clienteId = usuario.clienteId;
    if (esAdministrador(usuario)) {
      if (datos.clienteId === undefined || datos.clienteId === null) {
        throw new BadRequestError(Messages.EVENTO_CLIENTE_OBLIGATORIO);
      }
      clienteId = datos.clienteId;
    }

    const reserva = {
      fecha: datos.fecha,
      horaInicio: datos.horaInicio,
      horaFin: datos.horaFin,
      cantidadInvitados: datos.cantidadInvitados,
      clienteId,
      servicioId: datos.servicioId,
    };
    validarDatosReserva(reserva);

    const evento = EventoRepository.create({ ...reserva, estado: EstadoEvento.PENDIENTE });
    return toDetalle(evento);
  },

  /**
   * Modifica los datos de una reserva (no su estado: eso se hace con
   * cambiarEstado). Solo mientras está Pendiente o Presupuestado. Si ya
   * tenía presupuesto, se recalcula y vuelve a esperar la aprobación.
   */
  update(id, cambios, usuario) {
    if (cambios.estado !== undefined) {
      throw new BadRequestError(Messages.EVENTO_ESTADO_EN_PUT);
    }

    const eventoActual = obtenerEventoOFallar(id);
    verificarAcceso(eventoActual, usuario);

    if (!ESTADOS_EDITABLES.includes(eventoActual.estado)) {
      throw new ConflictError(Messages.EVENTO_NO_EDITABLE);
    }

    const reserva = {
      fecha: cambios.fecha ?? eventoActual.fecha,
      horaInicio: cambios.horaInicio ?? eventoActual.horaInicio,
      horaFin: cambios.horaFin ?? eventoActual.horaFin,
      cantidadInvitados: cambios.cantidadInvitados ?? eventoActual.cantidadInvitados,
      // Solo el administrador puede pasar la reserva a otro cliente.
      clienteId: esAdministrador(usuario) ? (cambios.clienteId ?? eventoActual.clienteId) : eventoActual.clienteId,
      servicioId: cambios.servicioId ?? eventoActual.servicioId,
    };
    validarDatosReserva(reserva, { excludeId: id, servicioActualId: eventoActual.servicioId });

    const actualizado = EventoRepository.update(id, reserva);
    if (actualizado.estado === EstadoEvento.PRESUPUESTADO) {
      PresupuestoService.recalcular(actualizado);
    }
    return toDetalle(actualizado);
  },

  /**
   * Cambia el estado de un evento validando, en este orden: que el estado
   * exista, que se pueda asignar a mano, que el rol del usuario lo permita,
   * que la transición sea válida y las reglas propias del estado destino.
   */
  cambiarEstado(id, estadoNuevo, usuario) {
    if (estadoNuevo === undefined || estadoNuevo === null) {
      throw new BadRequestError(Messages.EVENTO_ESTADO_OBLIGATORIO);
    }
    validarEstado(estadoNuevo);

    const evento = obtenerEventoOFallar(id);
    verificarAcceso(evento, usuario);

    const rolesPermitidos = ROLES_POR_ESTADO_DESTINO[estadoNuevo];
    if (!rolesPermitidos) {
      throw new BadRequestError(Messages.EVENTO_ESTADO_AUTOMATICO);
    }
    if (!rolesPermitidos.includes(usuario.rol)) {
      throw new ForbiddenError(Messages.AUTH_SIN_PERMISO);
    }

    if (evento.estado === estadoNuevo) return toDetalle(evento); // no es una transición
    if (!esTransicionValida(evento.estado, estadoNuevo)) {
      throw new ConflictError(Messages.EVENTO_TRANSICION_INVALIDA);
    }
    validarReglasDelEstadoDestino(evento, estadoNuevo);

    return toDetalle(EventoRepository.update(id, { estado: estadoNuevo }));
  },

  /**
   * Elimina (hard delete) un Evento junto con su presupuesto. Regla de
   * negocio: no se puede borrar un evento Confirmado, En curso o
   * Finalizado — primero hay que cancelarlo.
   */
  remove(id) {
    const evento = obtenerEventoOFallar(id);

    if (!ESTADOS_ELIMINABLES.includes(evento.estado)) {
      throw new ConflictError(Messages.EVENTO_NO_SE_PUEDE_ELIMINAR);
    }

    PresupuestoService.eliminarPorEvento(id);
    EventoRepository.delete(id);
  },

  /**
   * Estados automáticos (análisis del sistema, sección 5): un evento
   * Confirmado pasa a "En curso" al llegar su hora de inicio, y a
   * "Finalizado" cuando pasa su hora de fin. Lo ejecuta server.js al
   * arrancar y una vez por minuto.
   */
  actualizarEstadosPorFecha(ahora = new Date()) {
    let actualizados = 0;

    EventoRepository.findByEstados(ESTADOS_CON_FECHA_BLOQUEADA).forEach((evento) => {
      let estadoNuevo = null;
      if (hasMomentPassed(evento.fecha, evento.horaFin, ahora)) {
        estadoNuevo = EstadoEvento.FINALIZADO;
      } else if (evento.estado === EstadoEvento.CONFIRMADO && hasMomentPassed(evento.fecha, evento.horaInicio, ahora)) {
        estadoNuevo = EstadoEvento.EN_CURSO;
      }

      if (estadoNuevo) {
        EventoRepository.update(evento.id, { estado: estadoNuevo });
        actualizados += 1;
      }
    });

    return actualizados;
  },
};

export default EventoService;
