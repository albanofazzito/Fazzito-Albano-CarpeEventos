import { PresupuestoService } from "../services/presupuesto.service.js";
import { ApiResponse } from "../responses/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { parseId } from "../utils/parseId.js";

/** Los query params siempre llegan como texto: se convierten a número para el servicio. */
const toNumber = (valor) => (valor === undefined || valor === "" ? undefined : Number(valor));

/**
 * presupuesto.controller.js
 * Estimación pública, generación (administrador) y respuesta del cliente
 * (aprobar o rechazar) de los presupuestos.
 */
export const PresupuestoController = {
  estimar: asyncHandler(async (req, res) => {
    const estimacion = PresupuestoService.estimar({
      servicioId: toNumber(req.query.servicioId),
      cantidadInvitados: toNumber(req.query.cantidadInvitados),
    });
    return ApiResponse.success(res, estimacion);
  }),

  getById: asyncHandler(async (req, res) => {
    const id = parseId(req.params.id);
    const presupuesto = PresupuestoService.getById(id, req.usuario);
    return ApiResponse.success(res, presupuesto);
  }),

  generar: asyncHandler(async (req, res) => {
    const presupuesto = PresupuestoService.generar(req.body.eventoId);
    return ApiResponse.success(res, presupuesto, 201);
  }),

  aprobar: asyncHandler(async (req, res) => {
    const id = parseId(req.params.id);
    const presupuesto = PresupuestoService.aprobar(id, req.usuario);
    return ApiResponse.success(res, presupuesto);
  }),

  rechazar: asyncHandler(async (req, res) => {
    const id = parseId(req.params.id);
    const presupuesto = PresupuestoService.rechazar(id, req.usuario);
    return ApiResponse.success(res, presupuesto);
  }),
};

export default PresupuestoController;
