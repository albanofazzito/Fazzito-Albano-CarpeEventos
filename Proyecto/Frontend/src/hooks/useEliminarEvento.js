import { useCallback, useState } from "react";
import { deleteEvento } from "../services/evento.service.js";
import { formatFechaLarga } from "../utils/formatters.js";
import { useToast } from "./useToast.js";

/**
 * Flujo completo para eliminar un evento: pedir confirmación, llamar a la
 * API y avisar el resultado. Lo usan el listado y el detalle de eventos.
 *
 *   const eliminacion = useEliminarEvento(alEliminar);
 *   eliminacion.solicitar(evento);              // abre la confirmación
 *   <EliminarEventoDialog {...eliminacion.dialogProps} />
 */
export function useEliminarEvento(onEliminado) {
  const toast = useToast();
  const [evento, setEvento] = useState(null);
  const [eliminando, setEliminando] = useState(false);

  const cancelar = useCallback(() => setEvento(null), []);

  const confirmar = useCallback(async () => {
    if (!evento) return;
    setEliminando(true);

    try {
      await deleteEvento(evento.id);
      toast.success("Evento eliminado", `Se eliminó el evento del ${formatFechaLarga(evento.fecha).toLowerCase()}.`);
      setEvento(null);
      onEliminado?.(evento);
    } catch (error) {
      // Se cierra la confirmación para que la notificación de error quede a la vista.
      setEvento(null);
      toast.error("No se pudo eliminar el evento", error.message);
    } finally {
      setEliminando(false);
    }
  }, [evento, onEliminado, toast]);

  return {
    solicitar: setEvento,
    dialogProps: {
      evento,
      open: Boolean(evento),
      loading: eliminando,
      onConfirm: confirmar,
      onCancel: cancelar,
    },
  };
}

export default useEliminarEvento;
