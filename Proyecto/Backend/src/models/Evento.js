/**
 * Evento.js
 * Entidad principal elegida para el CRUD de esta entrega (ver documento de
 * análisis del sistema, sección 5 y 6). Es el proceso central del negocio:
 * une a un Cliente con un Servicio en una fecha/horario, con un estado que
 * recorre su ciclo de vida (ver enums/EstadoEvento.js).
 *
 * Cambio respecto del placeholder de la Entrega 1: en lugar de embeber los
 * objetos completos `cliente` y `servicio`, el Evento guarda sus IDs
 * (clienteId, servicioId). Es el patrón esperado cuando la persistencia
 * vive en repositorios separados (aunque acá sean arrays en memoria): evita
 * datos duplicados/desincronizados y es el mismo criterio que se usaría con
 * una base de datos relacional.
 */
class Evento {
  constructor({
    id,
    fecha,
    horaInicio,
    horaFin,
    cantidadInvitados,
    estado,
    clienteId,
    servicioId,
  }) {
    this.id = id;
    this.fecha = fecha;
    this.horaInicio = horaInicio;
    this.horaFin = horaFin;
    this.cantidadInvitados = cantidadInvitados;
    this.estado = estado;
    this.clienteId = clienteId;
    this.servicioId = servicioId;
  }
}

export default Evento;
