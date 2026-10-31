import { useCallback } from "react";
import { useNavigate, useParams } from "react-router";
import RefreshIcon from "../assets/icons/refresh.svg?react";
import EventoForm from "../components/eventos/EventoForm.jsx";
import PageHeader from "../components/layout/PageHeader.jsx";
import Button from "../components/ui/Button.jsx";
import Loader from "../components/ui/Loader.jsx";
import StatusMessage from "../components/ui/StatusMessage.jsx";
import { useAsync } from "../hooks/useAsync.js";
import { useDocumentTitle } from "../hooks/useDocumentTitle.js";
import { useToast } from "../hooks/useToast.js";
import { getClientes } from "../services/cliente.service.js";
import { getEventoById, updateEvento } from "../services/evento.service.js";
import { getServicios } from "../services/servicio.service.js";
import { cx } from "../utils/classNames.js";
import { ESTADOS, puedeEditarse } from "../utils/estados.js";
import { eventoToFormValues } from "../utils/eventos.js";
import { formatFechaLarga } from "../utils/formatters.js";
import { paths } from "../utils/routes.js";
import styles from "./EventoFormPage.module.css";

/** Edición de los datos de un evento (el estado se cambia desde el detalle). */
export default function EditarEventoPage() {
  useDocumentTitle("Editar evento");

  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const cargarDatos = useCallback(async () => {
    const [evento, clientes, servicios] = await Promise.all([getEventoById(id), getClientes(), getServicios()]);
    return { evento, clientes, servicios };
  }, [id]);

  const { data, loading, error, reload } = useAsync(cargarDatos);

  async function guardarCambios(payload) {
    try {
      await updateEvento(id, payload);
      toast.success("Cambios guardados", "Los datos del evento se actualizaron.");
      navigate(paths.evento(id));
    } catch (err) {
      toast.error("No se pudieron guardar los cambios", err.message);
    }
  }

  const evento = data?.evento;
  const editable = evento && puedeEditarse(evento.estado);

  return (
    <>
      <PageHeader
        backTo={paths.evento(id)}
        backLabel="Volver al detalle"
        eyebrow={evento ? `Evento n.º ${evento.id}` : "Eventos"}
        title="Editar evento"
        description={evento ? `Reserva del ${formatFechaLarga(evento.fecha).toLowerCase()}.` : undefined}
      />

      <div className={cx("container", styles.contenido)}>
        {loading && <Loader label="Cargando el evento…" />}

        {error && (
          <StatusMessage
            tone="error"
            title={error.status === 404 ? "No encontramos este evento" : "No pudimos cargar el evento"}
            action={
              <>
                <Button to={paths.eventos} variant="outline">
                  Ir al listado
                </Button>
                {error.status !== 404 && (
                  <Button icon={RefreshIcon} onClick={reload}>
                    Reintentar
                  </Button>
                )}
              </>
            }
          >
            {error.message}
          </StatusMessage>
        )}

        {evento && !editable && (
          <StatusMessage
            tone="info"
            title="Este evento ya no se puede editar"
            action={
              <Button to={paths.evento(id)} variant="outline">
                Ver el detalle
              </Button>
            }
          >
            Está en estado {evento.estado}. Solo se modifican los eventos pendientes, presupuestados o confirmados.
          </StatusMessage>
        )}

        {editable && (
          <EventoForm
            initialValues={eventoToFormValues(evento)}
            clientes={data.clientes}
            servicios={data.servicios}
            submitLabel="Guardar cambios"
            onSubmit={guardarCambios}
            cancelTo={paths.evento(id)}
            nota={
              evento.estado === ESTADOS.CONFIRMADO ? (
                <>
                  <strong>Evento confirmado:</strong> si cambiás la fecha o el horario, se vuelve a verificar que no se
                  superponga con otro evento confirmado.
                </>
              ) : undefined
            }
          />
        )}
      </div>
    </>
  );
}
