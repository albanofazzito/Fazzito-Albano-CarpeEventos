import { useCallback } from "react";
import RefreshIcon from "../assets/icons/refresh.svg?react";
import ClienteForm from "../components/clientes/ClienteForm.jsx";
import PageHeader from "../components/layout/PageHeader.jsx";
import Button from "../components/ui/Button.jsx";
import Card from "../components/ui/Card.jsx";
import Loader from "../components/ui/Loader.jsx";
import StatusMessage from "../components/ui/StatusMessage.jsx";
import { useAsync } from "../hooks/useAsync.js";
import { useAuth } from "../hooks/useAuth.js";
import { useDocumentTitle } from "../hooks/useDocumentTitle.js";
import { useToast } from "../hooks/useToast.js";
import { getClienteById, updateCliente } from "../services/cliente.service.js";
import { cx } from "../utils/classNames.js";
import { clienteToFormValues } from "../utils/formularios.js";
import { paths } from "../utils/routes.js";
import styles from "./PerfilPage.module.css";

/** "Mi cuenta": el cliente revisa y actualiza sus datos de contacto. */
export default function PerfilPage() {
  useDocumentTitle("Mi cuenta");

  const { usuario, actualizarUsuario } = useAuth();
  const toast = useToast();

  const cargarCliente = useCallback(() => getClienteById(usuario.clienteId), [usuario.clienteId]);
  const { data: cliente, loading, error, reload, setData } = useAsync(cargarCliente);

  async function guardar(datos) {
    try {
      const actualizado = await updateCliente(usuario.clienteId, datos);
      setData(actualizado);
      actualizarUsuario(clienteToFormValues(actualizado));
      toast.success("Datos actualizados", "Si cambiaste el email, usalo la próxima vez que ingreses.");
    } catch (err) {
      toast.error("No se pudieron guardar los datos", err.message);
    }
  }

  return (
    <>
      <PageHeader
        eyebrow="Tu cuenta"
        title="Mi cuenta"
        description="Estos son los datos con los que te contactamos por tu reserva."
      />

      <div className={cx("container", styles.contenido)}>
        {loading && <Loader label="Cargando tus datos…" />}

        {error && (
          <StatusMessage
            tone="error"
            title="No pudimos cargar tus datos"
            action={
              <Button variant="outline" icon={RefreshIcon} onClick={reload}>
                Reintentar
              </Button>
            }
          >
            {error.message}
          </StatusMessage>
        )}

        {cliente && (
          <div className={styles.layout}>
            <Card title="Datos de contacto">
              <ClienteForm
                key={cliente.email}
                initialValues={clienteToFormValues(cliente)}
                submitLabel="Guardar cambios"
                onSubmit={guardar}
              />
            </Card>

            <Card title="Tu historial">
              <p className={styles.texto}>
                {cliente.cantidadEventos === 0
                  ? "Todavía no pediste ninguna fecha."
                  : `Tenés ${cliente.cantidadEventos} ${cliente.cantidadEventos === 1 ? "evento registrado" : "eventos registrados"} con nosotros.`}
              </p>
              <Button to={paths.eventos} variant="outline" fullWidth className={styles.boton}>
                Ver mis eventos
              </Button>
              <p className={styles.nota}>
                Ingresás con <strong>{usuario.email}</strong>.
              </p>
            </Card>
          </div>
        )}
      </div>
    </>
  );
}
