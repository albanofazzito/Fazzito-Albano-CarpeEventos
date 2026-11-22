import { useMemo, useState } from "react";
import PlusIcon from "../assets/icons/plus.svg?react";
import RefreshIcon from "../assets/icons/refresh.svg?react";
import ClienteForm from "../components/clientes/ClienteForm.jsx";
import ClienteItem from "../components/clientes/ClienteItem.jsx";
import PageHeader from "../components/layout/PageHeader.jsx";
import Button from "../components/ui/Button.jsx";
import ConfirmDialog from "../components/ui/ConfirmDialog.jsx";
import Loader from "../components/ui/Loader.jsx";
import Modal from "../components/ui/Modal.jsx";
import StatusMessage from "../components/ui/StatusMessage.jsx";
import TextField from "../components/ui/TextField.jsx";
import { useAsync } from "../hooks/useAsync.js";
import { useDocumentTitle } from "../hooks/useDocumentTitle.js";
import { useToast } from "../hooks/useToast.js";
import { createCliente, deleteCliente, getClientes, updateCliente } from "../services/cliente.service.js";
import { cx } from "../utils/classNames.js";
import { normalizar } from "../utils/eventos.js";
import { formatNombreCompleto } from "../utils/formatters.js";
import { clienteToFormValues } from "../utils/formularios.js";
import styles from "./ClientesPage.module.css";

/**
 * Gestión de clientes (solo administrador): listado con búsqueda, alta
 * (por ejemplo, alguien que consultó por WhatsApp), edición y baja.
 */
export default function ClientesPage() {
  useDocumentTitle("Clientes");

  const toast = useToast();
  const { data: clientes, loading, error, reload, setData } = useAsync(getClientes);
  const [busqueda, setBusqueda] = useState("");
  // null: ventana cerrada · "nuevo": alta · objeto cliente: edición
  const [formulario, setFormulario] = useState(null);
  const [aEliminar, setAEliminar] = useState(null);
  const [eliminando, setEliminando] = useState(false);

  const visibles = useMemo(() => {
    const termino = normalizar(busqueda);
    if (!termino) return clientes ?? [];
    return (clientes ?? []).filter((cliente) =>
      normalizar(`${formatNombreCompleto(cliente)} ${cliente.email} ${cliente.telefono}`).includes(termino)
    );
  }, [clientes, busqueda]);

  const editando = formulario && formulario !== "nuevo" ? formulario : null;

  async function guardar(datos) {
    try {
      if (editando) {
        const actualizado = await updateCliente(editando.id, datos);
        setData((actuales) => actuales.map((cliente) => (cliente.id === actualizado.id ? actualizado : cliente)));
        toast.success("Cliente actualizado", `Se guardaron los datos de ${formatNombreCompleto(actualizado)}.`);
      } else {
        const nuevo = await createCliente(datos);
        setData((actuales) => [...actuales, nuevo]);
        toast.success("Cliente agregado", `${formatNombreCompleto(nuevo)} ya puede tener reservas a su nombre.`);
      }
      setFormulario(null);
    } catch (err) {
      toast.error("No se pudo guardar el cliente", err.message);
    }
  }

  async function eliminar() {
    setEliminando(true);
    try {
      await deleteCliente(aEliminar.id);
      setData((actuales) => actuales.filter((cliente) => cliente.id !== aEliminar.id));
      toast.success("Cliente eliminado", `Se eliminó a ${formatNombreCompleto(aEliminar)}.`);
    } catch (err) {
      toast.error("No se pudo eliminar el cliente", err.message);
    } finally {
      setEliminando(false);
      setAEliminar(null);
    }
  }

  return (
    <>
      <PageHeader
        eyebrow="Panel de gestión"
        title="Clientes"
        description="Las familias que reservan en el salón, con sus datos de contacto e historial."
        actions={
          <Button icon={PlusIcon} onClick={() => setFormulario("nuevo")}>
            Nuevo cliente
          </Button>
        }
      />

      <div className={cx("container", styles.contenido)}>
        {loading && <Loader label="Cargando clientes…" />}

        {error && (
          <StatusMessage
            tone="error"
            title="No pudimos cargar los clientes"
            action={
              <Button variant="outline" icon={RefreshIcon} onClick={reload}>
                Reintentar
              </Button>
            }
          >
            {error.message}
          </StatusMessage>
        )}

        {clientes && (
          <>
            <div className={styles.toolbar}>
              <TextField
                label="Buscar"
                type="search"
                placeholder="Nombre, email o teléfono"
                value={busqueda}
                onChange={(event) => setBusqueda(event.target.value)}
                className={styles.busqueda}
              />
              <p className={styles.resumen} aria-live="polite">
                {visibles.length === clientes.length
                  ? `${clientes.length} ${clientes.length === 1 ? "cliente" : "clientes"}`
                  : `Mostrando ${visibles.length} de ${clientes.length} clientes`}
              </p>
            </div>

            {visibles.length > 0 ? (
              <ul className={styles.lista}>
                {visibles.map((cliente) => (
                  <li key={cliente.id}>
                    <ClienteItem cliente={cliente} onEditar={setFormulario} onEliminar={setAEliminar} />
                  </li>
                ))}
              </ul>
            ) : (
              <StatusMessage tone="empty" title={clientes.length ? "No hay clientes que coincidan" : "Todavía no hay clientes"}>
                {clientes.length ? "Probá con otra búsqueda." : "Agregá el primero con el botón “Nuevo cliente”."}
              </StatusMessage>
            )}
          </>
        )}
      </div>

      <Modal
        open={Boolean(formulario)}
        onClose={() => setFormulario(null)}
        title={editando ? "Editar cliente" : "Nuevo cliente"}
        description={editando ? undefined : "Para quienes reservan por WhatsApp sin crear una cuenta en la web."}
      >
        {formulario && (
          <ClienteForm
            key={editando?.id ?? "nuevo"}
            initialValues={editando ? clienteToFormValues(editando) : undefined}
            submitLabel={editando ? "Guardar cambios" : "Agregar cliente"}
            onSubmit={guardar}
            onCancel={() => setFormulario(null)}
          />
        )}
      </Modal>

      <ConfirmDialog
        open={Boolean(aEliminar)}
        title="¿Eliminar este cliente?"
        confirmLabel="Sí, eliminar"
        loading={eliminando}
        onConfirm={eliminar}
        onCancel={() => setAEliminar(null)}
      >
        {aEliminar && (
          <p>
            Se va a eliminar a <strong>{formatNombreCompleto(aEliminar)}</strong>
            {aEliminar.tieneCuenta && " junto con su cuenta en la web"}. Esta acción no se puede deshacer.
          </p>
        )}
      </ConfirmDialog>
    </>
  );
}
