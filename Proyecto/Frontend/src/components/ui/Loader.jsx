import { cx } from "../../utils/classNames.js";
import styles from "./Loader.module.css";

/** Indicador de carga con texto visible; role="status" lo anuncia en lectores de pantalla. */
export default function Loader({ label = "Cargando…", className }) {
  return (
    <div className={cx(styles.loader, className)} role="status">
      <span className={styles.spinner} aria-hidden="true" />
      <span>{label}</span>
    </div>
  );
}
