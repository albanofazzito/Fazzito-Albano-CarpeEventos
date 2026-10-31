import { useId } from "react";
import { ACCION_HACIA_ESTADO, ESTADOS, getEstadoSlug, getTransicionesPosibles } from "../../utils/estados.js";
import Button from "../ui/Button.jsx";
import styles from "./EstadoActions.module.css";

/**
 * Botones para avanzar el evento al siguiente estado. Solo aparecen las
 * transiciones permitidas desde el estado actual.
 */
export default function EstadoActions({ estado, estadoEnProceso, onCambiarEstado }) {
  const baseId = useId();
  const transiciones = getTransicionesPosibles(estado);

  if (transiciones.length === 0) {
    return <p className={styles.vacio}>Este evento ya está cerrado y no admite más cambios de estado.</p>;
  }

  return (
    <ul className={styles.lista}>
      {transiciones.map((destino) => {
        const accion = ACCION_HACIA_ESTADO[destino];
        const ayudaId = `${baseId}-${getEstadoSlug(destino)}`;

        return (
          <li key={destino}>
            <Button
              variant={destino === ESTADOS.CANCELADO ? "dangerOutline" : "secondary"}
              fullWidth
              loading={estadoEnProceso === destino}
              disabled={Boolean(estadoEnProceso)}
              aria-describedby={ayudaId}
              onClick={() => onCambiarEstado(destino)}
            >
              {accion.label}
            </Button>
            <p id={ayudaId} className={styles.ayuda}>
              {accion.ayuda}
            </p>
          </li>
        );
      })}
    </ul>
  );
}
