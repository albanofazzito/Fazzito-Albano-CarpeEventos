import { cx } from "../../utils/classNames.js";
import FormField from "./FormField.jsx";
import styles from "./FormField.module.css";

/** Lista desplegable con label. `options` es un array de { value, label }. */
export default function SelectField({ label, hint, error, options, placeholder, className, ...selectProps }) {
  return (
    <FormField label={label} hint={hint} error={error} className={className}>
      {(accesibilidad) => (
        <select className={cx(styles.control, styles.select)} {...accesibilidad} {...selectProps}>
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      )}
    </FormField>
  );
}
