import { Router } from "express";
import { PresupuestoController } from "../controllers/presupuesto.controller.js";
import { authenticate, authorize } from "../middlewares/auth.middleware.js";
import { Rol } from "../enums/Rol.js";

const router = Router();

// Pública: cotización orientativa para el formulario de reserva. Va antes
// de "/:id" para que "estimacion" no se interprete como un id.
router.get("/estimacion", PresupuestoController.estimar);

router.get("/:id", authenticate, PresupuestoController.getById);
router.post("/", authenticate, authorize(Rol.ADMINISTRADOR), PresupuestoController.generar);
router.patch("/:id/aprobar", authenticate, PresupuestoController.aprobar);
router.patch("/:id/rechazar", authenticate, PresupuestoController.rechazar);

export default router;
