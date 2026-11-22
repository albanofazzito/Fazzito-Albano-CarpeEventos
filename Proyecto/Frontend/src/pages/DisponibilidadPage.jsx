import { useCallback, useState } from "react";
import CalendarIcon from "../assets/icons/calendar.svg?react";
import ChevronLeftIcon from "../assets/icons/chevron-left.svg?react";
import ChevronRightIcon from "../assets/icons/chevron-right.svg?react";
import RefreshIcon from "../assets/icons/refresh.svg?react";
import CalendarioMes from "../components/disponibilidad/CalendarioMes.jsx";
import PageHeader from "../components/layout/PageHeader.jsx";
import Button from "../components/ui/Button.jsx";
import Card from "../components/ui/Card.jsx";
import Loader from "../components/ui/Loader.jsx";
import StatusMessage from "../components/ui/StatusMessage.jsx";
import { useAsync } from "../hooks/useAsync.js";
import { useDocumentTitle } from "../hooks/useDocumentTitle.js";
import { getDisponibilidad, getInfoSalon } from "../services/salon.service.js";
import { cx } from "../utils/classNames.js";
import { addMonths, getMonthOf, getTodayISO } from "../utils/dates.js";
import { formatFechaLarga, formatHorario, formatMes, formatPrecio } from "../utils/formatters.js";
import { paths } from "../utils/routes.js";
import styles from "./DisponibilidadPage.module.css";

/**
 * Calendario público del salón (análisis del sistema, funcionalidad 4):
 * muestra qué días tienen eventos confirmados y en qué horario, para que
 * nadie tenga que preguntar por WhatsApp si una fecha está libre.
 */
export default function DisponibilidadPage() {
  useDocumentTitle("Disponibilidad del salón");

  const hoy = getTodayISO();
  const mesActual = getMonthOf(hoy);
  const [mes, setMes] = useState(mesActual);
  const [seleccionada, setSeleccionada] = useState(null);

  const cargarMes = useCallback(() => getDisponibilidad(mes), [mes]);
  const { data, loading, error, reload } = useAsync(cargarMes);
  const { data: salon } = useAsync(getInfoSalon);

  const franjasDelDia = data?.dias.find((dia) => dia.fecha === seleccionada)?.franjas ?? [];

  function cambiarMes(cantidad) {
    setMes((actual) => addMonths(actual, cantidad));
    setSeleccionada(null);
  }

  return (
    <>
      <PageHeader
        eyebrow="Calendario"
        title="Disponibilidad del salón"
        description="Mirá qué días y horarios ya están reservados antes de pedir tu fecha."
      />

      <div className={cx("container", styles.contenido)}>
        <div className={styles.layout}>
          <Card
            title={formatMes(mes)}
            actions={
              <div className={styles.navegacion}>
                <Button
                  variant="ghost"
                  size="sm"
                  icon={ChevronLeftIcon}
                  disabled={mes <= mesActual}
                  onClick={() => cambiarMes(-1)}
                >
                  <span className="visually-hidden">Mes anterior</span>
                </Button>
                <Button variant="ghost" size="sm" icon={ChevronRightIcon} onClick={() => cambiarMes(1)}>
                  <span className="visually-hidden">Mes siguiente</span>
                </Button>
              </div>
            }
          >
            {loading && <Loader label="Cargando el calendario…" />}
            {error && (
              <StatusMessage
                tone="error"
                title="No pudimos cargar la disponibilidad"
                headingLevel={3}
                action={
                  <Button variant="outline" icon={RefreshIcon} onClick={reload}>
                    Reintentar
                  </Button>
                }
              >
                {error.message}
              </StatusMessage>
            )}
            {data && (
              <>
                <CalendarioMes
                  mes={mes}
                  diasOcupados={data.dias}
                  seleccionada={seleccionada}
                  hoy={hoy}
                  onSeleccionar={setSeleccionada}
                />
                <ul className={styles.leyenda} aria-label="Referencias">
                  <li>
                    <span className={cx(styles.muestra, styles.muestraLibre)} aria-hidden="true" />
                    Libre
                  </li>
                  <li>
                    <span className={cx(styles.muestra, styles.muestraOcupado)} aria-hidden="true" />
                    Con eventos confirmados (quedan otros horarios)
                  </li>
                  <li>
                    <span className={cx(styles.muestra, styles.muestraPasado)} aria-hidden="true" />
                    Fecha pasada
                  </li>
                </ul>
              </>
            )}
          </Card>

          <aside className={styles.lateral} aria-label="Día elegido">
            <Card title={seleccionada ? formatFechaLarga(seleccionada) : "Elegí un día"}>
              <div aria-live="polite">
                {!seleccionada && <p className={styles.texto}>Tocá un día del calendario para ver sus horarios.</p>}

                {seleccionada && franjasDelDia.length === 0 && (
                  <p className={styles.libre}>¡El salón está libre todo el día!</p>
                )}

                {seleccionada && franjasDelDia.length > 0 && (
                  <>
                    <p className={styles.texto}>Horarios ya reservados:</p>
                    <ul className={styles.franjas}>
                      {franjasDelDia.map((franja) => (
                        <li key={franja.horaInicio}>{formatHorario(franja.horaInicio, franja.horaFin)}</li>
                      ))}
                    </ul>
                    <p className={styles.texto}>Podés pedir cualquier otro horario de ese día.</p>
                  </>
                )}
              </div>

              {seleccionada && (
                <Button to={paths.nuevoEvento({ fecha: seleccionada })} icon={CalendarIcon} fullWidth className={styles.pedir}>
                  Pedir esta fecha
                </Button>
              )}
            </Card>

            {salon && (
              <Card title="Para tener en cuenta">
                <ul className={styles.reglas}>
                  <li>
                    Capacidad máxima: <strong>{salon.capacidadMaxima} personas</strong>.
                  </li>
                  <li>
                    El precio de cada servicio incluye hasta <strong>{salon.invitadosIncluidos} invitados</strong>; cada
                    invitado adicional suma {formatPrecio(salon.precioInvitadoAdicional)}.
                  </li>
                  <li>La fecha queda reservada cuando se aprueba el presupuesto y el salón confirma el evento.</li>
                </ul>
              </Card>
            )}
          </aside>
        </div>
      </div>
    </>
  );
}
