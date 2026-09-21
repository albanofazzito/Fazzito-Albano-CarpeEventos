/**
 * Servicio.js
 * Representación pura del dominio. Igual a la definición original de la
 * Entrega 1, sin cambios.
 */
class Servicio {
  constructor({ id, nombre, descripcion, precio, categoria }) {
    this.id = id;
    this.nombre = nombre;
    this.descripcion = descripcion;
    this.precio = precio;
    this.categoria = categoria;
  }
}

export default Servicio;
