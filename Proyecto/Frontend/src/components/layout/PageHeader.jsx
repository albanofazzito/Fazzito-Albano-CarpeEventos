import { Link } from "react-router";
import ArrowLeftIcon from "../../assets/icons/arrow-left.svg?react";
import { cx } from "../../utils/classNames.js";
import styles from "./PageHeader.module.css";

/**
 * Encabezado borgoña de las pantallas internas. Sigue la misma idea que las
 * franjas de título del boceto: fondo de color principal y título en Playfair.
 */
export default function PageHeader({ eyebrow, title, description, backTo, backLabel, actions, children }) {
  return (
    <header className={cx(styles.header, "surface-dark")}>
      <div className={cx("container", styles.inner)}>
        {backTo && (
          <Link to={backTo} className={styles.back}>
            <ArrowLeftIcon className={styles.backIcon} />
            {backLabel}
          </Link>
        )}
        <div className={styles.row}>
          <div className={styles.text}>
            {eyebrow && <p className={styles.eyebrow}>{eyebrow}</p>}
            <h1 className={styles.title}>{title}</h1>
            {description && <p className={styles.description}>{description}</p>}
            {children}
          </div>
          {actions && <div className={styles.actions}>{actions}</div>}
        </div>
      </div>
    </header>
  );
}
