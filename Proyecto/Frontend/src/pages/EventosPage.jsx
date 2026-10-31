import { useMemo, useState } from "react";
import { useSearchParams } from "react-router";
import PlusIcon from "../assets/icons/plus.svg?react";
import RefreshIcon from "../assets/icons/refresh.svg?react";
import EliminarEventoDialog from "../components/eventos/EliminarEventoDialog.jsx";
import EstadoFilter from "../components/eventos/EstadoFilter.jsx";
import EventoCard from "../components/eventos/EventoCard.jsx";
import PageHeader from "../components/layout/PageHeader.jsx";
import Button from "../components/ui/Button.jsx";
import Loader from "../components/ui/Loader.jsx";
import StatusMessage from "../components/ui/StatusMessage.jsx";
import TextField from "../components/ui/TextField.jsx";
import { useAsync } from "../hooks/useAsync.js";
import { useDocumentTitle } from "../hooks/useDocumentTitle.js";
import { useEliminarEvento } from "../hooks/useEliminarEvento.js";
import { getClientes } from "../services/cliente.service.js";
import { getEventos } from "../services/evento.service.js";
import { getServicios } from "../services/servicio.service.js";
import { cx } from "../utils/classNames.js";
import { LISTA_ESTADOS } from "../utils/estados.js";
import { countByEstado, enrichEventos, filterEventos, sortByFecha } from "../utils/eventos.js";
import { paths } from "../utils/routes.js";
import styles from "./EventosPage.module.css";

async function cargarEventos() {
  const [eventos, clientes, servicios] = await Promise.all([getEventos(), getClientes(), getServicios()]);
  return enrichEventos(eventos, clientes, servicios);
}

/** Panel de gestión: listado de eventos con filtro por estado y búsqueda. */
export default function EventosPage() {
  useDocumentTitle("Eventos");

  const { data: eventos, loading, error, reload, setData } = useAsync(cargarEventos);
  const [searchParams, setSearchParams] = useSearchParams();
  const [busqueda, setBusqueda] = useState("");

  // El filtro de estado vive en la URL (?estado=Confirmado) para poder compartirlo o volver atrás.
  const estadoParam = searchParams.get("estado");
  const estadoFiltro = LISTA_ESTADOS.includes(estadoParam) ? estadoParam : "";

  const eliminacion = useEliminarEvento((eliminado) =>
    setData((actuales) => actuales.filter((evento) => evento.id !== eliminado.id))
  );

  const conteo = useMemo(() => countByEstado(eventos ?? []), [eventos]);
  const visibles = useMemo(
    () => sortByFecha(filterEventos(eventos ?? [], { estado: estadoFiltro, busqueda })),
    [eventos, estadoFiltro, busqueda]
  );

  function cambiarEstadoFiltro(estado) {
    setSearchParams(estado ? { estado } : {}, { replace: true });
  }

  function limpiarFiltros() {
    setBusqueda("");
    cambiarEstadoFiltro("");
  }

  return (
    <>
      <PageHeader
        eyebrow="Panel de gestión"
        title="Eventos"
        description="Seguí cada reserva del salón, desde la primera consulta hasta el día de la fiesta."
        actions={
          <Button to={paths.nuevoEvento()} icon={PlusIcon}>
            Nuevo evento
          </Button>
        }
      />

      <div className={cx("container", styles.contenido)}>
        {loading && <Loader label="Cargando eventos…" />}

        {error && (
          <StatusMessage
            tone="error"
            title="No pudimos cargar los eventos"
            action={
              <Button variant="outline" icon={RefreshIcon} onClick={reload}>
                Reintentar
              </Button>
            }
          >
            {error.message}
          </StatusMessage>
        )}

        {eventos?.length === 0 && (
          <StatusMessage
            tone="empty"
            title="Todavía no hay eventos cargados"
            action={
              <Button to={paths.nuevoEvento()} icon={PlusIcon}>
                Registrar el primero
              </Button>
            }
          >
            Cuando registres una reserva, la vas a ver acá junto con su estado.
          </StatusMessage>
        )}

        {eventos?.length > 0 && (
          <>
            <div className={styles.toolbar}>
              <EstadoFilter value={estadoFiltro} onChange={cambiarEstadoFiltro} conteo={conteo} total={eventos.length} />
              <TextField
                label="Buscar"
                type="search"
                placeholder="Cliente o tipo de evento"
                value={busqueda}
                onChange={(event) => setBusqueda(event.target.value)}
                className={styles.busqueda}
              />
            </div>

            <p className={styles.resumen} aria-live="polite">
              {visibles.length === eventos.length
                ? `${eventos.length} ${eventos.length === 1 ? "evento" : "eventos"} en total`
                : `Mostrando ${visibles.length} de ${eventos.length} eventos`}
            </p>

            {visibles.length > 0 ? (
              <ul className={styles.lista}>
                {visibles.map((evento) => (
                  <li key={evento.id}>
                    <EventoCard evento={evento} onEliminar={eliminacion.solicitar} />
                  </li>
                ))}
              </ul>
            ) : (
              <StatusMessage
                tone="empty"
                title="No hay eventos que coincidan"
                action={
                  <Button variant="outline" onClick={limpiarFiltros}>
                    Ver todos los eventos
                  </Button>
                }
              >
                Probá con otro estado o con otra búsqueda.
              </StatusMessage>
            )}
          </>
        )}
      </div>

      <EliminarEventoDialog {...eliminacion.dialogProps} />
    </>
  );
}
