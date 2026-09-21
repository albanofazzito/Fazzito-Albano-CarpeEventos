import express from "express";
import apiRoutes from "./routes/index.routes.js";
import { notFoundRoute } from "./middlewares/notFoundRoute.js";
import { errorHandler } from "./middlewares/errorHandler.js";

/**
 * app.js
 * Configuración de la aplicación Express. El orden es importante:
 *   1) middlewares globales (parseo de body)
 *   2) rutas de la API
 *   3) notFoundRoute (cualquier ruta no matcheada hasta acá)
 *   4) errorHandler (SIEMPRE al final: es el manejo centralizado de errores)
 */
const app = express();

app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    success: true,
    data: {
      proyecto: "Carpe Eventos — API",
      descripcion: "Backend organizado con el patrón MVC (controllers/services/repositories).",
      documentacion: "Ver Backend/README.md",
    },
  });
});

app.use("/api", apiRoutes);

app.use(notFoundRoute);
app.use(errorHandler);

export default app;
