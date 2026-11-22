import Cliente from "../models/Cliente.js";
import { createIdGenerator } from "../utils/idGenerator.js";
import { onlyDigits } from "../utils/validators.js";

/**
 * cliente.repository.js
 * Única responsabilidad: guardar/leer Clientes de un array en memoria.
 * No valida datos ni conoce reglas de negocio — eso es responsabilidad de
 * la capa de servicios. Los datos de prueba se cargan desde data/seed.js.
 */
const clientes = [];
const nextId = createIdGenerator(1);

export const ClienteRepository = {
  findAll() {
    return [...clientes];
  },

  findById(id) {
    return clientes.find((c) => c.id === id) ?? null;
  },

  /**
   * Busca otro cliente con el mismo email (sin distinguir mayúsculas) o el
   * mismo teléfono (comparando solo los dígitos, así "11 5555-0101" y
   * "1155550101" cuentan como el mismo número).
   */
  findByEmailOrTelefono(email, telefono, excludeId) {
    const emailBuscado = String(email).trim().toLowerCase();
    const telefonoBuscado = onlyDigits(telefono);

    return (
      clientes.find(
        (c) =>
          c.id !== excludeId &&
          (c.email.toLowerCase() === emailBuscado || onlyDigits(c.telefono) === telefonoBuscado)
      ) ?? null
    );
  },

  create(data) {
    const cliente = new Cliente({ id: nextId(), ...data });
    clientes.push(cliente);
    return cliente;
  },

  update(id, changes) {
    const index = clientes.findIndex((c) => c.id === id);
    if (index === -1) return null;
    clientes[index] = new Cliente({ ...clientes[index], ...changes });
    return clientes[index];
  },

  delete(id) {
    const index = clientes.findIndex((c) => c.id === id);
    if (index === -1) return false;
    clientes.splice(index, 1);
    return true;
  },
};

export default ClienteRepository;
