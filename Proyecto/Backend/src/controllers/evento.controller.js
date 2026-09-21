import { EventoService } from "../services/evento.service.js";
import { ApiResponse } from "../responses/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { parseId } from "../utils/parseId.js";

/**
 * evento.controller.js
 * Única responsabilidad: traducir HTTP <-> EventoService.
 * No valida reglas de negocio, no accede a repositorios, no arma el
 * formato de la respuesta manualmente (usa ApiResponse). Cualquier error
 * lanzado por el servicio es capturado por asyncHandler y delegado al
 * middleware centralizado de errores.
 */
export const EventoController = {
  getAll: asyncHandler(async (req, res) => {
    const eventos = EventoService.getAll();
    return ApiResponse.success(res, eventos);
  }),

  getById: asyncHandler(async (req, res) => {
    const id = parseId(req.params.id);
    const evento = EventoService.getById(id);
    return ApiResponse.success(res, evento);
  }),

  create: asyncHandler(async (req, res) => {
    const nuevoEvento = EventoService.create(req.body);
    return ApiResponse.success(res, nuevoEvento, 201);
  }),

  update: asyncHandler(async (req, res) => {
    const id = parseId(req.params.id);
    const eventoActualizado = EventoService.update(id, req.body);
    return ApiResponse.success(res, eventoActualizado);
  }),

  remove: asyncHandler(async (req, res) => {
    const id = parseId(req.params.id);
    EventoService.remove(id);
    return ApiResponse.success(res, { id }, 200);
  }),
};

export default EventoController;
