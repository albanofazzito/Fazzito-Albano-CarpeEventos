/**
 * Presupuesto.js
 * Documento que se genera a partir de un Evento (relación 1 a 1). El monto
 * no se carga a mano: lo calcula PresupuestoService a partir del servicio
 * elegido y la cantidad de invitados, y `detalle` guarda cada renglón de
 * ese cálculo ({ concepto, cantidad, precioUnitario, subtotal }).
 */
class Presupuesto {
  constructor({ id, fechaEmision, montoTotal, estado, eventoId, detalle = [], fechaRespuesta = null }) {
    this.id = id;
    this.fechaEmision = fechaEmision;
    this.montoTotal = montoTotal;
    this.estado = estado;
    this.eventoId = eventoId;
    this.detalle = detalle;
    this.fechaRespuesta = fechaRespuesta;
  }
}

export default Presupuesto;
