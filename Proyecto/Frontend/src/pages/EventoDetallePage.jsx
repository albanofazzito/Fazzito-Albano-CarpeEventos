import { useCallback, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import CalendarIcon from "../assets/icons/calendar.svg?react";
import ClockIcon from "../assets/icons/clock.svg?react";
import EditIcon from "../assets/icons/edit.svg?react";
import MailIcon from "../assets/icons/mail.svg?react";
import PhoneIcon from "../assets/icons/phone.svg?react";
import RefreshIcon from "../assets/icons/refresh.svg?react";
import TagIcon from "../assets/icons/tag.svg?react";
import TrashIcon from "../assets/icons/trash.svg?react";
import UsersIcon from "../assets/icons/users.svg?react";
import WhatsappIcon from "../assets/icons/whatsapp.svg?react";
import EliminarEventoDialog from "../components/eventos/EliminarEventoDialog.jsx";
import EstadoActions from "../components/eventos/EstadoActions.jsx";
import EstadoBadge from "../components/eventos/EstadoBadge.jsx";
import EstadoTimeline from "../components/eventos/EstadoTimeline.jsx";
import PageHeader from "../components/layout/PageHeader.jsx";
import PresupuestoCard from "../components/presupuestos/PresupuestoCard.jsx";
import Button from "../components/ui/Button.jsx";
import Card from "../components/ui/Card.jsx";
import ConfirmDialog from "../components/ui/ConfirmDialog.jsx";
import Loader from "../components/ui/Loader.jsx";
import StatusMessage from "../components/ui/StatusMessage.jsx";
import { useAsync } from "../hooks/useAsync.js";
import { useAuth } from "../hooks/useAuth.js";
import { useDocumentTitle } from "../hooks/useDocumentTitle.js";
import { useEliminarEvento } from "../hooks/useEliminarEvento.js";
import { useToast } from "../hooks/useToast.js";
import { cambiarEstadoEvento, getEventoById } from "../services/evento.service.js";
import { aprobarPresupuesto, generarPresupuesto, rechazarPresupuesto } from "../services/presupuesto.service.js";
import { cx } from "../utils/classNames.js";
import { MENSAJE_WHATSAPP_CONSULTA, NEGOCIO } from "../utils/constants.js";
import {
  DESCRIPCION_ESTADO,
  ESTADOS,
  getAccionesDeEstado,
  puedeEditarse,
  puedeEliminarse,
} from "../utils/estados.js";
import {
  formatFechaLarga,
  formatHorario,
  formatInvitados,
  formatNombreCompleto,
  formatPrecio,
} from "../utils/formatters.js";
import { buildTelUrl, buildWhatsAppUrl } from "../utils/links.js";
import { paths } from "../utils/routes.js";
import styles from "./EventoDetallePage.module.css";

const MENSAJE_EXITO_ESTADO = {
  [ESTADOS.CONFIRMADO]: "La fecha quedó reservada para este evento.",
  [ESTADOS.EN_CURSO]: "¡Que empiece la fiesta!",
  [ESTADOS.FINALIZADO]: "El evento quedó guardado en el historial.",
  [ESTADOS.CANCELADO]: "La fecha quedó libre para otras reservas.",
};

/**
 * Detalle de un evento: seguimiento del estado, presupuesto, datos de la
 * reserva y las acciones que permite el rol del usuario.
 */
export default function EventoDetallePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { usuario, esAdmin } = useAuth();

  const cargarDetalle = useCallback(() => getEventoById(id), [id]);
  const { data: evento, loading, error, reload, setData } = useAsync(cargarDetalle);

  const [estadoEnProceso, setEstadoEnProceso] = useState(null);
  const [accionPresupuesto, setAccionPresupuesto] = useState(null);
  const [confirmarCancelacion, setConfirmarCancelacion] = useState(false);
  const [confirmarRechazo, setConfirmarRechazo] = useState(false);
  const eliminacion = useEliminarEvento(() => navigate(paths.eventos));

  useDocumentTitle(evento ? `${evento.servicio?.nombre} · ${formatFechaLarga(evento.fecha)}` : "Detalle del evento");

  async function aplicarCambioEstado(destino) {
    setEstadoEnProceso(destino);
    try {
      const actualizado = await cambiarEstadoEvento(evento.id, destino);
      setData(actualizado);
      toast.success(`Evento ${destino.toLowerCase()}`, MENSAJE_EXITO_ESTADO[destino]);
    } catch (err) {
      toast.error("No se pudo cambiar el estado", err.message);
    } finally {
      setEstadoEnProceso(null);
      setConfirmarCancelacion(false);
    }
  }

  function handleCambiarEstado(destino) {
    // Cancelar no tiene vuelta atrás: se pide confirmación antes.
    if (destino === ESTADOS.CANCELADO) {
      setConfirmarCancelacion(true);
    } else {
      aplicarCambioEstado(destino);
    }
  }

  /**
   * Generar, aprobar o rechazar el presupuesto también cambia el estado del
   * evento, así que después se vuelve a pedir el detalle completo a la API.
   */
  async function operarPresupuesto(tipo, operacion, exito, tituloError) {
    setAccionPresupuesto(tipo);
    try {
      await operacion();
    } catch (err) {
      toast.error(tituloError, err.message);
      setAccionPresupuesto(null);
      setConfirmarRechazo(false);
      return;
    }

    toast.success(...exito);
    try {
      setData(await getEventoById(id));
    } catch {
      reload();
    } finally {
      setAccionPresupuesto(null);
      setConfirmarRechazo(false);
    }
  }

  const generar = () =>
    operarPresupuesto(
      "generar",
      () => generarPresupuesto(evento.id),
      ["Presupuesto generado", "El evento pasó a Presupuestado. Avisale al cliente para que lo revise."],
      "No se pudo generar el presupuesto"
    );

  const aprobar = () =>
    operarPresupuesto(
      "aprobar",
      () => aprobarPresupuesto(evento.presupuesto.id),
      esAdmin
        ? ["Aprobación registrada", "Ya podés confirmar el evento."]
        : ["¡Presupuesto aprobado!", "Ahora el salón confirma tu fecha. Te avisamos por WhatsApp."],
      "No se pudo aprobar el presupuesto"
    );

  const rechazar = () =>
    operarPresupuesto(
      "rechazar",
      () => rechazarPresupuesto(evento.presupuesto.id),
      ["Presupuesto rechazado", "La reserva volvió a Pendiente: se puede modificar y volver a cotizar."],
      "No se pudo rechazar el presupuesto"
    );

  if (loading || error) {
    let titulo = "No pudimos cargar el evento";
    let detalle = error?.message;
    if (error?.status === 404) {
      titulo = "No encontramos este evento";
      detalle = "Puede que se haya eliminado o que el enlace sea incorrecto.";
    }
    if (error?.status === 403) titulo = "No tenés acceso a este evento";

    return (
      <>
        <PageHeader backTo={paths.eventos} backLabel="Volver a eventos" title="Detalle del evento" />
        <div className={cx("container", styles.contenido)}>
          {loading && <Loader label="Cargando el evento…" />}
          {error && (
            <StatusMessage
              tone="error"
              title={titulo}
              action={
                <>
                  <Button to={paths.eventos} variant="outline">
                    Ir al listado
                  </Button>
                  {error.status !== 404 && error.status !== 403 && (
                    <Button icon={RefreshIcon} onClick={reload}>
                      Reintentar
                    </Button>
                  )}
                </>
              }
            >
              {detalle}
            </StatusMessage>
          )}
        </div>
      </>
    );
  }

  const { cliente, servicio, presupuesto } = evento;
  const nombreCliente = formatNombreCompleto(cliente);
  const acciones = getAccionesDeEstado(evento, usuario.rol);

  return (
    <>
      <PageHeader
        backTo={paths.eventos}
        backLabel={esAdmin ? "Volver a eventos" : "Volver a mis eventos"}
        eyebrow={`Evento n.º ${evento.id}`}
        title={servicio?.nombre ?? "Evento"}
        description={`${formatFechaLarga(evento.fecha)} · ${nombreCliente}`}
      >
        <EstadoBadge estado={evento.estado} size="lg" />
      </PageHeader>

      <div className={cx("container", styles.contenido, styles.layout)}>
        <div className={styles.principal}>
          <Card title="Seguimiento de la reserva">
            <EstadoTimeline estado={evento.estado} />
            <p className={styles.descripcionEstado}>
              <strong>{evento.estado}:</strong> {DESCRIPCION_ESTADO[evento.estado]}
            </p>
          </Card>

          <PresupuestoCard
            evento={evento}
            esAdmin={esAdmin}
            accion={accionPresupuesto}
            onGenerar={generar}
            onAprobar={aprobar}
            onRechazar={() => setConfirmarRechazo(true)}
          />

          <Card title="Datos del evento">
            <dl className={styles.datos}>
              <div>
                <dt>
                  <CalendarIcon className={styles.datoIcon} />
                  Fecha
                </dt>
                <dd>{formatFechaLarga(evento.fecha)}</dd>
              </div>
              <div>
                <dt>
                  <ClockIcon className={styles.datoIcon} />
                  Horario
                </dt>
                <dd>{formatHorario(evento.horaInicio, evento.horaFin)}</dd>
              </div>
              <div>
                <dt>
                  <UsersIcon className={styles.datoIcon} />
                  Invitados
                </dt>
                <dd>{formatInvitados(evento.cantidadInvitados)}</dd>
              </div>
              <div>
                <dt>
                  <TagIcon className={styles.datoIcon} />
                  {presupuesto ? "Presupuesto" : "Precio de referencia"}
                </dt>
                <dd>
                  {presupuesto ? (
                    <>
                      {formatPrecio(presupuesto.montoTotal)}
                      <span className={styles.nota}>Estado del presupuesto: {presupuesto.estado}</span>
                    </>
                  ) : (
                    <>
                      Desde {formatPrecio(servicio?.precio ?? 0)}
                      <span className={styles.nota}>El monto final se calcula en el presupuesto.</span>
                    </>
                  )}
                </dd>
              </div>
            </dl>
          </Card>

          {esAdmin ? (
            <Card title="Cliente">
              <p className={styles.clienteNombre}>
                <Link to={paths.cliente(cliente.id)}>{nombreCliente}</Link>
              </p>
              <ul className={styles.contacto}>
                <li>
                  <PhoneIcon className={styles.datoIcon} />
                  <span className="visually-hidden">Teléfono: </span>
                  <a href={buildTelUrl(cliente.telefono)}>{cliente.telefono}</a>
                </li>
                <li>
                  <MailIcon className={styles.datoIcon} />
                  <span className="visually-hidden">Email: </span>
                  <a href={`mailto:${cliente.email}`}>{cliente.email}</a>
                </li>
              </ul>
              <Button
                href={buildWhatsAppUrl(cliente.telefono, `¡Hola, ${cliente.nombre}! Te escribimos de Carpe Eventos por tu reserva.`)}
                external
                variant="outline"
                size="sm"
                icon={WhatsappIcon}
                className={styles.whatsapp}
              >
                Escribirle por WhatsApp
              </Button>
            </Card>
          ) : (
            <Card title="¿Tenés dudas?">
              <p className={styles.nota}>
                Escribinos por WhatsApp y te respondemos de {NEGOCIO.horarioConsultas.dias.toLowerCase()} de{" "}
                {NEGOCIO.horarioConsultas.horas}.
              </p>
              <Button
                href={buildWhatsAppUrl(NEGOCIO.whatsapp, `${MENSAJE_WHATSAPP_CONSULTA} (Reserva n.º ${evento.id})`)}
                external
                variant="outline"
                size="sm"
                icon={WhatsappIcon}
                className={styles.whatsapp}
              >
                Escribir a {NEGOCIO.nombre}
              </Button>
            </Card>
          )}
        </div>

        <aside className={styles.lateral} aria-label="Acciones del evento">
          <Card title={esAdmin ? "Cambiar estado" : "Tu reserva"}>
            <EstadoActions
              acciones={acciones}
              estadoEnProceso={estadoEnProceso}
              onCambiarEstado={handleCambiarEstado}
              sinAccionesTexto="Este evento ya está cerrado y no admite más cambios de estado."
            />
          </Card>

          <Card title="Modificar la reserva">
            <div className={styles.otrasAcciones}>
              {puedeEditarse(evento.estado) ? (
                <Button to={paths.editarEvento(evento.id)} variant="outline" icon={EditIcon} fullWidth>
                  Editar datos
                </Button>
              ) : (
                <p className={styles.nota}>
                  {evento.estado === ESTADOS.CONFIRMADO
                    ? "Un evento confirmado ya no se modifica. Si hace falta cambiarlo, se cancela y se pide uno nuevo."
                    : "Los datos de un evento en curso, finalizado o cancelado ya no se modifican."}
                </p>
              )}

              {esAdmin && puedeEliminarse(evento.estado) && (
                <Button
                  variant="dangerGhost"
                  icon={TrashIcon}
                  fullWidth
                  onClick={() => eliminacion.solicitar(evento)}
                >
                  Eliminar evento
                </Button>
              )}
            </div>
          </Card>
        </aside>
      </div>

      <ConfirmDialog
        open={confirmarCancelacion}
        title={esAdmin ? "¿Cancelar este evento?" : "¿Cancelar tu reserva?"}
        confirmLabel={esAdmin ? "Sí, cancelar evento" : "Sí, cancelar reserva"}
        loading={estadoEnProceso === ESTADOS.CANCELADO}
        onConfirm={() => aplicarCambioEstado(ESTADOS.CANCELADO)}
        onCancel={() => setConfirmarCancelacion(false)}
      >
        <p>
          {esAdmin ? `El evento de ${nombreCliente}` : "Tu evento"} del {formatFechaLarga(evento.fecha).toLowerCase()}{" "}
          va a pasar a estado Cancelado y la fecha va a quedar libre. Después no se puede volver atrás.
        </p>
      </ConfirmDialog>

      <ConfirmDialog
        open={confirmarRechazo}
        title="¿Rechazar el presupuesto?"
        confirmLabel="Sí, rechazar"
        loading={accionPresupuesto === "rechazar"}
        onConfirm={rechazar}
        onCancel={() => setConfirmarRechazo(false)}
      >
        <p>
          La reserva vuelve a estado Pendiente. Después se puede modificar (por ejemplo, la cantidad de invitados) para
          recibir un presupuesto nuevo, o cancelar.
        </p>
      </ConfirmDialog>

      <EliminarEventoDialog {...eliminacion.dialogProps} />
    </>
  );
}
