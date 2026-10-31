import { useId } from "react";
import { cx } from "../../utils/classNames.js";
import { formatPrecio } from "../../utils/formatters.js";
import ServicioIcon from "../servicios/ServicioIcon.jsx";
import { FieldError } from "../ui/FormField.jsx";
import styles from "./ServicioPicker.module.css";

/** Selector de tipo de evento: un grupo de radio buttons presentado como tarjetas. */
export default function ServicioPicker({ servicios, name, value, error, onChange, onBlur }) {
  const errorId = useId();

  return (
    <fieldset className={styles.fieldset}>
      <legend className={styles.legend}>Tipo de evento</legend>
      <div className={styles.opciones}>
        {servicios.map((servicio) => {
          const seleccionado = value === String(servicio.id);

          return (
            <label key={servicio.id} className={cx(styles.opcion, seleccionado && styles.seleccionada)}>
              <input
                type="radio"
                name={name}
                value={servicio.id}
                checked={seleccionado}
                onChange={onChange}
                onBlur={onBlur}
                className={styles.radio}
                aria-describedby={error ? errorId : undefined}
              />
              <ServicioIcon categoria={servicio.categoria} className={styles.icon} />
              <span className={styles.texto}>
                <span className={styles.nombre}>{servicio.nombre}</span>
                <span className={styles.precio}>Desde {formatPrecio(servicio.precio)}</span>
              </span>
            </label>
          );
        })}
      </div>
      {error && <FieldError id={errorId}>{error}</FieldError>}
    </fieldset>
  );
}
