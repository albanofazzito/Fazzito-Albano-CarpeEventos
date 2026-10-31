import { useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router";
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
import { createEvento } from "../services/evento.service.js";
import { getServicios } from "../services/servicio.service.js";
import { cx } from "../utils/classNames.js";
import { EVENTO_FORM_VACIO } from "../utils/eventos.js";
import { paths } from "../utils/routes.js";
import styles from "./EventoFormPage.module.css";

async function cargarOpciones() {
  const [clientes, servicios] = await Promise.all([getClientes(), getServicios()]);
  return { clientes, servicios };
}

/** Alta de un evento. Es el destino del botón "Consultá tu fecha" de la landing. */
export default function NuevoEventoPage() {
  useDocumentTitle("Nuevo evento");

  const navigate = useNavigate();
  const toast = useToast();
  const [searchParams] = useSearchParams();
  const { data, loading, error, reload } = useAsync(cargarOpciones);

  // Si se llega desde una tarjeta de servicio (?servicio=2), ese servicio ya viene elegido.
  const servicioElegido = searchParams.get("servicio");
  const initialValues = useMemo(() => {
    const existe = data?.servicios.some((servicio) => String(servicio.id) === servicioElegido);
    return { ...EVENTO_FORM_VACIO, servicioId: existe ? servicioElegido : "" };
  }, [data, servicioElegido]);

  async function crearEvento(payload) {
    try {
      const nuevo = await createEvento(payload);
      toast.success("Evento registrado", "Quedó en estado Pendiente hasta que se le envíe el presupuesto.");
      navigate(paths.evento(nuevo.id));
    } catch (err) {
      toast.error("No se pudo registrar el evento", err.message);
    }
  }

  return (
    <>
      <PageHeader
        eyebrow="Consultá tu fecha"
        title="Nuevo evento"
        description="Cargá los datos de la reserva. Se registra como Pendiente y, cuando se envíe el presupuesto, avanza al siguiente estado."
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

        {data && (
          <EventoForm
            initialValues={initialValues}
            clientes={data.clientes}
            servicios={data.servicios}
            submitLabel="Registrar evento"
            onSubmit={crearEvento}
            cancelTo={paths.eventos}
            nota={
              <>
                <strong>¿Qué pasa después?</strong> La fecha todavía no queda reservada: se bloquea recién cuando el
                cliente aprueba el presupuesto y el evento pasa a Confirmado.
              </>
            }
          />
        )}
      </div>
    </>
  );
}
