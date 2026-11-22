import { cx } from "../../utils/classNames.js";
import FormField from "./FormField.jsx";
import styles from "./FormField.module.css";

/** Campo de texto de varias líneas con su label y mensajes. */
export default function TextAreaField({ label, hint, error, className, ...textareaProps }) {
  return (
    <FormField label={label} hint={hint} error={error} className={className}>
      {(accesibilidad) => <textarea className={cx(styles.control, styles.textarea)} rows={3} {...accesibilidad} {...textareaProps} />}
    </FormField>
  );
}
