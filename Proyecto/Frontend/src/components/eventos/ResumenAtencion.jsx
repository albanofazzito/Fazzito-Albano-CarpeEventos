import ArrowRightIcon from "../../assets/icons/arrow-right.svg?react";
import { ESTADOS } from "../../utils/estados.js";
import { ESTADOS_PRESUPUESTO } from "../../utils/presupuestos.js";
import styles from "./ResumenAtencion.module.css";

const esperandoRespuesta = (evento) =>
  evento.estado === ESTADOS.PRESUPUESTADO && evento.presupuesto?.estado === ESTADOS_PRESUPUESTO.PENDIENTE;
const listoParaConfirmar = (evento) =>
  evento.estado === ESTADOS.PRESUPUESTADO && evento.presupuesto?.estado === ESTADOS_PRESUPUESTO.APROBADO;

const plural = (cantidad, singular, varios) => `${cantidad} ${cantidad === 1 ? singular : varios}`;

/**
 * Lo que hay que atender en el panel: el administrador ve qué solicitudes
 * esperan presupuesto y cuáles ya se pueden confirmar; el cliente, qué
 * presupuestos tiene para revisar. Cada aviso filtra el listado.
 */
export default function ResumenAtencion({ eventos, esAdmin, onFiltrar }) {
  const pendientes = eventos.filter((evento) => evento.estado === ESTADOS.PENDIENTE).length;
  const paraResponder = eventos.filter(esperandoRespuesta).length;
  const paraConfirmar = eventos.filter(listoParaConfirmar).length;

  const avisos = esAdmin
    ? [
        {
          cantidad: pendientes,
          texto: plural(pendientes, "solicitud espera presupuesto", "solicitudes esperan presupuesto"),
          estado: ESTADOS.PENDIENTE,
        },
        {
          cantidad: paraConfirmar,
          texto: plural(paraConfirmar, "presupuesto aprobado, listo para confirmar", "presupuestos aprobados, listos para confirmar"),
          estado: ESTADOS.PRESUPUESTADO,
        },
        {
          cantidad: paraResponder,
          texto: plural(paraResponder, "presupuesto espera respuesta del cliente", "presupuestos esperan respuesta del cliente"),
          estado: ESTADOS.PRESUPUESTADO,
        },
      ]
    : [
        {
          cantidad: paraResponder,
          texto: plural(paraResponder, "presupuesto para revisar", "presupuestos para revisar"),
          estado: ESTADOS.PRESUPUESTADO,
        },
        {
          cantidad: pendientes,
          texto: plural(pendientes, "solicitud esperando presupuesto", "solicitudes esperando presupuesto"),
          estado: ESTADOS.PENDIENTE,
        },
      ];

  const visibles = avisos.filter((aviso) => aviso.cantidad > 0);
  if (visibles.length === 0) return null;

  return (
    <section className={styles.resumen} aria-labelledby="resumen-atencion">
      <h2 id="resumen-atencion" className={styles.titulo}>
        {esAdmin ? "Para atender" : "Novedades de tus reservas"}
      </h2>
      <ul className={styles.lista}>
        {visibles.map((aviso) => (
          <li key={aviso.texto}>
            <button type="button" className={styles.aviso} onClick={() => onFiltrar(aviso.estado)}>
              <span>{aviso.texto}</span>
              <ArrowRightIcon className={styles.icon} />
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
