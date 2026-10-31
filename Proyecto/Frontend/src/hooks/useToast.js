import { useContext } from "react";
import { ToastContext } from "../context/ToastContext.js";

/**
 * Acceso al sistema de notificaciones:
 *   const toast = useToast();
 *   toast.success("Evento registrado", "Quedó en estado Pendiente.");
 *   toast.error("No se pudo guardar", error.message);
 */
export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast tiene que usarse dentro de <ToastProvider>.");
  }
  return context;
}

export default useToast;
