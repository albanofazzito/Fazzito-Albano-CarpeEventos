import { useId } from "react";
import EditIcon from "../../assets/icons/edit.svg?react";
import RefreshIcon from "../../assets/icons/refresh.svg?react";
import TrashIcon from "../../assets/icons/trash.svg?react";
import { cx } from "../../utils/classNames.js";
import { formatPrecio } from "../../utils/formatters.js";
import Button from "../ui/Button.jsx";
import ServicioIcon from "./ServicioIcon.jsx";
import styles from "./ServicioAdminItem.module.css";

/** Fila del catálogo en el panel del administrador. */
export default function ServicioAdminItem({ servicio, procesando, onEditar, onDarDeBaja, onReactivar }) {
  const tituloId = useId();

  return (
    <article className={cx(styles.item, !servicio.activo && styles.inactivo)} aria-labelledby={tituloId}>
      <ServicioIcon categoria={servicio.categoria} className={styles.icon} />

      <div className={styles.info}>
        <p className={styles.categoria}>{servicio.categoria}</p>
        <h2 id={tituloId} className={styles.nombre}>
          {servicio.nombre}
          {!servicio.activo && <span className={styles.estado}>Dado de baja</span>}
        </h2>
        {servicio.descripcion && <p className={styles.descripcion}>{servicio.descripcion}</p>}
      </div>

      <p className={styles.precio}>
        <span className="visually-hidden">Precio: </span>
        {formatPrecio(servicio.precio)}
      </p>

      <div className={styles.acciones}>
        <Button variant="ghost" size="sm" icon={EditIcon} disabled={procesando} onClick={() => onEditar(servicio)}>
          Editar<span className="visually-hidden"> {servicio.nombre}</span>
        </Button>
        {servicio.activo ? (
          <Button variant="dangerGhost" size="sm" icon={TrashIcon} disabled={procesando} onClick={() => onDarDeBaja(servicio)}>
            Dar de baja<span className="visually-hidden"> {servicio.nombre}</span>
          </Button>
        ) : (
          <Button variant="outline" size="sm" icon={RefreshIcon} loading={procesando} onClick={() => onReactivar(servicio)}>
            Reactivar<span className="visually-hidden"> {servicio.nombre}</span>
          </Button>
        )}
      </div>
    </article>
  );
}
