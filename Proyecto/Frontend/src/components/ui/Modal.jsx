import { useEffect, useId, useRef } from "react";
import styles from "./Modal.module.css";

/**
 * Ventana modal basada en <dialog> nativo: el navegador ya se encarga de
 * atrapar el foco dentro, de bloquear el resto de la página y de cerrar con
 * Escape. Acá solo se sincroniza con la prop `open` y se devuelve el foco al
 * elemento que la abrió (o al contenido principal, si ese elemento ya no existe).
 */
export default function Modal({ open, onClose, title, description, children, footer, icon }) {
  const dialogRef = useRef(null);
  const elementoPrevio = useRef(null);
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open && !dialog.open) {
      elementoPrevio.current = document.activeElement;
      dialog.showModal();
    } else if (!open && dialog.open) {
      dialog.close();
      const destino = elementoPrevio.current?.isConnected ? elementoPrevio.current : document.getElementById("contenido");
      destino?.focus();
    }
  }, [open]);

  function handleCancel(event) {
    // Escape: el estado lo maneja React, no el navegador.
    event.preventDefault();
    onClose();
  }

  function handleClick(event) {
    // Un clic sobre el fondo oscuro llega al propio <dialog>, no a su contenido.
    if (event.target === event.currentTarget) onClose();
  }

  return (
    // El clic en el fondo es un atajo de mouse; con teclado se cierra con Escape (evento cancel).
    // oxlint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-noninteractive-element-interactions
    <dialog
      ref={dialogRef}
      className={styles.dialog}
      aria-labelledby={titleId}
      aria-describedby={description ? descriptionId : undefined}
      onCancel={handleCancel}
      onClick={handleClick}
    >
      <div className={styles.content}>
        {icon && <div className={styles.icon}>{icon}</div>}
        <h2 id={titleId} className={styles.title}>
          {title}
        </h2>
        {description && (
          <p id={descriptionId} className={styles.description}>
            {description}
          </p>
        )}
        {children && <div className={styles.body}>{children}</div>}
        {footer && <div className={styles.footer}>{footer}</div>}
      </div>
    </dialog>
  );
}
