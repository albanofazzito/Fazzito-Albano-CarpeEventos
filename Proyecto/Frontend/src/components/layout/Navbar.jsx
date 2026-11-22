import { startTransition, useEffect, useRef, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router";
import CalendarIcon from "../../assets/icons/calendar.svg?react";
import LogInIcon from "../../assets/icons/log-in.svg?react";
import LogOutIcon from "../../assets/icons/log-out.svg?react";
import MenuIcon from "../../assets/icons/menu.svg?react";
import XIcon from "../../assets/icons/x.svg?react";
import { useAuth } from "../../hooks/useAuth.js";
import { useToast } from "../../hooks/useToast.js";
import { cx } from "../../utils/classNames.js";
import { paths, SECCIONES } from "../../utils/routes.js";
import Logo from "./Logo.jsx";
import styles from "./Navbar.module.css";

// Mismos enlaces que el boceto (Inicio, Servicios, Galería, Contacto) más
// la disponibilidad del salón y el acceso a la cuenta.
const ENLACES_SECCIONES = [
  { label: "Servicios", to: paths.seccion(SECCIONES.servicios) },
  { label: "Galería", to: paths.seccion(SECCIONES.galeria) },
  { label: "Contacto", to: paths.seccion(SECCIONES.contacto) },
];

export default function Navbar() {
  const [menuAbierto, setMenuAbierto] = useState(false);
  const toggleRef = useRef(null);
  const { usuario, esAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

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

  function cerrarSesion() {
    cerrarMenu();
    // React Router aplica los cambios de ruta como una transición. Si la sesión
    // se cerrara fuera de ella, la pantalla protegida se volvería a dibujar
    // antes de llegar al inicio y redirigiría a "Ingresar". Dentro de la misma
    // transición, los dos cambios se aplican juntos.
    startTransition(() => {
      navigate(paths.home);
      logout();
    });
    toast.success("Sesión cerrada", "¡Gracias por visitarnos!");
  }

  const claseEnlace = ({ isActive }) => cx(styles.link, isActive && styles.active);
  const clasePanel = ({ isActive }) => cx(styles.panelLink, isActive && styles.active);

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
            <li>
              <NavLink to={paths.disponibilidad} className={claseEnlace} onClick={cerrarMenu}>
                Disponibilidad
              </NavLink>
            </li>

            {usuario ? (
              <>
                <li className={styles.separado}>
                  <NavLink to={paths.eventos} className={clasePanel} onClick={cerrarMenu}>
                    <CalendarIcon className={styles.panelIcon} />
                    {esAdmin ? "Panel" : "Mis eventos"}
                  </NavLink>
                </li>
                <li>
                  <button type="button" className={styles.salir} onClick={cerrarSesion}>
                    <LogOutIcon className={styles.panelIcon} />
                    Salir
                    <span className="visually-hidden"> de la cuenta de {usuario.nombre}</span>
                  </button>
                </li>
              </>
            ) : (
              <li className={styles.separado}>
                <NavLink to={paths.ingresar} className={clasePanel} onClick={cerrarMenu}>
                  <LogInIcon className={styles.panelIcon} />
                  Ingresar
                </NavLink>
              </li>
            )}
          </ul>
        </nav>
      </div>
    </header>
  );
}
