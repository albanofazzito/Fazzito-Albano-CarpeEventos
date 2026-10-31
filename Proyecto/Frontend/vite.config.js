import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import svgr from "vite-plugin-svgr";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // Permite importar los íconos de src/assets/icons como componentes
    // (import Icono from "./icono.svg?react"). Son decorativos por defecto:
    // el texto que los acompaña es el que leen los lectores de pantalla.
    svgr({
      svgrOptions: {
        icon: true,
        svgProps: { "aria-hidden": "true", focusable: "false" },
      },
    }),
  ],
  // Puerto fijo: la API solo acepta pedidos (CORS) desde los orígenes
  // configurados en el backend, así que no conviene que Vite cambie de puerto.
  server: { port: 5173, strictPort: true },
  preview: { port: 4173, strictPort: true },
});
