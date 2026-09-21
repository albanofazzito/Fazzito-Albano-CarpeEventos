import { ClienteService } from "../services/cliente.service.js";
import { ApiResponse } from "../responses/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { parseId } from "../utils/parseId.js";

/**
 * cliente.controller.js
 * Endpoints de solo lectura. El CRUD completo evaluado en esta entrega
 * está en EventoController; estos endpoints existen para poder consultar
 * qué clientes están disponibles al crear un Evento.
 */
export const ClienteController = {
  getAll: asyncHandler(async (req, res) => {
    const clientes = ClienteService.getAll();
    return ApiResponse.success(res, clientes);
  }),

  getById: asyncHandler(async (req, res) => {
    const id = parseId(req.params.id);
    const cliente = ClienteService.getById(id);
    return ApiResponse.success(res, cliente);
  }),
};

export default ClienteController;
