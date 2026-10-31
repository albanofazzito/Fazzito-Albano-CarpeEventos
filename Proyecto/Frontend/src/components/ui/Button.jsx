import { Link } from "react-router";
import { cx } from "../../utils/classNames.js";
import styles from "./Button.module.css";

/**
 * Botón de toda la app. Según las props se renderiza como:
 *   - `to`   -> <Link> (navegación interna)
 *   - `href` -> <a> (enlaces externos, por ejemplo WhatsApp)
 *   - nada   -> <button>
 *
 * Variantes: primary (dorado, reservado para las llamadas a la acción, como
 * pide la identidad visual), secondary (borgoña), outline, ghost, danger y
 * dangerGhost.
 */
export default function Button({
  variant = "primary",
  size = "md",
  icon: Icon,
  iconPosition = "start",
  loading = false,
  fullWidth = false,
  to,
  href,
  external = false,
  type = "button",
  disabled,
  className,
  children,
  ...props
}) {
  const classes = cx(styles.button, styles[variant], styles[size], fullWidth && styles.fullWidth, className);

  const content = (
    <>
      {loading && <span className={styles.spinner} aria-hidden="true" />}
      {!loading && Icon && iconPosition === "start" && <Icon className={styles.icon} />}
      {children && <span>{children}</span>}
      {!loading && Icon && iconPosition === "end" && <Icon className={styles.icon} />}
    </>
  );

  if (to) {
    return (
      <Link to={to} className={classes} {...props}>
        {content}
      </Link>
    );
  }

  if (href) {
    return (
      <a href={href} className={classes} {...(external && { target: "_blank", rel: "noopener noreferrer" })} {...props}>
        {content}
        {external && <span className="visually-hidden"> (se abre en una pestaña nueva)</span>}
      </a>
    );
  }

  return (
    <button type={type} className={classes} disabled={disabled || loading} aria-busy={loading || undefined} {...props}>
      {content}
    </button>
  );
}
