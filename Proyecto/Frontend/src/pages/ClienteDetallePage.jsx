import { useCallback, useMemo, useState } from "react";
import { useParams } from "react-router";
import EditIcon from "../assets/icons/edit.svg?react";
import MailIcon from "../assets/icons/mail.svg?react";
import PhoneIcon from "../assets/icons/phone.svg?react";
import PlusIcon from "../assets/icons/plus.svg?react";
import RefreshIcon from "../assets/icons/refresh.svg?react";
import WhatsappIcon from "../assets/icons/whatsapp.svg?react";
import ClienteForm from "../components/clientes/ClienteForm.jsx";
import EventoCard from "../components/eventos/EventoCard.jsx";
import PageHeader from "../components/layout/PageHeader.jsx";
import Button from "../components/ui/Button.jsx";
import Card from "../components/ui/Card.jsx";
import Loader from "../components/ui/Loader.jsx";
import Modal from "../components/ui/Modal.jsx";
import StatusMessage from "../components/ui/StatusMessage.jsx";
import { useAsync } from "../hooks/useAsync.js";
import { useDocumentTitle } from "../hooks/useDocumentTitle.js";
import { useToast } from "../hooks/useToast.js";
import { getClienteById, updateCliente } from "../services/cliente.service.js";
import { getEventos } from "../services/evento.service.js";
import { cx } from "../utils/classNames.js";
import { getTodayISO } from "../utils/dates.js";
import { sortByFecha } from "../utils/eventos.js";
import { formatNombreCompleto } from "../utils/formatters.js";
import { clienteToFormValues } from "../utils/formularios.js";
import { buildTelUrl, buildWhatsAppUrl } from "../utils/links.js";
import { paths } from "../utils/routes.js";
import styles from "./ClienteDetallePage.module.css";

/**
 * Ficha de un cliente (solo administrador): datos de contacto e historial
 * de eventos (análisis del sistema, funcionalidad 7), útil para clientes
 * que vuelven a celebrar en el salón.
 */
export default function ClienteDetallePage() {
  const { id } = useParams();
  const toast = useToast();
  const [editando, setEditando] = useState(false);

  const cargar = useCallback(async () => {
    const [cliente, eventos] = await Promise.all([getClienteById(id), getEventos({ clienteId: id })]);
    return { cliente, eventos };
  }, [id]);
  const { data, loading, error, reload, setData } = useAsync(cargar);

  useDocumentTitle(data ? formatNombreCompleto(data.cliente) : "Cliente");

  const { proximos, pasados } = useMemo(() => {
    const hoy = getTodayISO();
    const ordenados = sortByFecha(data?.eventos ?? []);
    return {
      proximos: ordenados.filter((evento) => evento.fecha >= hoy),
      pasados: ordenados.filter((evento) => evento.fecha < hoy).reverse(),
    };
  }, [data]);

  async function guardar(datos) {
    try {
      const actualizado = await updateCliente(id, datos);
      setData((actual) => ({ ...actual, cliente: actualizado }));
      toast.success("Cliente actualizado", "Se guardaron los datos de contacto.");
      setEditando(false);
    } catch (err) {
      toast.error("No se pudo guardar el cliente", err.message);
    }
  }

  if (loading || error) {
    return (
      <>
        <PageHeader backTo={paths.clientes} backLabel="Volver a clientes" title="Cliente" />
        <div className={cx("container", styles.contenido)}>
          {loading && <Loader label="Cargando el cliente…" />}
          {error && (
            <StatusMessage
              tone="error"
              title={error.status === 404 ? "No encontramos este cliente" : "No pudimos cargar el cliente"}
              action={
                <>
                  <Button to={paths.clientes} variant="outline">
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
        </div>
      </>
    );
  }

  const { cliente } = data;
  const nombre = formatNombreCompleto(cliente);

  return (
    <>
      <PageHeader
        backTo={paths.clientes}
        backLabel="Volver a clientes"
        eyebrow={`Cliente n.º ${cliente.id}`}
        title={nombre}
        description={cliente.tieneCuenta ? "Tiene cuenta en la web." : "Cargado por el salón (sin cuenta en la web)."}
        actions={
          <Button to={paths.nuevoEvento({ cliente: cliente.id })} icon={PlusIcon}>
            Nueva reserva
          </Button>
        }
      />

      <div className={cx("container", styles.contenido, styles.layout)}>
        <div className={styles.historial}>
          <Card title="Próximos eventos">
            {proximos.length > 0 ? (
              <ul className={styles.lista}>
                {proximos.map((evento) => (
                  <li key={evento.id}>
                    <EventoCard evento={evento} mostrarCliente={false} headingLevel={3} />
                  </li>
                ))}
              </ul>
            ) : (
              <p className={styles.vacio}>No tiene eventos próximos.</p>
            )}
          </Card>

          <Card title="Historial">
            {pasados.length > 0 ? (
              <ul className={styles.lista}>
                {pasados.map((evento) => (
                  <li key={evento.id}>
                    <EventoCard evento={evento} mostrarCliente={false} headingLevel={3} />
                  </li>
                ))}
              </ul>
            ) : (
              <p className={styles.vacio}>Todavía no celebró ningún evento en el salón.</p>
            )}
          </Card>
        </div>

        <aside className={styles.lateral} aria-label="Datos de contacto">
          <Card title="Contacto">
            <ul className={styles.contacto}>
              <li>
                <PhoneIcon className={styles.icon} />
                <span className="visually-hidden">Teléfono: </span>
                <a href={buildTelUrl(cliente.telefono)}>{cliente.telefono}</a>
              </li>
              <li>
                <MailIcon className={styles.icon} />
                <span className="visually-hidden">Email: </span>
                <a href={`mailto:${cliente.email}`}>{cliente.email}</a>
              </li>
            </ul>
            <div className={styles.acciones}>
              <Button
                href={buildWhatsAppUrl(cliente.telefono, `¡Hola, ${cliente.nombre}! Te escribimos de Carpe Eventos.`)}
                external
                variant="outline"
                size="sm"
                icon={WhatsappIcon}
                fullWidth
              >
                Escribirle por WhatsApp
              </Button>
              <Button variant="ghost" size="sm" icon={EditIcon} fullWidth onClick={() => setEditando(true)}>
                Editar datos
              </Button>
            </div>
          </Card>
        </aside>
      </div>

      <Modal open={editando} onClose={() => setEditando(false)} title="Editar cliente">
        {editando && (
          <ClienteForm
            initialValues={clienteToFormValues(cliente)}
            submitLabel="Guardar cambios"
            onSubmit={guardar}
            onCancel={() => setEditando(false)}
          />
        )}
      </Modal>
    </>
  );
}
