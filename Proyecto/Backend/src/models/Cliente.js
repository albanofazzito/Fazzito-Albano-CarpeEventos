/**
 * Cliente.js
 * Representación pura del dominio (sin lógica de negocio ni de persistencia).
 * Igual a la definición original de la Entrega 1, sin cambios.
 */
class Cliente {
  constructor({ id, nombre, apellido, telefono, email }) {
    this.id = id;
    this.nombre = nombre;
    this.apellido = apellido;
    this.telefono = telefono;
    this.email = email;
  }
}

export default Cliente;
