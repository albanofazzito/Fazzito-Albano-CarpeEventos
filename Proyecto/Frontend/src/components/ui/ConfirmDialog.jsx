import AlertCircleIcon from "../../assets/icons/alert-circle.svg?react";
import Button from "./Button.jsx";
import Modal from "./Modal.jsx";
import styles from "./ConfirmDialog.module.css";

/**
 * Pide confirmación antes de una acción que no se puede deshacer (eliminar,
 * cancelar un evento). El botón para volver va primero, así es el que recibe
 * el foco al abrirse y un Enter apurado no ejecuta la acción.
 */
export default function ConfirmDialog({
  open,
  title,
  description,
  children,
  confirmLabel = "Confirmar",
  cancelLabel = "Volver",
  loading = false,
  onConfirm,
  onCancel,
}) {
  const cerrar = () => {
    if (!loading) onCancel();
  };

  return (
    <Modal
      open={open}
      onClose={cerrar}
      title={title}
      description={description}
      icon={
        <span className={styles.icon}>
          <AlertCircleIcon />
        </span>
      }
      footer={
        <>
          <Button variant="outline" onClick={cerrar} disabled={loading}>
            {cancelLabel}
          </Button>
          <Button variant="danger" onClick={onConfirm} loading={loading}>
            {confirmLabel}
          </Button>
        </>
      }
    >
      {children}
    </Modal>
  );
}
