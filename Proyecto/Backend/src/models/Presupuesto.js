/**
 * Presupuesto.js
 * Se mantiene del modelo de dominio original (DIAGRAMA.md). No forma parte
 * del CRUD implementado en esta entrega (que se enfoca en Evento), pero se
 * conserva para no perder el modelo completo del dominio.
 */
class Presupuesto {
  constructor({ id, fechaEmision, montoTotal, estado, eventoId }) {
    this.id = id;
    this.fechaEmision = fechaEmision;
    this.montoTotal = montoTotal;
    this.estado = estado;
    this.eventoId = eventoId;
  }
}

export default Presupuesto;
