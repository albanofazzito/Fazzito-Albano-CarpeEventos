import { useCallback, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router";
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
import { createEvento } from "../services/evento.service.js";
import { getInfoSalon } from "../services/salon.service.js";
import { getServicios } from "../services/servicio.service.js";
import { cx } from "../utils/classNames.js";
import { getTodayISO, parseISODate } from "../utils/dates.js";
import { EVENTO_FORM_VACIO } from "../utils/eventos.js";
import { paths } from "../utils/routes.js";
import styles from "./EventoFormPage.module.css";

/**
 * Alta de un evento. Es el destino del botón "Consultá tu fecha" de la
 * landing. Un cliente pide la fecha a su nombre; el administrador elige el
 * cliente (por ejemplo, alguien que consultó por WhatsApp).
 *
 * Acepta parámetros para llegar con datos precargados:
 *   ?servicio=2 (desde una tarjeta de servicio), ?fecha=2026-12-05 (desde
 *   el calendario) y ?cliente=3 (desde la ficha de un cliente, solo admin).
 */
export default function NuevoEventoPage() {
  useDocumentTitle("Nuevo evento");

  const { esAdmin } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const [searchParams] = useSearchParams();

  const cargarOpciones = useCallback(async () => {
    const [servicios, salon, clientes] = await Promise.all([
      getServicios(),
      getInfoSalon(),
      esAdmin ? getClientes() : null,
    ]);
    return { servicios, salon, clientes };
  }, [esAdmin]);

  const { data, loading, error, reload } = useAsync(cargarOpciones);

  const servicioParam = searchParams.get("servicio");
  const fechaParam = searchParams.get("fecha");
  const clienteParam = searchParams.get("cliente");

  const initialValues = useMemo(() => {
    const existeServicio = data?.servicios.some((servicio) => String(servicio.id) === servicioParam);
    const existeCliente = data?.clientes?.some((cliente) => String(cliente.id) === clienteParam);
    const fechaValida = parseISODate(fechaParam) && fechaParam >= getTodayISO();

    return {
      ...EVENTO_FORM_VACIO,
      servicioId: existeServicio ? servicioParam : "",
      clienteId: existeCliente ? clienteParam : "",
      fecha: fechaValida ? fechaParam : "",
    };
  }, [data, servicioParam, clienteParam, fechaParam]);

  async function crearEvento(payload) {
    try {
      const nuevo = await createEvento(payload);
      toast.success(
        esAdmin ? "Evento registrado" : "¡Solicitud enviada!",
        esAdmin
          ? "Quedó en estado Pendiente. El siguiente paso es generar el presupuesto."
          : "Te avisamos cuando tu presupuesto esté listo para revisar."
      );
      navigate(paths.evento(nuevo.id));
    } catch (err) {
      toast.error("No se pudo registrar el evento", err.message);
    }
  }

  return (
    <>
      <PageHeader
        eyebrow="Consultá tu fecha"
        title={esAdmin ? "Nuevo evento" : "Pedí tu fecha"}
        description={
          esAdmin
            ? "Cargá los datos de la reserva. Se registra como Pendiente hasta que se genere el presupuesto."
            : "Contanos qué querés celebrar. Revisamos la solicitud y te enviamos el presupuesto."
        }
      />

      <div className={cx("container", styles.contenido)}>
        {loading && <Loader label="Preparando el formulario…" />}

        {error && (
          <StatusMessage
            tone="error"
            title="No pudimos preparar el formulario"
            action={
              <Button variant="outline" icon={RefreshIcon} onClick={reload}>
                Reintentar
              </Button>
            }
          >
            {error.message}
          </StatusMessage>
        )}

        {data?.servicios.length === 0 && (
          <StatusMessage tone="info" title="Estamos actualizando el catálogo">
            En este momento no hay servicios disponibles para reservar. Escribinos por WhatsApp y te ayudamos.
          </StatusMessage>
        )}

        {data?.servicios.length > 0 && (
          <EventoForm
            // Si cambian los parámetros de la URL, el formulario arranca de nuevo con esos datos.
            key={searchParams.toString()}
            initialValues={initialValues}
            clientes={data.clientes ?? undefined}
            servicios={data.servicios}
            capacidadMaxima={data.salon.capacidadMaxima}
            submitLabel={esAdmin ? "Registrar evento" : "Enviar solicitud"}
            onSubmit={crearEvento}
            cancelTo={paths.eventos}
            nota={
              <>
                <strong>¿Qué pasa después?</strong>{" "}
                {esAdmin
                  ? "La fecha todavía no queda reservada: se bloquea cuando el cliente aprueba el presupuesto y confirmás el evento."
                  : "El salón te envía el presupuesto. La fecha queda reservada cuando lo aprobás y el salón confirma el evento."}
              </>
            }
          />
        )}
      </div>
    </>
  );
}
