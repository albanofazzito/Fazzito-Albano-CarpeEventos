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
 *
 * req.usuario lo completa el middleware authenticate: el servicio lo usa
 * para aplicar los permisos de cada rol.
 */
export const EventoController = {
  getAll: asyncHandler(async (req, res) => {
    const filtros = {
      estado: req.query.estado,
      clienteId: req.query.clienteId === undefined ? undefined : parseId(req.query.clienteId),
    };
    const eventos = EventoService.getAll(req.usuario, filtros);
    return ApiResponse.success(res, eventos);
  }),

  getById: asyncHandler(async (req, res) => {
    const id = parseId(req.params.id);
    const evento = EventoService.getById(id, req.usuario);
    return ApiResponse.success(res, evento);
  }),

  create: asyncHandler(async (req, res) => {
    const nuevoEvento = EventoService.create(req.body, req.usuario);
    return ApiResponse.success(res, nuevoEvento, 201);
  }),

  update: asyncHandler(async (req, res) => {
    const id = parseId(req.params.id);
    const eventoActualizado = EventoService.update(id, req.body, req.usuario);
    return ApiResponse.success(res, eventoActualizado);
  }),

  cambiarEstado: asyncHandler(async (req, res) => {
    const id = parseId(req.params.id);
    const evento = EventoService.cambiarEstado(id, req.body.estado, req.usuario);
    return ApiResponse.success(res, evento);
  }),

  remove: asyncHandler(async (req, res) => {
    const id = parseId(req.params.id);
    EventoService.remove(id);
    return ApiResponse.success(res, { id }, 200);
  }),
};

export default EventoController;
