import { useCallback } from "react";
import CheckCircleIcon from "../../assets/icons/check-circle.svg?react";
import ClockIcon from "../../assets/icons/clock.svg?react";
import { useAsync } from "../../hooks/useAsync.js";
import { getDisponibilidad } from "../../services/salon.service.js";
import { cx } from "../../utils/classNames.js";
import { getMonthOf, rangesOverlap } from "../../utils/dates.js";
import { formatHorario } from "../../utils/formatters.js";
import styles from "./DisponibilidadDelDia.module.css";

/**
 * Debajo de la fecha del formulario: muestra qué franjas de ese día ya
 * están tomadas por eventos confirmados (dato de /api/salon/disponibilidad)
 * y avisa si el horario elegido se superpone. La API vuelve a verificarlo
 * al guardar.
 */
export default function DisponibilidadDelDia({ fecha, horaInicio, horaFin }) {
  const mes = getMonthOf(fecha);
  const cargar = useCallback(() => getDisponibilidad(mes), [mes]);
  const { data, loading, error } = useAsync(cargar);

  const franjas = data?.dias.find((dia) => dia.fecha === fecha)?.franjas ?? [];
  const horarioCompleto = horaInicio && horaFin && horaFin > horaInicio;
  const seSuperpone =
    horarioCompleto && franjas.some((franja) => rangesOverlap(horaInicio, horaFin, franja.horaInicio, franja.horaFin));

  let tono = "libre";
  if (franjas.length > 0) tono = "parcial";
  if (seSuperpone) tono = "ocupado";

  return (
    <div className={cx(styles.caja, data && styles[tono])} aria-live="polite">
      {loading && <p>Consultando la disponibilidad de ese día…</p>}

      {error && <p>No pudimos consultar la disponibilidad. Igual la verificamos cuando envíes la solicitud.</p>}

      {data && franjas.length === 0 && (
        <p className={styles.titulo}>
          <CheckCircleIcon className={styles.icon} />
          ¡Ese día el salón está libre!
        </p>
      )}

      {data && franjas.length > 0 && (
        <>
          <p className={styles.titulo}>
            <ClockIcon className={styles.icon} />
            Ese día ya hay {franjas.length === 1 ? "un evento confirmado" : "eventos confirmados"}:
          </p>
          <ul className={styles.franjas}>
            {franjas.map((franja) => (
              <li key={franja.horaInicio}>Ocupado de {formatHorario(franja.horaInicio, franja.horaFin)}</li>
            ))}
          </ul>
          <p className={styles.nota}>
            {seSuperpone
              ? "El horario que elegiste se superpone: probá con otro horario u otra fecha."
              : "Podés pedir otro horario que no se superponga."}
          </p>
        </>
      )}
    </div>
  );
}
