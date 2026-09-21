import { Router } from "express";
import { ClienteController } from "../controllers/cliente.controller.js";

const router = Router();

router.get("/", ClienteController.getAll);
router.get("/:id", ClienteController.getById);

export default router;
