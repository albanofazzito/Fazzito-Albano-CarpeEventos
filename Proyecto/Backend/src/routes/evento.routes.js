import { Router } from "express";
import { EventoController } from "../controllers/evento.controller.js";
import { authenticate, authorize } from "../middlewares/auth.middleware.js";
import { Rol } from "../enums/Rol.js";

const router = Router();

// Todas las operaciones sobre eventos requieren sesión. Qué eventos ve y
// modifica cada usuario lo resuelve EventoService según su rol.
router.use(authenticate);

router.get("/", EventoController.getAll);
router.get("/:id", EventoController.getById);
router.post("/", EventoController.create);
router.put("/:id", EventoController.update);
router.patch("/:id/estado", EventoController.cambiarEstado);
router.delete("/:id", authorize(Rol.ADMINISTRADOR), EventoController.remove);

export default router;
