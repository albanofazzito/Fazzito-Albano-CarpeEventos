import { useId } from "react";
import { ESTADOS, getEstadoSlug } from "../../utils/estados.js";
import Button from "../ui/Button.jsx";
import styles from "./EstadoActions.module.css";

/**
 * Botones para cambiar el estado del evento. Recibe las acciones que
 * permite el rol del usuario (getAccionesDeEstado); las que todavía no se
 * pueden usar aparecen deshabilitadas con el motivo debajo.
 */
export default function EstadoActions({ acciones, estadoEnProceso, onCambiarEstado, sinAccionesTexto }) {
  const baseId = useId();

  if (acciones.length === 0) {
    return <p className={styles.vacio}>{sinAccionesTexto}</p>;
  }

  return (
    <ul className={styles.lista}>
      {acciones.map((accion) => {
        const ayudaId = `${baseId}-${getEstadoSlug(accion.destino)}`;

        return (
          <li key={accion.destino}>
            <Button
              variant={accion.destino === ESTADOS.CANCELADO ? "dangerOutline" : "secondary"}
              fullWidth
              loading={estadoEnProceso === accion.destino}
              disabled={Boolean(estadoEnProceso) || Boolean(accion.motivoBloqueo)}
              aria-describedby={ayudaId}
              onClick={() => onCambiarEstado(accion.destino)}
            >
              {accion.label}
            </Button>
            <p id={ayudaId} className={styles.ayuda}>
              {accion.motivoBloqueo ? <strong className={styles.bloqueo}>{accion.motivoBloqueo}</strong> : accion.ayuda}
            </p>
          </li>
        );
      })}
    </ul>
  );
}
