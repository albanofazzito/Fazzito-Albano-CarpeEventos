import { formatFechaLarga, formatNombreCompleto } from "../../utils/formatters.js";
import ConfirmDialog from "../ui/ConfirmDialog.jsx";

/** Confirmación antes de eliminar un evento, con los datos para no borrar el equivocado. */
export default function EliminarEventoDialog({ evento, open, loading, onConfirm, onCancel }) {
  return (
    <ConfirmDialog
      open={open}
      title="¿Eliminar este evento?"
      confirmLabel="Sí, eliminar"
      loading={loading}
      onConfirm={onConfirm}
      onCancel={onCancel}
    >
      {evento && (
        <p>
          Se va a eliminar {evento.servicio ? <strong>{evento.servicio.nombre}</strong> : "el evento"}
          {evento.cliente && <> de {formatNombreCompleto(evento.cliente)}</>}, programado para el{" "}
          {formatFechaLarga(evento.fecha).toLowerCase()}. Esta acción no se puede deshacer.
        </p>
      )}
    </ConfirmDialog>
  );
}
