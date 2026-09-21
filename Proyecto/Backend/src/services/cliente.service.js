import { ClienteRepository } from "../repositories/cliente.repository.js";
import { Messages } from "../enums/Messages.js";
import { NotFoundError } from "../exceptions/AppError.js";

/**
 * cliente.service.js
 * El CRUD completo de esta entrega está implementado sobre Evento. Este
 * servicio expone únicamente lectura de Cliente, necesaria para que el
 * cliente de la API (front-end/Postman) pueda listar clientes válidos al
 * armar un Evento (clienteId).
 */
export const ClienteService = {
  getAll() {
    return ClienteRepository.findAll();
  },

  getById(id) {
    const cliente = ClienteRepository.findById(id);
    if (!cliente) {
      throw new NotFoundError(Messages.CLIENTE_NOT_FOUND);
    }
    return cliente;
  },
};

export default ClienteService;
