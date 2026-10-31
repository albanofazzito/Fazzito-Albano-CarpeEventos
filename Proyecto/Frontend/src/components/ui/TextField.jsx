import FormField from "./FormField.jsx";
import styles from "./FormField.module.css";

/** Campo de texto, número, fecha u hora con su label y mensajes. */
export default function TextField({ label, hint, error, className, ...inputProps }) {
  return (
    <FormField label={label} hint={hint} error={error} className={className}>
      {(accesibilidad) => <input className={styles.control} {...accesibilidad} {...inputProps} />}
    </FormField>
  );
}
