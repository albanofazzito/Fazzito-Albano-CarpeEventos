import { useCallback, useMemo, useRef, useState } from "react";
import { ToastContext } from "./ToastContext.js";
import ToastViewport from "../components/feedback/ToastViewport.jsx";

const MAX_TOASTS = 4;

/**
 * Sistema único de notificaciones de la app: éxitos, errores de la API y
 * avisos se muestran todos como notificaciones laterales (nunca con alert()).
 */
export default function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const nextId = useRef(1);

  const dismiss = useCallback((id) => {
    setToasts((actuales) => actuales.filter((toast) => toast.id !== id));
  }, []);

  const notify = useCallback((type, title, message) => {
    const id = nextId.current++;
    setToasts((actuales) => [...actuales.slice(-(MAX_TOASTS - 1)), { id, type, title, message }]);
    return id;
  }, []);

  const value = useMemo(
    () => ({
      success: (title, message) => notify("success", title, message),
      error: (title, message) => notify("error", title, message),
      info: (title, message) => notify("info", title, message),
      dismiss,
    }),
    [notify, dismiss]
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastViewport toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  );
}
