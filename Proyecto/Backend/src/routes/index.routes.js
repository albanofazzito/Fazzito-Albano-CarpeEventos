import { Router } from "express";
import authRoutes from "./auth.routes.js";
import eventoRoutes from "./evento.routes.js";
import clienteRoutes from "./cliente.routes.js";
import servicioRoutes from "./servicio.routes.js";
import presupuestoRoutes from "./presupuesto.routes.js";
import salonRoutes from "./salon.routes.js";

const router = Router();

router.use("/auth", authRoutes);
router.use("/eventos", eventoRoutes);
router.use("/clientes", clienteRoutes);
router.use("/servicios", servicioRoutes);
router.use("/presupuestos", presupuestoRoutes);
router.use("/salon", salonRoutes);

export default router;
