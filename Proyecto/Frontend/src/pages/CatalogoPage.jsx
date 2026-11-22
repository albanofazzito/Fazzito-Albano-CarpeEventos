import { useCallback, useMemo, useState } from "react";
import PlusIcon from "../assets/icons/plus.svg?react";
import RefreshIcon from "../assets/icons/refresh.svg?react";
import PageHeader from "../components/layout/PageHeader.jsx";
import ServicioAdminItem from "../components/servicios/ServicioAdminItem.jsx";
import ServicioForm from "../components/servicios/ServicioForm.jsx";
import Button from "../components/ui/Button.jsx";
import ConfirmDialog from "../components/ui/ConfirmDialog.jsx";
import Loader from "../components/ui/Loader.jsx";
import Modal from "../components/ui/Modal.jsx";
import StatusMessage from "../components/ui/StatusMessage.jsx";
import { useAsync } from "../hooks/useAsync.js";
import { useDocumentTitle } from "../hooks/useDocumentTitle.js";
import { useToast } from "../hooks/useToast.js";
import { getInfoSalon } from "../services/salon.service.js";
import { createServicio, deleteServicio, getServicios, updateServicio } from "../services/servicio.service.js";
import { cx } from "../utils/classNames.js";
import { servicioToFormValues } from "../utils/formularios.js";
import styles from "./CatalogoPage.module.css";

/**
 * Catálogo de servicios (solo administrador): alta, edición, baja lógica y
 * reactivación. Lo que se cambia acá es lo que ve el público en la landing
 * y en el formulario de reserva.
 */
export default function CatalogoPage() {
  useDocumentTitle("Catálogo de servicios");

  const toast = useToast();
  const cargar = useCallback(async () => {
    const [servicios, salon] = await Promise.all([getServicios({ incluirInactivos: true }), getInfoSalon()]);
    return { servicios, salon };
  }, []);
  const { data, loading, error, reload, setData } = useAsync(cargar);

  // null: ventana cerrada · "nuevo": alta · objeto servicio: edición
  const [formulario, setFormulario] = useState(null);
  const [aDarDeBaja, setADarDeBaja] = useState(null);
  const [procesandoId, setProcesandoId] = useState(null);

  const editando = formulario && formulario !== "nuevo" ? formulario : null;
  const categorias = useMemo(
    () => [...new Set((data?.servicios ?? []).map((servicio) => servicio.categoria))].sort(),
    [data]
  );

  function reemplazar(servicio) {
    setData((actual) => ({
      ...actual,
      servicios: actual.servicios.map((existente) => (existente.id === servicio.id ? servicio : existente)),
    }));
  }

  async function guardar(datos) {
    try {
      if (editando) {
        reemplazar(await updateServicio(editando.id, datos));
        toast.success("Servicio actualizado", "Los cambios ya se ven en el catálogo público.");
      } else {
        const nuevo = await createServicio(datos);
        setData((actual) => ({ ...actual, servicios: [...actual.servicios, nuevo] }));
        toast.success("Servicio agregado", `“${nuevo.nombre}” ya se puede elegir al reservar.`);
      }
      setFormulario(null);
    } catch (err) {
      toast.error("No se pudo guardar el servicio", err.message);
    }
  }

  async function darDeBaja() {
    const servicio = aDarDeBaja;
    setProcesandoId(servicio.id);
    try {
      reemplazar(await deleteServicio(servicio.id));
      toast.success("Servicio dado de baja", `“${servicio.nombre}” ya no se ofrece para nuevas reservas.`);
    } catch (err) {
      toast.error("No se pudo dar de baja el servicio", err.message);
    } finally {
      setProcesandoId(null);
      setADarDeBaja(null);
    }
  }

  async function reactivar(servicio) {
    setProcesandoId(servicio.id);
    try {
      reemplazar(await updateServicio(servicio.id, { activo: true }));
      toast.success("Servicio reactivado", `“${servicio.nombre}” vuelve a estar en el catálogo.`);
    } catch (err) {
      toast.error("No se pudo reactivar el servicio", err.message);
    } finally {
      setProcesandoId(null);
    }
  }

  return (
    <>
      <PageHeader
        eyebrow="Panel de gestión"
        title="Catálogo de servicios"
        description="Los servicios y precios que se muestran en la web y con los que se calculan los presupuestos."
        actions={
          <Button icon={PlusIcon} onClick={() => setFormulario("nuevo")}>
            Nuevo servicio
          </Button>
        }
      />

      <div className={cx("container", styles.contenido)}>
        {loading && <Loader label="Cargando el catálogo…" />}

        {error && (
          <StatusMessage
            tone="error"
            title="No pudimos cargar el catálogo"
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
            <p className={styles.nota}>
              Cada precio incluye hasta {data.salon.invitadosIncluidos} invitados; los adicionales se suman al
              presupuesto. Un servicio dado de baja deja de ofrecerse, pero sigue apareciendo en el historial de los
              eventos que lo usaron.
            </p>

            {data.servicios.length > 0 ? (
              <ul className={styles.lista}>
                {data.servicios.map((servicio) => (
                  <li key={servicio.id}>
                    <ServicioAdminItem
                      servicio={servicio}
                      procesando={procesandoId === servicio.id}
                      onEditar={setFormulario}
                      onDarDeBaja={setADarDeBaja}
                      onReactivar={reactivar}
                    />
                  </li>
                ))}
              </ul>
            ) : (
              <StatusMessage tone="empty" title="El catálogo está vacío">
                Agregá el primer servicio con el botón “Nuevo servicio”.
              </StatusMessage>
            )}
          </>
        )}
      </div>

      <Modal open={Boolean(formulario)} onClose={() => setFormulario(null)} title={editando ? "Editar servicio" : "Nuevo servicio"}>
        {formulario && (
          <ServicioForm
            key={editando?.id ?? "nuevo"}
            initialValues={editando ? servicioToFormValues(editando) : undefined}
            categorias={categorias}
            invitadosIncluidos={data?.salon.invitadosIncluidos}
            submitLabel={editando ? "Guardar cambios" : "Agregar servicio"}
            onSubmit={guardar}
            onCancel={() => setFormulario(null)}
          />
        )}
      </Modal>

      <ConfirmDialog
        open={Boolean(aDarDeBaja)}
        title="¿Dar de baja este servicio?"
        confirmLabel="Sí, dar de baja"
        loading={Boolean(aDarDeBaja) && procesandoId === aDarDeBaja.id}
        onConfirm={darDeBaja}
        onCancel={() => setADarDeBaja(null)}
      >
        {aDarDeBaja && (
          <p>
            <strong>{aDarDeBaja.nombre}</strong> deja de mostrarse en la web y no se puede elegir en nuevas reservas.
            Después lo podés reactivar.
          </p>
        )}
      </ConfirmDialog>
    </>
  );
}
