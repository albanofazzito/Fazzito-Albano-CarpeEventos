import { BrowserRouter, Route, Routes } from "react-router";
import RequireAuth from "./components/auth/RequireAuth.jsx";
import Layout from "./components/layout/Layout.jsx";
import PanelLayout from "./components/layout/PanelLayout.jsx";
import AuthProvider from "./context/AuthProvider.jsx";
import ToastProvider from "./context/ToastProvider.jsx";
import CatalogoPage from "./pages/CatalogoPage.jsx";
import ClienteDetallePage from "./pages/ClienteDetallePage.jsx";
import ClientesPage from "./pages/ClientesPage.jsx";
import DisponibilidadPage from "./pages/DisponibilidadPage.jsx";
import EditarEventoPage from "./pages/EditarEventoPage.jsx";
import EventoDetallePage from "./pages/EventoDetallePage.jsx";
import EventosPage from "./pages/EventosPage.jsx";
import HomePage from "./pages/HomePage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import NotFoundPage from "./pages/NotFoundPage.jsx";
import NuevoEventoPage from "./pages/NuevoEventoPage.jsx";
import PerfilPage from "./pages/PerfilPage.jsx";
import RegistroPage from "./pages/RegistroPage.jsx";
import { ROLES } from "./utils/roles.js";

/**
 * Organización general: proveedores globales (rutas, notificaciones y
 * sesión) y el mapa de pantallas. Todas comparten el Layout (navbar + footer).
 *
 * - Públicas: landing, disponibilidad, ingresar y registro.
 * - Con sesión (RequireAuth): el panel, con su barra de secciones.
 *   Algunas pantallas además piden un rol puntual.
 */
export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <Routes>
            <Route element={<Layout />}>
              <Route index element={<HomePage />} />
              <Route path="disponibilidad" element={<DisponibilidadPage />} />
              <Route path="ingresar" element={<LoginPage />} />
              <Route path="registro" element={<RegistroPage />} />

              <Route element={<RequireAuth />}>
                <Route element={<PanelLayout />}>
                  <Route path="eventos" element={<EventosPage />} />
                  <Route path="eventos/nuevo" element={<NuevoEventoPage />} />
                  <Route path="eventos/:id" element={<EventoDetallePage />} />
                  <Route path="eventos/:id/editar" element={<EditarEventoPage />} />

                  <Route element={<RequireAuth roles={[ROLES.CLIENTE]} />}>
                    <Route path="mi-cuenta" element={<PerfilPage />} />
                  </Route>

                  <Route element={<RequireAuth roles={[ROLES.ADMINISTRADOR]} />}>
                    <Route path="clientes" element={<ClientesPage />} />
                    <Route path="clientes/:id" element={<ClienteDetallePage />} />
                    <Route path="catalogo" element={<CatalogoPage />} />
                  </Route>
                </Route>
              </Route>

              <Route path="*" element={<NotFoundPage />} />
            </Route>
          </Routes>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}
