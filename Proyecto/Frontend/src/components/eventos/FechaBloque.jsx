import { cx } from "../../utils/classNames.js";
import { formatFechaLarga, getPartesFecha } from "../../utils/formatters.js";
import styles from "./FechaBloque.module.css";

/** Fecha en formato "agenda" (día de la semana, número y mes). El lector de pantalla lee la fecha completa. */
export default function FechaBloque({ fecha, className }) {
  const { dia, mes, diaSemana } = getPartesFecha(fecha);

  return (
    <time dateTime={fecha} className={cx(styles.bloque, className)}>
      <span className={styles.partes} aria-hidden="true">
        <span className={styles.diaSemana}>{diaSemana}</span>
        <span className={styles.dia}>{dia}</span>
        <span className={styles.mes}>{mes}</span>
      </span>
      <span className="visually-hidden">{formatFechaLarga(fecha)}</span>
    </time>
  );
}
