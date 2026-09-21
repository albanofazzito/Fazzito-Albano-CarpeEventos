import { ServicioRepository } from "../repositories/servicio.repository.js";
import { Messages } from "../enums/Messages.js";
import { NotFoundError } from "../exceptions/AppError.js";

/**
 * servicio.service.js
 * Igual que ClienteService: solo lectura, para poder armar un Evento
 * (servicioId) consultando el catálogo disponible.
 */
export const ServicioService = {
  getAll() {
    return ServicioRepository.findAll();
  },

  getById(id) {
    const servicio = ServicioRepository.findById(id);
    if (!servicio) {
      throw new NotFoundError(Messages.SERVICIO_NOT_FOUND);
    }
    return servicio;
  },
};

export default ServicioService;
