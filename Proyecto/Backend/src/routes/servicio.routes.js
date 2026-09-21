import { Router } from "express";
import { ServicioController } from "../controllers/servicio.controller.js";

const router = Router();

router.get("/", ServicioController.getAll);
router.get("/:id", ServicioController.getById);

export default router;
