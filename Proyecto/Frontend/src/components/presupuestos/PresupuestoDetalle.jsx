import { formatPrecio } from "../../utils/formatters.js";
import styles from "./PresupuestoDetalle.module.css";

/** Renglones del presupuesto tal como los calculó la API, con el total al pie. */
export default function PresupuestoDetalle({ presupuesto }) {
  return (
    <table className={styles.tabla}>
      <caption className="visually-hidden">Detalle del presupuesto</caption>
      <thead>
        <tr>
          <th scope="col">Concepto</th>
          <th scope="col" className={styles.numero}>
            Cantidad
          </th>
          <th scope="col" className={styles.numero}>
            Precio unitario
          </th>
          <th scope="col" className={styles.numero}>
            Subtotal
          </th>
        </tr>
      </thead>
      <tbody>
        {presupuesto.detalle.map((item) => (
          <tr key={item.concepto}>
            <td>{item.concepto}</td>
            <td className={styles.numero}>{item.cantidad}</td>
            <td className={styles.numero}>{formatPrecio(item.precioUnitario)}</td>
            <td className={styles.numero}>{formatPrecio(item.subtotal)}</td>
          </tr>
        ))}
      </tbody>
      <tfoot>
        <tr>
          <th scope="row" colSpan={3}>
            Total
          </th>
          <td className={styles.numero}>{formatPrecio(presupuesto.montoTotal)}</td>
        </tr>
      </tfoot>
    </table>
  );
}
