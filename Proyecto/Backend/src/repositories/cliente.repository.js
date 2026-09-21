import Cliente from "../models/Cliente.js";
import { createIdGenerator } from "../utils/idGenerator.js";

/**
 * cliente.repository.js
 * Única responsabilidad: guardar/leer Clientes de un array en memoria.
 * No valida datos ni conoce reglas de negocio — eso es responsabilidad de
 * la capa de servicios.
 */
const clientes = [];
const nextId = createIdGenerator(1);

function seed() {
  clientes.push(
    new Cliente({ id: nextId(), nombre: "Marina", apellido: "Gómez", telefono: "+54 9 11 5555-0101", email: "marina.gomez@example.com" }),
    new Cliente({ id: nextId(), nombre: "Diego", apellido: "Fernández", telefono: "+54 9 11 5555-0102", email: "diego.fernandez@example.com" }),
    new Cliente({ id: nextId(), nombre: "Lucía", apellido: "Álvarez", telefono: "+54 9 11 5555-0103", email: "lucia.alvarez@example.com" })
  );
}
seed();

export const ClienteRepository = {
  findAll() {
    return [...clientes];
  },

  findById(id) {
    return clientes.find((c) => c.id === id) ?? null;
  },

  findByEmailOrTelefono(email, telefono) {
    return (
      clientes.find(
        (c) => c.email.toLowerCase() === String(email).toLowerCase() || c.telefono === telefono
      ) ?? null
    );
  },

  create(data) {
    const cliente = new Cliente({ id: nextId(), ...data });
    clientes.push(cliente);
    return cliente;
  },
};

export default ClienteRepository;
