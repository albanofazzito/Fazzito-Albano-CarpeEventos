/**
 * Servicio.js
 * Representación pura del dominio. Se agrega `activo` para la baja lógica:
 * un servicio dado de baja deja de ofrecerse, pero los eventos que ya lo
 * usaron conservan la referencia en su historial.
 */
class Servicio {
  constructor({ id, nombre, descripcion, precio, categoria, activo = true }) {
    this.id = id;
    this.nombre = nombre;
    this.descripcion = descripcion;
    this.precio = precio;
    this.categoria = categoria;
    this.activo = activo;
  }
}

export default Servicio;
