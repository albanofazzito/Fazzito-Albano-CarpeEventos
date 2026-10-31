import express from "express";
import cors from "cors";
import apiRoutes from "./routes/index.routes.js";
import { notFoundRoute } from "./middlewares/notFoundRoute.js";
import { errorHandler } from "./middlewares/errorHandler.js";

/**
 * app.js
 * Configuración de la aplicación Express. El orden es importante:
 *   1) middlewares globales (CORS y parseo de body)
 *   2) rutas de la API
 *   3) notFoundRoute (cualquier ruta no matcheada hasta acá)
 *   4) errorHandler (SIEMPRE al final: es el manejo centralizado de errores)
 */
const app = express();

// El frontend corre en otro origen (Vite: puerto 5173 en desarrollo y 4173
// en preview), así que el navegador solo le permite consumir la API si esta
// habilita CORS para ese origen. Se puede sobrescribir con la variable de
// entorno CORS_ORIGIN (varios orígenes separados por coma).
const allowedOrigins = (process.env.CORS_ORIGIN ?? "http://localhost:5173,http://localhost:4173")
  .split(",")
  .map((origin) => origin.trim());

app.use(cors({ origin: allowedOrigins }));
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
