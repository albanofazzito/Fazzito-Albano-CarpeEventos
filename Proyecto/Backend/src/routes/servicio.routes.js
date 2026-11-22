import { Router } from "express";
import { ServicioController } from "../controllers/servicio.controller.js";
import { authenticate, authorize, optionalAuthenticate } from "../middlewares/auth.middleware.js";
import { Rol } from "../enums/Rol.js";

const router = Router();
const soloAdministrador = [authenticate, authorize(Rol.ADMINISTRADOR)];

// El catálogo es público (lo muestra la landing). El administrador además
// puede pedir los servicios dados de baja con ?incluirInactivos=true.
router.get("/", optionalAuthenticate, ServicioController.getAll);
router.get("/:id", ServicioController.getById);
router.post("/", soloAdministrador, ServicioController.create);
router.put("/:id", soloAdministrador, ServicioController.update);
router.delete("/:id", soloAdministrador, ServicioController.remove);

export default router;
