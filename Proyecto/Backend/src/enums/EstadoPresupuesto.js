/**
 * EstadoPresupuesto.js
 * Un presupuesto nace Pendiente (esperando la respuesta del cliente) y
 * pasa a Aprobado o Rechazado. Solo con un presupuesto Aprobado el evento
 * puede confirmarse.
 */
export const EstadoPresupuesto = Object.freeze({
  PENDIENTE: "Pendiente",
  APROBADO: "Aprobado",
  RECHAZADO: "Rechazado",
});

export default EstadoPresupuesto;
