import { BrowserRouter, Route, Routes } from "react-router";
import Layout from "./components/layout/Layout.jsx";
import ToastProvider from "./context/ToastProvider.jsx";
import EditarEventoPage from "./pages/EditarEventoPage.jsx";
import EventoDetallePage from "./pages/EventoDetallePage.jsx";
import EventosPage from "./pages/EventosPage.jsx";
import HomePage from "./pages/HomePage.jsx";
import NotFoundPage from "./pages/NotFoundPage.jsx";
import NuevoEventoPage from "./pages/NuevoEventoPage.jsx";

/**
 * Organización general: proveedores globales (rutas y notificaciones) y
 * el mapa de pantallas. Todas comparten el Layout (navbar + footer).
 */
export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<HomePage />} />
            <Route path="eventos" element={<EventosPage />} />
            <Route path="eventos/nuevo" element={<NuevoEventoPage />} />
            <Route path="eventos/:id" element={<EventoDetallePage />} />
            <Route path="eventos/:id/editar" element={<EditarEventoPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </ToastProvider>
    </BrowserRouter>
  );
}
