import { useId } from "react";
import AlertCircleIcon from "../../assets/icons/alert-circle.svg?react";
import { cx } from "../../utils/classNames.js";
import styles from "./FormField.module.css";

/**
 * Estructura común de un campo: label asociado, texto de ayuda y mensaje de
 * error. `children` es una función que recibe las props de accesibilidad
 * (id, aria-describedby, aria-invalid) para aplicarlas al control real.
 */
export default function FormField({ label, hint, error, className, children }) {
  const id = useId();
  const hintId = `${id}-ayuda`;
  const errorId = `${id}-error`;
  const describedBy = [hint && hintId, error && errorId].filter(Boolean).join(" ") || undefined;

  return (
    <div className={cx(styles.field, className)}>
      <label htmlFor={id} className={styles.label}>
        {label}
      </label>
      {hint && (
        <p id={hintId} className={styles.hint}>
          {hint}
        </p>
      )}
      {children({ id, "aria-describedby": describedBy, "aria-invalid": error ? true : undefined })}
      {error && <FieldError id={errorId}>{error}</FieldError>}
    </div>
  );
}

export function FieldError({ id, children }) {
  return (
    <p id={id} className={styles.error}>
      <AlertCircleIcon className={styles.errorIcon} />
      <span>{children}</span>
    </p>
  );
}
