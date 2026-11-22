import { cx } from "../../utils/classNames.js";
import { getCalendarWeeks } from "../../utils/dates.js";
import { formatFechaLarga, formatMes } from "../../utils/formatters.js";
import styles from "./CalendarioMes.module.css";

const DIAS_SEMANA = [
  { corto: "Lun", largo: "lunes" },
  { corto: "Mar", largo: "martes" },
  { corto: "Mié", largo: "miércoles" },
  { corto: "Jue", largo: "jueves" },
  { corto: "Vie", largo: "viernes" },
  { corto: "Sáb", largo: "sábado" },
  { corto: "Dom", largo: "domingo" },
];

function describirDia(cantidad, pasado) {
  if (pasado) return "fecha pasada";
  if (cantidad === 0) return "libre";
  return cantidad === 1 ? "1 evento confirmado" : `${cantidad} eventos confirmados`;
}

/**
 * Calendario de un mes. Cada día es un botón que indica si está libre o si
 * ya tiene eventos confirmados (`diasOcupados` viene de /api/salon/disponibilidad).
 * Los días pasados se muestran deshabilitados.
 */
export default function CalendarioMes({ mes, diasOcupados, seleccionada, hoy, onSeleccionar }) {
  const franjasPorFecha = new Map(diasOcupados.map((dia) => [dia.fecha, dia.franjas]));

  return (
    <table className={styles.calendario}>
      <caption className="visually-hidden">{formatMes(mes)}</caption>
      <thead>
        <tr>
          {DIAS_SEMANA.map((dia) => (
            <th key={dia.corto} scope="col" abbr={dia.largo}>
              {dia.corto}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {getCalendarWeeks(mes).map((semana) => (
          <tr key={semana.find(Boolean)}>
            {semana.map((fecha, indice) => {
              // Días de relleno antes del 1 y después del último día del mes.
              if (!fecha) return <td key={`vacio-${indice}`} aria-hidden="true" />;

              const cantidad = franjasPorFecha.get(fecha)?.length ?? 0;
              const pasado = fecha < hoy;
              let estado = "libre";
              if (cantidad > 0) estado = "ocupado";
              if (pasado) estado = "pasado";

              return (
                <td key={fecha}>
                  <button
                    type="button"
                    className={cx(
                      styles.dia,
                      styles[estado],
                      fecha === hoy && styles.hoy,
                      fecha === seleccionada && styles.seleccionado
                    )}
                    disabled={pasado}
                    aria-pressed={fecha === seleccionada}
                    aria-label={`${formatFechaLarga(fecha)}: ${describirDia(cantidad, pasado)}`}
                    onClick={() => onSeleccionar(fecha)}
                  >
                    <span className={styles.numero}>{Number(fecha.slice(8))}</span>
                    {!pasado && (
                      <span className={styles.marca}>
                        {cantidad === 0 && "Libre"}
                        {cantidad === 1 && "1 evento"}
                        {cantidad > 1 && `${cantidad} eventos`}
                      </span>
                    )}
                  </button>
                </td>
              );
            })}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
