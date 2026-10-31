import { useEffect, useRef, useState } from "react";
import { Link, NavLink } from "react-router";
import CalendarIcon from "../../assets/icons/calendar.svg?react";
import MenuIcon from "../../assets/icons/menu.svg?react";
import XIcon from "../../assets/icons/x.svg?react";
import { cx } from "../../utils/classNames.js";
import { paths, SECCIONES } from "../../utils/routes.js";
import Logo from "./Logo.jsx";
import styles from "./Navbar.module.css";

// Mismos enlaces que el boceto (Inicio, Servicios, Galería, Contacto) más el
// acceso al panel de eventos, que es la parte del sistema conectada a la API.
const ENLACES_SECCIONES = [
  { label: "Servicios", to: paths.seccion(SECCIONES.servicios) },
  { label: "Galería", to: paths.seccion(SECCIONES.galeria) },
  { label: "Contacto", to: paths.seccion(SECCIONES.contacto) },
];

export default function Navbar() {
  const [menuAbierto, setMenuAbierto] = useState(false);
  const toggleRef = useRef(null);

  const cerrarMenu = () => setMenuAbierto(false);

  useEffect(() => {
    if (!menuAbierto) return undefined;

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        setMenuAbierto(false);
        toggleRef.current?.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [menuAbierto]);

  const claseEnlace = ({ isActive }) => cx(styles.link, isActive && styles.active);

  return (
    <header className={cx(styles.header, "surface-dark")}>
      <div className={cx("container", styles.inner)}>
        <Logo onClick={cerrarMenu} />

        <button
          ref={toggleRef}
          type="button"
          className={styles.toggle}
          aria-expanded={menuAbierto}
          aria-controls="menu-principal"
          onClick={() => setMenuAbierto((abierto) => !abierto)}
        >
          {menuAbierto ? <XIcon /> : <MenuIcon />}
          <span className="visually-hidden">{menuAbierto ? "Cerrar menú" : "Abrir menú"}</span>
        </button>

        <nav aria-label="Principal">
          <ul id="menu-principal" className={cx(styles.menu, menuAbierto && styles.menuAbierto)}>
            <li>
              <NavLink to={paths.home} end className={claseEnlace} onClick={cerrarMenu}>
                Inicio
              </NavLink>
            </li>
            {ENLACES_SECCIONES.map((enlace) => (
              <li key={enlace.label}>
                <Link to={enlace.to} className={styles.link} onClick={cerrarMenu}>
                  {enlace.label}
                </Link>
              </li>
            ))}
            <li className={styles.separado}>
              <NavLink to={paths.eventos} className={({ isActive }) => cx(styles.panelLink, isActive && styles.active)} onClick={cerrarMenu}>
                <CalendarIcon className={styles.panelIcon} />
                Eventos
              </NavLink>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}
