import { useEffect } from "react";
import { NEGOCIO } from "../utils/constants.js";

/** Título de la pestaña para cada pantalla: ayuda a ubicarse, sobre todo con lector de pantalla. */
export function useDocumentTitle(titulo) {
  useEffect(() => {
    document.title = titulo ? `${titulo} · ${NEGOCIO.nombre}` : `${NEGOCIO.nombre} · Salón de fiestas en Versalles`;
  }, [titulo]);
}

export default useDocumentTitle;
