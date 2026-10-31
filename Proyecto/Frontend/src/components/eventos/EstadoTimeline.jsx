import CheckIcon from "../../assets/icons/check.svg?react";
import XIcon from "../../assets/icons/x.svg?react";
import { cx } from "../../utils/classNames.js";
import { ESTADOS, FLUJO_PRINCIPAL } from "../../utils/estados.js";
import styles from "./EstadoTimeline.module.css";

/** Recorrido del evento (Pendiente → … → Finalizado) marcando en qué paso está. */
export default function EstadoTimeline({ estado }) {
  if (estado === ESTADOS.CANCELADO) {
    return (
      <p className={styles.cancelado}>
        <XIcon className={styles.canceladoIcon} />
        Este evento fue cancelado, por eso ya no avanza por las etapas de la reserva.
      </p>
    );
  }

  const indiceActual = FLUJO_PRINCIPAL.indexOf(estado);

  return (
    <ol className={styles.timeline}>
      {FLUJO_PRINCIPAL.map((paso, indice) => {
        const completado = indice < indiceActual;
        const actual = indice === indiceActual;
        let situacion = "por venir";
        if (completado) situacion = "completado";
        if (actual) situacion = "estado actual";

        return (
          <li
            key={paso}
            className={cx(styles.paso, completado && styles.completado, actual && styles.actual)}
            aria-current={actual ? "step" : undefined}
          >
            <span className={styles.marcador} aria-hidden="true">
              {completado ? <CheckIcon /> : indice + 1}
            </span>
            <span className={styles.nombre}>
              {paso}
              <span className="visually-hidden"> ({situacion})</span>
            </span>
          </li>
        );
      })}
    </ol>
  );
}
