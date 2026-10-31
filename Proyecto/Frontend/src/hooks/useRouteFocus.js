import { useEffect, useRef } from "react";
import { useLocation } from "react-router";

const prefiereMenosMovimiento = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * Maneja el scroll y el foco al navegar, algo que una SPA no hace sola:
 * - con ancla (/#servicios) lleva a esa sección y le pasa el foco;
 * - con una ruta nueva vuelve arriba y enfoca el <main>, para que quien usa
 *   teclado o lector de pantalla empiece a leer la página nueva desde el inicio.
 * En la carga inicial no se mueve el foco: el primer Tab tiene que llegar al
 * enlace "Saltar al contenido".
 */
export function useRouteFocus(mainRef) {
  const location = useLocation();
  const ubicacionAnterior = useRef(null);

  useEffect(() => {
    // Se compara con la ubicación anterior (y no con un "primera vez") para que
    // ejecutar el efecto dos veces, como hace StrictMode, no cuente como navegación.
    const huboNavegacion = ubicacionAnterior.current !== null && ubicacionAnterior.current !== location.key;
    ubicacionAnterior.current = location.key;

    if (location.hash) {
      const seccion = document.getElementById(decodeURIComponent(location.hash.slice(1)));
      if (seccion) {
        seccion.scrollIntoView({ behavior: prefiereMenosMovimiento() ? "auto" : "smooth" });
        seccion.focus({ preventScroll: true });
        return;
      }
    }

    if (huboNavegacion) {
      window.scrollTo(0, 0);
      mainRef.current?.focus({ preventScroll: true });
    }
  }, [location.key, location.hash, mainRef]);
}

export default useRouteFocus;
