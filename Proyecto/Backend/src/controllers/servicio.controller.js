import { ServicioService } from "../services/servicio.service.js";
import { ApiResponse } from "../responses/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { parseId } from "../utils/parseId.js";

/**
 * servicio.controller.js
 * Endpoints de solo lectura del catálogo de Servicios.
 */
export const ServicioController = {
  getAll: asyncHandler(async (req, res) => {
    const servicios = ServicioService.getAll();
    return ApiResponse.success(res, servicios);
  }),

  getById: asyncHandler(async (req, res) => {
    const id = parseId(req.params.id);
    const servicio = ServicioService.getById(id);
    return ApiResponse.success(res, servicio);
  }),
};

export default ServicioController;
