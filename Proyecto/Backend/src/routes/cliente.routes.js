import { Router } from "express";
import { ClienteController } from "../controllers/cliente.controller.js";
import { authenticate, authorize } from "../middlewares/auth.middleware.js";
import { Rol } from "../enums/Rol.js";

const router = Router();

router.use(authenticate);

// Listado, alta y baja: solo el administrador. Consulta y modificación:
// también el propio cliente (ClienteService verifica que sean sus datos).
router.get("/", authorize(Rol.ADMINISTRADOR), ClienteController.getAll);
router.get("/:id", ClienteController.getById);
router.post("/", authorize(Rol.ADMINISTRADOR), ClienteController.create);
router.put("/:id", ClienteController.update);
router.delete("/:id", authorize(Rol.ADMINISTRADOR), ClienteController.remove);

export default router;
