import FileTextIcon from "../../assets/icons/file-text.svg?react";
import PrinterIcon from "../../assets/icons/printer.svg?react";
import { ESTADOS } from "../../utils/estados.js";
import { ESTADOS_PRESUPUESTO } from "../../utils/presupuestos.js";
import { formatFechaCorta, formatFechaLarga, formatNombreCompleto } from "../../utils/formatters.js";
import { NEGOCIO } from "../../utils/constants.js";
import EstadoBadge from "../eventos/EstadoBadge.jsx";
import Button from "../ui/Button.jsx";
import Card from "../ui/Card.jsx";
import PresupuestoDetalle from "./PresupuestoDetalle.jsx";
import styles from "./PresupuestoCard.module.css";

/**
 * Presupuesto del evento en el detalle. Qué acciones aparecen depende del
 * rol y del momento del flujo:
 *  - Evento Pendiente sin presupuesto: el administrador lo genera.
 *  - Presupuesto Pendiente: el cliente lo aprueba o rechaza (el
 *    administrador también puede registrar la respuesta si llegó por WhatsApp).
 *  - Presupuesto Rechazado: el administrador puede generar uno nuevo.
 * `accion` indica qué operación está en curso, para mostrar la carga.
 */
export default function PresupuestoCard({ evento, esAdmin, accion, onGenerar, onAprobar, onRechazar }) {
  const { presupuesto } = evento;
  const ocupado = Boolean(accion);
  const esperandoRespuesta =
    presupuesto?.estado === ESTADOS_PRESUPUESTO.PENDIENTE && evento.estado === ESTADOS.PRESUPUESTADO;
  const puedeGenerar = esAdmin && evento.estado === ESTADOS.PENDIENTE;

  const botonGenerar = puedeGenerar && (
    <Button icon={FileTextIcon} loading={accion === "generar"} disabled={ocupado} onClick={onGenerar}>
      {presupuesto ? "Generar nuevo presupuesto" : "Generar presupuesto"}
    </Button>
  );

  if (!presupuesto) {
    return (
      <Card title="Presupuesto">
        {evento.estado === ESTADOS.PENDIENTE ? (
          <div className={styles.vacio}>
            <p>
              {esAdmin
                ? "Todavía no se generó. El monto se calcula solo, con el servicio elegido y la cantidad de invitados."
                : "Estamos preparando tu presupuesto. Cuando esté listo lo vas a ver acá para aprobarlo."}
            </p>
            {botonGenerar}
          </div>
        ) : (
          <p className={styles.vacio}>Este evento no llegó a tener presupuesto.</p>
        )}
      </Card>
    );
  }

  return (
    <Card
      title="Presupuesto"
      className="area-impresion"
      actions={<EstadoBadge estado={presupuesto.estado} />}
    >
      {/* Encabezado que solo aparece al imprimir o guardar como PDF. */}
      <div className={styles.soloImpresion}>
        <p className={styles.impresionMarca}>{NEGOCIO.nombre}</p>
        <p>
          Presupuesto n.º {presupuesto.id} · {evento.servicio?.nombre} para {formatNombreCompleto(evento.cliente)}
        </p>
        <p>
          {formatFechaLarga(evento.fecha)}, de {evento.horaInicio} a {evento.horaFin} h · {evento.cantidadInvitados}{" "}
          invitados
        </p>
      </div>

      <p className={styles.emision}>Emitido el {formatFechaCorta(presupuesto.fechaEmision)}</p>
      <PresupuestoDetalle presupuesto={presupuesto} />

      <div className={styles.respuesta}>
        {esperandoRespuesta && (
          <>
            <p>
              {esAdmin
                ? "Esperando la respuesta del cliente. Si te contestó por WhatsApp, podés registrarla acá."
                : "Revisalo y contanos si te sirve. Cuando lo apruebes, el salón confirma tu fecha."}
            </p>
            <div className={styles.botones}>
              <Button
                variant={esAdmin ? "secondary" : "primary"}
                loading={accion === "aprobar"}
                disabled={ocupado}
                onClick={onAprobar}
              >
                {esAdmin ? "Registrar aprobación" : "Aprobar presupuesto"}
              </Button>
              <Button variant="dangerOutline" loading={accion === "rechazar"} disabled={ocupado} onClick={onRechazar}>
                {esAdmin ? "Registrar rechazo" : "Rechazar"}
              </Button>
            </div>
          </>
        )}

        {presupuesto.estado === ESTADOS_PRESUPUESTO.APROBADO && (
          <p>
            Aprobado el {formatFechaCorta(presupuesto.fechaRespuesta)}.
            {evento.estado === ESTADOS.PRESUPUESTADO &&
              (esAdmin ? " Ya podés confirmar el evento." : " Falta que el salón confirme la fecha.")}
          </p>
        )}

        {presupuesto.estado === ESTADOS_PRESUPUESTO.RECHAZADO && (
          <>
            <p>Rechazado el {formatFechaCorta(presupuesto.fechaRespuesta)}.</p>
            {evento.estado === ESTADOS.PENDIENTE && (
              <p>
                {esAdmin
                  ? "Si el cliente modificó la reserva, generá un presupuesto nuevo con los datos actualizados."
                  : "Podés modificar la reserva (por ejemplo, la cantidad de invitados) para recibir uno nuevo, o cancelarla."}
              </p>
            )}
            {botonGenerar}
          </>
        )}

        {presupuesto.estado === ESTADOS_PRESUPUESTO.PENDIENTE && evento.estado === ESTADOS.CANCELADO && (
          <p>El evento se canceló antes de que se respondiera este presupuesto.</p>
        )}
      </div>

      <Button variant="ghost" size="sm" icon={PrinterIcon} className={styles.imprimir} onClick={() => window.print()}>
        Imprimir o guardar como PDF
      </Button>
    </Card>
  );
}
