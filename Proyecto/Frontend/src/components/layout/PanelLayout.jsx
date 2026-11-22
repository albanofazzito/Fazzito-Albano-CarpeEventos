import { Outlet } from "react-router";
import PanelNav from "./PanelNav.jsx";

/** Pantallas del panel (con sesión): la barra de secciones arriba y la pantalla debajo. */
export default function PanelLayout() {
  return (
    <>
      <PanelNav />
      <Outlet />
    </>
  );
}
