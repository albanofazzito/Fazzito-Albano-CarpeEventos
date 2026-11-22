import { AuthService } from "../services/auth.service.js";
import { ApiResponse } from "../responses/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

/**
 * auth.controller.js
 * Registro, inicio de sesión y datos del usuario que tiene la sesión abierta.
 */
export const AuthController = {
  registrar: asyncHandler(async (req, res) => {
    const sesion = await AuthService.registrar(req.body);
    return ApiResponse.success(res, sesion, 201);
  }),

  login: asyncHandler(async (req, res) => {
    const sesion = await AuthService.login(req.body);
    return ApiResponse.success(res, sesion);
  }),

  perfil: asyncHandler(async (req, res) => {
    const perfil = AuthService.getPerfil(req.usuario.id);
    return ApiResponse.success(res, perfil);
  }),
};

export default AuthController;
