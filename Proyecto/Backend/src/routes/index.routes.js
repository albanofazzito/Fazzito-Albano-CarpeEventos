import { Router } from "express";
import eventoRoutes from "./evento.routes.js";
import clienteRoutes from "./cliente.routes.js";
import servicioRoutes from "./servicio.routes.js";

const router = Router();

router.use("/eventos", eventoRoutes);
router.use("/clientes", clienteRoutes);
router.use("/servicios", servicioRoutes);

export default router;
