import { useEffect, useState } from "react";
import AlertCircleIcon from "../../assets/icons/alert-circle.svg?react";
import CheckCircleIcon from "../../assets/icons/check-circle.svg?react";
import InfoIcon from "../../assets/icons/info.svg?react";
import XIcon from "../../assets/icons/x.svg?react";
import { cx } from "../../utils/classNames.js";
import styles from "./Toast.module.css";

// Los errores quedan más tiempo en pantalla porque suelen tener más texto para leer.
const DURACION_MS = { success: 5000, info: 5000, error: 8000 };

const TIPOS = {
  success: { icon: CheckCircleIcon, prefijo: "Listo:" },
  error: { icon: AlertCircleIcon, prefijo: "Error:" },
  info: { icon: InfoIcon, prefijo: "Aviso:" },
};

/** Una notificación. Se cierra sola, salvo mientras el mouse o el foco están encima. */
export default function Toast({ toast, onDismiss }) {
  const [pausada, setPausada] = useState(false);
  const { icon: Icon, prefijo } = TIPOS[toast.type];

  useEffect(() => {
    if (pausada) return undefined;
    const timer = setTimeout(() => onDismiss(toast.id), DURACION_MS[toast.type]);
    return () => clearTimeout(timer);
  }, [pausada, toast.id, toast.type, onDismiss]);

  return (
    // Pausar al pasar el mouse es una ayuda extra: con teclado se pausa al enfocar el botón de cerrar.
    // oxlint-disable-next-line jsx-a11y/no-noninteractive-element-interactions
    <li
      className={cx(styles.toast, styles[toast.type])}
      onMouseEnter={() => setPausada(true)}
      onMouseLeave={() => setPausada(false)}
      onFocus={() => setPausada(true)}
      onBlur={() => setPausada(false)}
    >
      <Icon className={styles.icon} />
      <div className={styles.body}>
        <p className={styles.title}>
          <span className="visually-hidden">{prefijo} </span>
          {toast.title}
        </p>
        {toast.message && <p className={styles.message}>{toast.message}</p>}
      </div>
      <button type="button" className={styles.close} onClick={() => onDismiss(toast.id)}>
        <XIcon />
        <span className="visually-hidden">Cerrar notificación</span>
      </button>
    </li>
  );
}
