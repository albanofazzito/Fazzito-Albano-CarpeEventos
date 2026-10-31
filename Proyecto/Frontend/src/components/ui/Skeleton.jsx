import { cx } from "../../utils/classNames.js";
import styles from "./Skeleton.module.css";

/** Bloque gris animado que ocupa el lugar del contenido mientras carga. */
export default function Skeleton({ width = "100%", height = "1rem", className }) {
  return <span className={cx(styles.skeleton, className)} style={{ width, height }} aria-hidden="true" />;
}
