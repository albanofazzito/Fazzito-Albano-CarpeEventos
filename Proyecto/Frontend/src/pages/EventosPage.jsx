import { useMemo, useState } from "react";
import { useSearchParams } from "react-router";
import PlusIcon from "../assets/icons/plus.svg?react";
import RefreshIcon from "../assets/icons/refresh.svg?react";
import EliminarEventoDialog from "../components/eventos/EliminarEventoDialog.jsx";
import EstadoFilter from "../components/eventos/EstadoFilter.jsx";
import EventoCard from "../components/eventos/EventoCard.jsx";
import ResumenAtencion from "../components/eventos/ResumenAtencion.jsx";
import PageHeader from "../components/layout/PageHeader.jsx";
import Button from "../components/ui/Button.jsx";
import Loader from "../components/ui/Loader.jsx";
import SelectField from "../components/ui/SelectField.jsx";
import StatusMessage from "../components/ui/StatusMessage.jsx";
import TextField from "../components/ui/TextField.jsx";
import { useAsync } from "../hooks/useAsync.js";
import { useAuth } from "../hooks/useAuth.js";
import { useDocumentTitle } from "../hooks/useDocumentTitle.js";
import { useEliminarEvento } from "../hooks/useEliminarEvento.js";
import { getEventos } from "../services/evento.service.js";
import { cx } from "../utils/classNames.js";
import { LISTA_ESTADOS } from "../utils/estados.js";
import { countByEstado, filterEventos, PERIODOS, sortByFecha } from "../utils/eventos.js";
import { paths } from "../utils/routes.js";
import styles from "./EventosPage.module.css";

const OPCIONES_PERIODO = [
  { value: PERIODOS.TODOS, label: "Todas las fechas" },
  { value: PERIODOS.PROXIMOS, label: "Próximos" },
  { value: PERIODOS.ESTE_MES, label: "Este mes" },
  { value: PERIODOS.PASADOS, label: "Pasados" },
];

/**
 * Listado de eventos. El administrador ve el panel de gestión con todas las
 * reservas; un cliente ve "Mis eventos" (la API ya devuelve solo los suyos).
 */
export default function EventosPage() {
  const { esAdmin } = useAuth();
  useDocumentTitle(esAdmin ? "Eventos" : "Mis eventos");

  const { data: eventos, loading, error, reload, setData } = useAsync(getEventos);
  const [searchParams, setSearchParams] = useSearchParams();
  const [busqueda, setBusqueda] = useState("");
  const [periodo, setPeriodo] = useState(PERIODOS.TODOS);

  // El filtro de estado vive en la URL (?estado=Confirmado) para poder compartirlo o volver atrás.
  const estadoParam = searchParams.get("estado");
  const estadoFiltro = LISTA_ESTADOS.includes(estadoParam) ? estadoParam : "";

  const eliminacion = useEliminarEvento((eliminado) =>
    setData((actuales) => actuales.filter((evento) => evento.id !== eliminado.id))
  );

  const conteo = useMemo(() => countByEstado(eventos ?? []), [eventos]);
  const visibles = useMemo(
    () => sortByFecha(filterEventos(eventos ?? [], { estado: estadoFiltro, periodo, busqueda })),
    [eventos, estadoFiltro, periodo, busqueda]
  );

  function cambiarEstadoFiltro(estado) {
    setSearchParams(estado ? { estado } : {}, { replace: true });
  }

  function limpiarFiltros() {
    setBusqueda("");
    setPeriodo(PERIODOS.TODOS);
    cambiarEstadoFiltro("");
  }

  const botonNuevo = (
    <Button to={paths.nuevoEvento()} icon={PlusIcon}>
      {esAdmin ? "Nuevo evento" : "Pedir una fecha"}
    </Button>
  );

  return (
    <>
      <PageHeader
        eyebrow={esAdmin ? "Panel de gestión" : "Tu cuenta"}
        title={esAdmin ? "Eventos" : "Mis eventos"}
        description={
          esAdmin
            ? "Seguí cada reserva del salón, desde la primera consulta hasta el día de la fiesta."
            : "Tus reservas en Carpe Eventos: las próximas y las que ya celebraste."
        }
        actions={botonNuevo}
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
            title={esAdmin ? "Todavía no hay eventos cargados" : "Todavía no pediste ninguna fecha"}
            action={botonNuevo}
          >
            {esAdmin
              ? "Cuando se registre una reserva, la vas a ver acá junto con su estado."
              : "Elegí el tipo de evento, la fecha y la cantidad de invitados, y te enviamos el presupuesto."}
          </StatusMessage>
        )}

        {eventos?.length > 0 && (
          <>
            <ResumenAtencion eventos={eventos} esAdmin={esAdmin} onFiltrar={cambiarEstadoFiltro} />

            <div className={styles.toolbar}>
              <EstadoFilter value={estadoFiltro} onChange={cambiarEstadoFiltro} conteo={conteo} total={eventos.length} />
              <div className={styles.filtros}>
                <SelectField
                  label="Fecha"
                  value={periodo}
                  onChange={(event) => setPeriodo(event.target.value)}
                  options={OPCIONES_PERIODO}
                  className={styles.periodo}
                />
                <TextField
                  label="Buscar"
                  type="search"
                  placeholder={esAdmin ? "Cliente o tipo de evento" : "Tipo de evento"}
                  value={busqueda}
                  onChange={(event) => setBusqueda(event.target.value)}
                  className={styles.busqueda}
                />
              </div>
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
                    <EventoCard
                      evento={evento}
                      mostrarCliente={esAdmin}
                      onEliminar={esAdmin ? eliminacion.solicitar : undefined}
                    />
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
                Probá con otro estado, otra fecha o con otra búsqueda.
              </StatusMessage>
            )}
          </>
        )}
      </div>

      <EliminarEventoDialog {...eliminacion.dialogProps} />
    </>
  );
}
