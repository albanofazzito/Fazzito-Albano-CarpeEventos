import Evento from "../models/Evento.js";
import { EstadoEvento } from "../enums/EstadoEvento.js";
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

function seed() {
  eventos.push(
    new Evento({
      id: nextId(),
      fecha: "2026-11-14",
      horaInicio: "18:00",
      horaFin: "23:00",
      cantidadInvitados: 60,
      estado: EstadoEvento.CONFIRMADO,
      clienteId: 1,
      servicioId: 1,
    }),
    new Evento({
      id: nextId(),
      fecha: "2026-12-05",
      horaInicio: "19:00",
      horaFin: "23:59",
      cantidadInvitados: 120,
      estado: EstadoEvento.PENDIENTE,
      clienteId: 2,
      servicioId: 2,
    })
  );
}
seed();

export const EventoRepository = {
  findAll() {
    return [...eventos];
  },

  findById(id) {
    return eventos.find((e) => e.id === id) ?? null;
  },

  /** Eventos que se superponen en fecha/horario con el rango dado, filtrando por estado. */
  findOverlapping({ fecha, horaInicio, horaFin, estados, excludeId }) {
    return eventos.filter((e) => {
      if (excludeId !== undefined && e.id === excludeId) return false;
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
