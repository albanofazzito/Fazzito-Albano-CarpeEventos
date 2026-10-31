import { cx } from "../../utils/classNames.js";
import { LISTA_ESTADOS } from "../../utils/estados.js";
import styles from "./EstadoFilter.module.css";

/** Botones para filtrar el listado por estado, con la cantidad de eventos de cada uno. */
export default function EstadoFilter({ value, onChange, conteo, total }) {
  const opciones = [
    { estado: "", label: "Todos", cantidad: total },
    ...LISTA_ESTADOS.map((estado) => ({ estado, label: estado, cantidad: conteo[estado] ?? 0 })),
  ];

  return (
    <div className={styles.filtro} role="group" aria-label="Filtrar eventos por estado">
      {opciones.map((opcion) => (
        <button
          key={opcion.label}
          type="button"
          className={cx(styles.opcion, opcion.cantidad === 0 && styles.vacia)}
          aria-pressed={value === opcion.estado}
          onClick={() => onChange(opcion.estado)}
        >
          {opcion.label}
          <span className={styles.cantidad}>
            {opcion.cantidad}
            <span className="visually-hidden"> {opcion.cantidad === 1 ? "evento" : "eventos"}</span>
          </span>
        </button>
      ))}
    </div>
  );
}
