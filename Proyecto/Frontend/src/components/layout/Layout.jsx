import { useRef } from "react";
import { Outlet } from "react-router";
import { useRouteFocus } from "../../hooks/useRouteFocus.js";
import Footer from "./Footer.jsx";
import Navbar from "./Navbar.jsx";
import styles from "./Layout.module.css";

/** Estructura común de todas las pantallas: navegación, contenido y pie. */
export default function Layout() {
  const mainRef = useRef(null);
  useRouteFocus(mainRef);

  return (
    <div className={styles.layout}>
      <a href="#contenido" className="skip-link">
        Saltar al contenido principal
      </a>
      <Navbar />
      <main id="contenido" ref={mainRef} tabIndex={-1} className={styles.main}>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
