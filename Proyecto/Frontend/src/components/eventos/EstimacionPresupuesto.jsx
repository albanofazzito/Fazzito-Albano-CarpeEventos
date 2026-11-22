import { useCallback, useId } from "react";
import { useAsync } from "../../hooks/useAsync.js";
import { useDebouncedValue } from "../../hooks/useDebouncedValue.js";
import { estimarPresupuesto } from "../../services/presupuesto.service.js";
import { formatPrecio } from "../../utils/formatters.js";
import styles from "./EstimacionPresupuesto.module.css";

/**
 * Cotización orientativa mientras se completa el formulario. El cálculo lo
 * hace la API (/api/presupuestos/estimacion) con la misma regla que usa para
 * el presupuesto real, así el número que ve el cliente es el que va a recibir.
 */
export default function EstimacionPresupuesto({ servicioId, cantidadInvitados }) {
  // Se espera a que el usuario deje de escribir para no pedir una estimación por tecla.
  const servicio = useDebouncedValue(Number(servicioId));
  const invitados = useDebouncedValue(Number(cantidadInvitados));

  const cargar = useCallback(
    () => estimarPresupuesto({ servicioId: servicio, cantidadInvitados: invitados }),
    [servicio, invitados]
  );
  const { data, loading, error } = useAsync(cargar);
  const tituloId = useId();

  return (
    <section className={styles.caja} aria-labelledby={tituloId} aria-live="polite" aria-busy={loading}>
      <h2 id={tituloId} className={styles.titulo}>
        Presupuesto estimado
      </h2>

      {loading && <p className={styles.calculando}>Calculando…</p>}
      {error && <p className={styles.nota}>{error.message}</p>}

      {data && (
        <>
          <p className={styles.total}>{formatPrecio(data.montoTotal)}</p>
          <ul className={styles.detalle}>
            {data.detalle.map((item) => (
              <li key={item.concepto}>
                <span>
                  {item.concepto}
                  {item.cantidad > 1 && ` × ${item.cantidad}`}
                </span>
                <span>{formatPrecio(item.subtotal)}</span>
              </li>
            ))}
          </ul>
          <p className={styles.nota}>
            Es el mismo cálculo del presupuesto final, que el salón te envía después de revisar la solicitud.
          </p>
        </>
      )}
    </section>
  );
}
