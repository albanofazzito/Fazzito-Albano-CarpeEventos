import Servicio from "../models/Servicio.js";
import { createIdGenerator } from "../utils/idGenerator.js";

/**
 * servicio.repository.js
 * Única responsabilidad: guardar/leer Servicios de un array en memoria.
 */
const servicios = [];
const nextId = createIdGenerator(1);

function seed() {
  servicios.push(
    new Servicio({ id: nextId(), nombre: "Cumpleaños infantil", descripcion: "Alquiler de salón con animación incluida", precio: 350000, categoria: "Cumpleaños" }),
    new Servicio({ id: nextId(), nombre: "Boda / Casamiento", descripcion: "Espacio para celebraciones nupciales", precio: 900000, categoria: "Bodas" }),
    new Servicio({ id: nextId(), nombre: "Bautismo / Comunión", descripcion: "Evento religioso y familiar", precio: 280000, categoria: "Bautismos y comuniones" }),
    new Servicio({ id: nextId(), nombre: "Servicio integral", descripcion: "Animación, catering, DJ y decoración temática", precio: 550000, categoria: "Integral" })
  );
}
seed();

export const ServicioRepository = {
  findAll() {
    return [...servicios];
  },

  findById(id) {
    return servicios.find((s) => s.id === id) ?? null;
  },

  create(data) {
    const servicio = new Servicio({ id: nextId(), ...data });
    servicios.push(servicio);
    return servicio;
  },
};

export default ServicioRepository;
