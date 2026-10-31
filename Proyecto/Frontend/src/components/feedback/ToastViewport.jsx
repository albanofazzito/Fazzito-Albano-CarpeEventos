import Toast from "./Toast.jsx";
import styles from "./Toast.module.css";

/**
 * Contenedor fijo de las notificaciones (arriba a la derecha). La lista es
 * una región aria-live que existe desde el inicio, así los lectores de
 * pantalla anuncian cada notificación nueva apenas aparece.
 */
export default function ToastViewport({ toasts, onDismiss }) {
  return (
    <section className={styles.viewport} aria-label="Notificaciones">
      <ol className={styles.list} aria-live="polite" aria-relevant="additions text">
        {toasts.map((toast) => (
          <Toast key={toast.id} toast={toast} onDismiss={onDismiss} />
        ))}
      </ol>
    </section>
  );
}
