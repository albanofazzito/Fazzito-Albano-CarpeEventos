import { ServicioService } from "../services/servicio.service.js";
import { ApiResponse } from "../responses/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { parseId } from "../utils/parseId.js";

/**
 * servicio.controller.js
 * Catálogo de Servicios: lectura pública y gestión solo para el
 * Administrador (lo controla authorize en servicio.routes.js).
 */
export const ServicioController = {
  getAll: asyncHandler(async (req, res) => {
    const filtros = { incluirInactivos: req.query.incluirInactivos === "true" };
    const servicios = ServicioService.getAll(filtros, req.usuario);
    return ApiResponse.success(res, servicios);
  }),

  getById: asyncHandler(async (req, res) => {
    const id = parseId(req.params.id);
    const servicio = ServicioService.getById(id);
    return ApiResponse.success(res, servicio);
  }),

  create: asyncHandler(async (req, res) => {
    const servicio = ServicioService.create(req.body);
    return ApiResponse.success(res, servicio, 201);
  }),

  update: asyncHandler(async (req, res) => {
    const id = parseId(req.params.id);
    const servicio = ServicioService.update(id, req.body);
    return ApiResponse.success(res, servicio);
  }),

  remove: asyncHandler(async (req, res) => {
    const id = parseId(req.params.id);
    const servicio = ServicioService.remove(id);
    return ApiResponse.success(res, servicio);
  }),
};

export default ServicioController;
