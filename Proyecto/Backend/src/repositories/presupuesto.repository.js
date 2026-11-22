import Presupuesto from "../models/Presupuesto.js";
import { createIdGenerator } from "../utils/idGenerator.js";

/**
 * presupuesto.repository.js
 * Única responsabilidad: guardar/leer Presupuestos de un array en memoria.
 * Como la relación con Evento es 1 a 1, se puede buscar por eventoId.
 */
const presupuestos = [];
const nextId = createIdGenerator(1);

export const PresupuestoRepository = {
  findAll() {
    return [...presupuestos];
  },

  findById(id) {
    return presupuestos.find((p) => p.id === id) ?? null;
  },

  findByEventoId(eventoId) {
    return presupuestos.find((p) => p.eventoId === eventoId) ?? null;
  },

  create(data) {
    const presupuesto = new Presupuesto({ id: nextId(), ...data });
    presupuestos.push(presupuesto);
    return presupuesto;
  },

  update(id, changes) {
    const index = presupuestos.findIndex((p) => p.id === id);
    if (index === -1) return null;
    presupuestos[index] = new Presupuesto({ ...presupuestos[index], ...changes });
    return presupuestos[index];
  },

  deleteByEventoId(eventoId) {
    const index = presupuestos.findIndex((p) => p.eventoId === eventoId);
    if (index === -1) return false;
    presupuestos.splice(index, 1);
    return true;
  },
};

export default PresupuestoRepository;
