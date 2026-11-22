import { Router } from "express";
import { AuthController } from "../controllers/auth.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";

const router = Router();

router.post("/registro", AuthController.registrar);
router.post("/login", AuthController.login);
router.get("/perfil", authenticate, AuthController.perfil);

export default router;
