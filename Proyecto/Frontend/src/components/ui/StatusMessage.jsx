import AlertCircleIcon from "../../assets/icons/alert-circle.svg?react";
import CalendarIcon from "../../assets/icons/calendar.svg?react";
import InfoIcon from "../../assets/icons/info.svg?react";
import { cx } from "../../utils/classNames.js";
import styles from "./StatusMessage.module.css";

const ICONOS = {
  error: AlertCircleIcon,
  empty: CalendarIcon,
  info: InfoIcon,
};

/**
 * Bloque para estados sin contenido: error al cargar, listado vacío o un
 * aviso. Siempre explica qué pasó y, si se puede, ofrece una acción.
 */
export default function StatusMessage({ tone = "info", title, children, action, headingLevel = 2, className }) {
  const Heading = `h${headingLevel}`;
  const Icon = ICONOS[tone] ?? InfoIcon;

  return (
    <div className={cx(styles.status, styles[tone], className)} role={tone === "error" ? "alert" : undefined}>
      <span className={styles.iconWrapper}>
        <Icon className={styles.icon} />
      </span>
      <Heading className={styles.title}>{title}</Heading>
      {children && <div className={styles.description}>{children}</div>}
      {action && <div className={styles.action}>{action}</div>}
    </div>
  );
}
