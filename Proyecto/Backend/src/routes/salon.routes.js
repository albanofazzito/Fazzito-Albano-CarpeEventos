import { Router } from "express";
import { SalonController } from "../controllers/salon.controller.js";

const router = Router();

router.get("/", SalonController.getInfo);
router.get("/disponibilidad", SalonController.getDisponibilidad);

export default router;
