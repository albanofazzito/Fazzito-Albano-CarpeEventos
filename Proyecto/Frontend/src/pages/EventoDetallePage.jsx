import { useCallback, useState } from "react";
import { useNavigate, useParams } from "react-router";
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
import Button from "../components/ui/Button.jsx";
import Card from "../components/ui/Card.jsx";
import ConfirmDialog from "../components/ui/ConfirmDialog.jsx";
import Loader from "../components/ui/Loader.jsx";
import StatusMessage from "../components/ui/StatusMessage.jsx";
import { useAsync } from "../hooks/useAsync.js";
import { useDocumentTitle } from "../hooks/useDocumentTitle.js";
import { useEliminarEvento } from "../hooks/useEliminarEvento.js";
import { useToast } from "../hooks/useToast.js";
import { getClienteById } from "../services/cliente.service.js";
import { cambiarEstadoEvento, getEventoById } from "../services/evento.service.js";
import { getServicioById } from "../services/servicio.service.js";
import { cx } from "../utils/classNames.js";
import { DESCRIPCION_ESTADO, ESTADOS, puedeEditarse, puedeEliminarse } from "../utils/estados.js";
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

/** Detalle de un evento: datos, cliente, seguimiento del estado y acciones. */
export default function EventoDetallePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const cargarDetalle = useCallback(async () => {
    const evento = await getEventoById(id);
    const [cliente, servicio] = await Promise.all([
      getClienteById(evento.clienteId),
      getServicioById(evento.servicioId),
    ]);
    return { evento, cliente, servicio };
  }, [id]);

  const { data, loading, error, reload, setData } = useAsync(cargarDetalle);
  const [estadoEnProceso, setEstadoEnProceso] = useState(null);
  const [confirmarCancelacion, setConfirmarCancelacion] = useState(false);
  const eliminacion = useEliminarEvento(() => navigate(paths.eventos));

  useDocumentTitle(data ? `${data.servicio.nombre} · ${formatFechaLarga(data.evento.fecha)}` : "Detalle del evento");

  async function aplicarCambioEstado(destino) {
    setEstadoEnProceso(destino);
    try {
      const actualizado = await cambiarEstadoEvento(data.evento.id, destino);
      setData((actual) => ({ ...actual, evento: actualizado }));
      toast.success("Estado actualizado", `El evento ahora está ${destino.toLowerCase()}.`);
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

  if (loading || error) {
    const noExiste = error?.status === 404;

    return (
      <>
        <PageHeader backTo={paths.eventos} backLabel="Volver a eventos" title="Detalle del evento" />
        <div className={cx("container", styles.contenido)}>
          {loading && <Loader label="Cargando el evento…" />}
          {error && (
            <StatusMessage
              tone="error"
              title={noExiste ? "No encontramos este evento" : "No pudimos cargar el evento"}
              action={
                <>
                  <Button to={paths.eventos} variant="outline">
                    Ir al listado
                  </Button>
                  {!noExiste && (
                    <Button icon={RefreshIcon} onClick={reload}>
                      Reintentar
                    </Button>
                  )}
                </>
              }
            >
              {noExiste ? "Puede que se haya eliminado o que el enlace sea incorrecto." : error.message}
            </StatusMessage>
          )}
        </div>
      </>
    );
  }

  const { evento, cliente, servicio } = data;
  const nombreCliente = formatNombreCompleto(cliente);
  const eventoCompleto = { ...evento, cliente, servicio };

  return (
    <>
      <PageHeader
        backTo={paths.eventos}
        backLabel="Volver a eventos"
        eyebrow={`Evento n.º ${evento.id}`}
        title={servicio.nombre}
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
                  Precio de referencia
                </dt>
                <dd>
                  Desde {formatPrecio(servicio.precio)}
                  <span className={styles.nota}>El monto final se define en el presupuesto.</span>
                </dd>
              </div>
            </dl>
          </Card>

          <Card title="Cliente">
            <p className={styles.clienteNombre}>{nombreCliente}</p>
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
        </div>

        <aside className={styles.lateral} aria-label="Acciones del evento">
          <Card title="Cambiar estado">
            <EstadoActions estado={evento.estado} estadoEnProceso={estadoEnProceso} onCambiarEstado={handleCambiarEstado} />
          </Card>

          <Card title="Modificar la reserva">
            <div className={styles.otrasAcciones}>
              {puedeEditarse(evento.estado) ? (
                <Button to={paths.editarEvento(evento.id)} variant="outline" icon={EditIcon} fullWidth>
                  Editar datos
                </Button>
              ) : (
                <p className={styles.nota}>Los datos de un evento en curso, finalizado o cancelado ya no se modifican.</p>
              )}

              {puedeEliminarse(evento.estado) ? (
                <Button
                  variant="dangerGhost"
                  icon={TrashIcon}
                  fullWidth
                  onClick={() => eliminacion.solicitar(eventoCompleto)}
                >
                  Eliminar evento
                </Button>
              ) : (
                <p className={styles.nota}>
                  {evento.estado === ESTADOS.CONFIRMADO
                    ? "Un evento confirmado no se puede eliminar. Si hace falta, primero cancelalo."
                    : "Este evento queda en el historial y no se puede eliminar."}
                </p>
              )}
            </div>
          </Card>
        </aside>
      </div>

      <ConfirmDialog
        open={confirmarCancelacion}
        title="¿Cancelar este evento?"
        confirmLabel="Sí, cancelar evento"
        loading={estadoEnProceso === ESTADOS.CANCELADO}
        onConfirm={() => aplicarCambioEstado(ESTADOS.CANCELADO)}
        onCancel={() => setConfirmarCancelacion(false)}
      >
        <p>
          El evento de {nombreCliente} del {formatFechaLarga(evento.fecha).toLowerCase()} va a pasar a estado
          Cancelado y la fecha va a quedar libre. Después no se puede volver atrás.
        </p>
      </ConfirmDialog>

      <EliminarEventoDialog {...eliminacion.dialogProps} />
    </>
  );
}
