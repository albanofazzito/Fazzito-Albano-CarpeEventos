import { ClienteService } from "../services/cliente.service.js";
import { ApiResponse } from "../responses/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { parseId } from "../utils/parseId.js";

/**
 * cliente.controller.js
 * CRUD de Cliente. Qué puede hacer cada rol lo deciden las rutas
 * (authorize) y el servicio (un cliente solo accede a sus datos).
 */
export const ClienteController = {
  getAll: asyncHandler(async (req, res) => {
    const clientes = ClienteService.getAll();
    return ApiResponse.success(res, clientes);
  }),

  getById: asyncHandler(async (req, res) => {
    const id = parseId(req.params.id);
    const cliente = ClienteService.getById(id, req.usuario);
    return ApiResponse.success(res, cliente);
  }),

  create: asyncHandler(async (req, res) => {
    const cliente = ClienteService.create(req.body);
    return ApiResponse.success(res, cliente, 201);
  }),

  update: asyncHandler(async (req, res) => {
    const id = parseId(req.params.id);
    const cliente = ClienteService.update(id, req.body, req.usuario);
    return ApiResponse.success(res, cliente);
  }),

  remove: asyncHandler(async (req, res) => {
    const id = parseId(req.params.id);
    ClienteService.remove(id);
    return ApiResponse.success(res, { id });
  }),
};

export default ClienteController;
