import { Link, useLocation } from "react-router";
import { useAuth } from "../../hooks/useAuth.js";
import { cx } from "../../utils/classNames.js";
import { paths } from "../../utils/routes.js";
import styles from "./PanelNav.module.css";

// Cada enlace indica con qué rutas se marca como "página actual".
const SECCIONES_CLIENTE = [
  { label: "Mis eventos", to: paths.eventos, activo: (ruta) => ruta.startsWith(paths.eventos) && ruta !== "/eventos/nuevo" },
  { label: "Pedir una fecha", to: paths.nuevoEvento(), activo: (ruta) => ruta === "/eventos/nuevo" },
  { label: "Mi cuenta", to: paths.miCuenta, activo: (ruta) => ruta === paths.miCuenta },
];

const SECCIONES_ADMIN = [
  { label: "Eventos", to: paths.eventos, activo: (ruta) => ruta.startsWith(paths.eventos) },
  { label: "Clientes", to: paths.clientes, activo: (ruta) => ruta.startsWith(paths.clientes) },
  { label: "Catálogo de servicios", to: paths.catalogo, activo: (ruta) => ruta === paths.catalogo },
];

/** Barra de secciones del panel. Cambia según el rol de quien tiene la sesión abierta. */
export default function PanelNav() {
  const { usuario, esAdmin } = useAuth();
  const { pathname } = useLocation();
  const secciones = esAdmin ? SECCIONES_ADMIN : SECCIONES_CLIENTE;

  return (
    <div className={cx(styles.barra, "surface-dark")}>
      <div className={cx("container", styles.inner)}>
        <nav aria-label="Secciones del panel">
          <ul className={styles.lista}>
            {secciones.map((seccion) => {
              const actual = seccion.activo(pathname);
              return (
                <li key={seccion.label}>
                  <Link
                    to={seccion.to}
                    className={cx(styles.enlace, actual && styles.actual)}
                    aria-current={actual ? "page" : undefined}
                  >
                    {seccion.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
        <p className={styles.usuario}>
          {esAdmin ? usuario.email : `Hola, ${usuario.nombre}`}
          <span className={styles.rol}>{usuario.rol}</span>
        </p>
      </div>
    </div>
  );
}
