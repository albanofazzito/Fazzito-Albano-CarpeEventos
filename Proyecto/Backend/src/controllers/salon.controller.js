import { SalonService } from "../services/salon.service.js";
import { ApiResponse } from "../responses/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

/**
 * salon.controller.js
 * Datos públicos del salón: reglas de cotización y disponibilidad.
 */
export const SalonController = {
  getInfo: asyncHandler(async (req, res) => {
    return ApiResponse.success(res, SalonService.getInfo());
  }),

  getDisponibilidad: asyncHandler(async (req, res) => {
    const disponibilidad = SalonService.getDisponibilidad(req.query.mes);
    return ApiResponse.success(res, disponibilidad);
  }),
};

export default SalonController;
