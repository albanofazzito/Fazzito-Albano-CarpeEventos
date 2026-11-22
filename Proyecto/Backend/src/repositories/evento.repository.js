import Evento from "../models/Evento.js";
import { createIdGenerator } from "../utils/idGenerator.js";

/**
 * evento.repository.js
 * Única responsabilidad: acceso a los datos de Evento (array en memoria).
 * NO valida datos, NO conoce reglas de negocio, NO arma respuestas HTTP.
 * Eso vive en services/evento.service.js. El repositorio solo sabe
 * "guardar", "buscar", "actualizar" y "borrar" dentro de la colección.
 */
const eventos = [];
const nextId = createIdGenerator(1);

export const EventoRepository = {
  findAll() {
    return [...eventos];
  },

  findById(id) {
    return eventos.find((e) => e.id === id) ?? null;
  },

  findByClienteId(clienteId) {
    return eventos.filter((e) => e.clienteId === clienteId);
  },

  findByServicioId(servicioId) {
    return eventos.filter((e) => e.servicioId === servicioId);
  },

  findByEstados(estados) {
    return eventos.filter((e) => estados.includes(e.estado));
  },

  /** Eventos de un mes ("AAAA-MM") en alguno de los estados indicados. */
  findByMes(mes, estados) {
    return eventos.filter((e) => e.fecha.startsWith(`${mes}-`) && estados.includes(e.estado));
  },

  /**
   * Eventos que se superponen en fecha/horario con el rango dado, filtrando
   * por estado y, si se indica, por cliente.
   */
  findOverlapping({ fecha, horaInicio, horaFin, estados, excludeId, clienteId }) {
    return eventos.filter((e) => {
      if (excludeId !== undefined && e.id === excludeId) return false;
      if (clienteId !== undefined && e.clienteId !== clienteId) return false;
      if (e.fecha !== fecha) return false;
      if (!estados.includes(e.estado)) return false;
      return e.horaInicio < horaFin && horaInicio < e.horaFin;
    });
  },

  create(data) {
    const evento = new Evento({ id: nextId(), ...data });
    eventos.push(evento);
    return evento;
  },

  update(id, changes) {
    const index = eventos.findIndex((e) => e.id === id);
    if (index === -1) return null;
    eventos[index] = new Evento({ ...eventos[index], ...changes });
    return eventos[index];
  },

  delete(id) {
    const index = eventos.findIndex((e) => e.id === id);
    if (index === -1) return false;
    eventos.splice(index, 1);
    return true;
  },
};

export default EventoRepository;
