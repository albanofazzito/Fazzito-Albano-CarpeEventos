import Servicio from "../models/Servicio.js";
import { createIdGenerator } from "../utils/idGenerator.js";

/**
 * servicio.repository.js
 * Única responsabilidad: guardar/leer Servicios de un array en memoria.
 */
const servicios = [];
const nextId = createIdGenerator(1);

export const ServicioRepository = {
  findAll() {
    return [...servicios];
  },

  findActivos() {
    return servicios.filter((s) => s.activo);
  },

  findById(id) {
    return servicios.find((s) => s.id === id) ?? null;
  },

  findByNombre(nombre, excludeId) {
    const buscado = String(nombre).trim().toLowerCase();
    return servicios.find((s) => s.id !== excludeId && s.nombre.toLowerCase() === buscado) ?? null;
  },

  create(data) {
    const servicio = new Servicio({ id: nextId(), ...data });
    servicios.push(servicio);
    return servicio;
  },

  update(id, changes) {
    const index = servicios.findIndex((s) => s.id === id);
    if (index === -1) return null;
    servicios[index] = new Servicio({ ...servicios[index], ...changes });
    return servicios[index];
  },
};

export default ServicioRepository;
