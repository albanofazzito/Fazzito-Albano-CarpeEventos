import { cx } from "../../utils/classNames.js";
import { getEstadoSlug } from "../../utils/estados.js";
import styles from "./EstadoBadge.module.css";

/** Etiqueta de estado. Cada estado tiene su color, pero el nombre siempre está escrito. */
export default function EstadoBadge({ estado, size = "md" }) {
  return (
    <span className={cx(styles.badge, styles[getEstadoSlug(estado)], styles[size])}>
      <span className={styles.dot} aria-hidden="true" />
      <span className="visually-hidden">Estado: </span>
      {estado}
    </span>
  );
}
