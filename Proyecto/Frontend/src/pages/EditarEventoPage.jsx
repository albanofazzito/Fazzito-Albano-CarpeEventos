import { useCallback } from "react";
import { useNavigate, useParams } from "react-router";
import RefreshIcon from "../assets/icons/refresh.svg?react";
import EventoForm from "../components/eventos/EventoForm.jsx";
import PageHeader from "../components/layout/PageHeader.jsx";
import Button from "../components/ui/Button.jsx";
import Loader from "../components/ui/Loader.jsx";
import StatusMessage from "../components/ui/StatusMessage.jsx";
import { useAsync } from "../hooks/useAsync.js";
import { useAuth } from "../hooks/useAuth.js";
import { useDocumentTitle } from "../hooks/useDocumentTitle.js";
import { useToast } from "../hooks/useToast.js";
import { getClientes } from "../services/cliente.service.js";
import { getEventoById, updateEvento } from "../services/evento.service.js";
import { getInfoSalon } from "../services/salon.service.js";
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
  const { esAdmin } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const cargarDatos = useCallback(async () => {
    const [evento, servicios, salon, clientes] = await Promise.all([
      getEventoById(id),
      getServicios(),
      getInfoSalon(),
      esAdmin ? getClientes() : null,
    ]);
    // Si el servicio del evento se dio de baja, se sigue ofreciendo para poder conservarlo.
    const opciones =
      !evento.servicio || servicios.some((servicio) => servicio.id === evento.servicioId)
        ? servicios
        : [...servicios, evento.servicio];
    return { evento, servicios: opciones, salon, clientes };
  }, [id, esAdmin]);

  const { data, loading, error, reload } = useAsync(cargarDatos);

  async function guardarCambios(payload) {
    try {
      const actualizado = await updateEvento(id, payload);
      toast.success(
        "Cambios guardados",
        actualizado.estado === ESTADOS.PRESUPUESTADO
          ? "El presupuesto se recalculó con los datos nuevos y espera una nueva aprobación."
          : "Los datos del evento se actualizaron."
      );
      navigate(paths.evento(id));
    } catch (err) {
      toast.error("No se pudieron guardar los cambios", err.message);
    }
  }

  const evento = data?.evento;
  const editable = evento && puedeEditarse(evento.estado);

  let tituloError = "No pudimos cargar el evento";
  if (error?.status === 404) tituloError = "No encontramos este evento";
  if (error?.status === 403) tituloError = "No tenés acceso a este evento";

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
            title={tituloError}
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
            Está en estado {evento.estado}. Solo se modifican los eventos pendientes o presupuestados; si hace falta
            cambiar un evento confirmado, se cancela y se pide uno nuevo.
          </StatusMessage>
        )}

        {editable && (
          <EventoForm
            initialValues={eventoToFormValues(evento)}
            clientes={data.clientes ?? undefined}
            servicios={data.servicios}
            capacidadMaxima={data.salon.capacidadMaxima}
            submitLabel="Guardar cambios"
            onSubmit={guardarCambios}
            cancelTo={paths.evento(id)}
            nota={
              evento.estado === ESTADOS.PRESUPUESTADO ? (
                <>
                  <strong>Este evento ya tiene presupuesto:</strong> si cambiás los datos, el monto se recalcula y el
                  cliente lo tiene que aprobar de nuevo.
                </>
              ) : undefined
            }
          />
        )}
      </div>
    </>
  );
}
