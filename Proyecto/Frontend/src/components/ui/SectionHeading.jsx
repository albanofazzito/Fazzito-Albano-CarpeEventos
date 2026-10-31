import { cx } from "../../utils/classNames.js";
import styles from "./SectionHeading.module.css";

/** Encabezado de las secciones de la landing: antetítulo, título, bajada y filete dorado. */
export default function SectionHeading({ id, eyebrow, title, subtitle, align = "center" }) {
  return (
    <header className={cx(styles.heading, styles[align])}>
      {eyebrow && <p className={styles.eyebrow}>{eyebrow}</p>}
      <h2 id={id} className={styles.title}>
        {title}
      </h2>
      {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
      <span className={styles.rule} aria-hidden="true" />
    </header>
  );
}
