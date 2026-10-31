import { useId } from "react";
import { Link } from "react-router";
import ArrowRightIcon from "../../assets/icons/arrow-right.svg?react";
import { formatPrecio } from "../../utils/formatters.js";
import { paths } from "../../utils/routes.js";
import Skeleton from "../ui/Skeleton.jsx";
import ServicioIcon from "./ServicioIcon.jsx";
import styles from "./ServicioCard.module.css";

/** Tarjeta de la grilla "Servicios estrella": ícono, nombre, descripción y precio. */
export default function ServicioCard({ servicio }) {
  const tituloId = useId();

  return (
    <article className={styles.card} aria-labelledby={tituloId}>
      <div className={styles.media}>
        <ServicioIcon categoria={servicio.categoria} className={styles.icon} />
      </div>
      <div className={styles.body}>
        <p className={styles.categoria}>{servicio.categoria}</p>
        <h3 id={tituloId} className={styles.nombre}>
          {servicio.nombre}
        </h3>
        <p className={styles.descripcion}>{servicio.descripcion}</p>
        <p className={styles.precio}>
          <span className={styles.desde}>Desde</span> {formatPrecio(servicio.precio)}
        </p>
      </div>
      <Link to={paths.nuevoEvento(servicio.id)} className={styles.link}>
        Consultar fecha
        <span className="visually-hidden"> para {servicio.nombre}</span>
        <ArrowRightIcon className={styles.linkIcon} />
      </Link>
    </article>
  );
}

/** Versión "esqueleto" de la tarjeta mientras se cargan los servicios. */
export function ServicioCardSkeleton() {
  return (
    <div className={styles.card} aria-hidden="true">
      <div className={styles.media}>
        <Skeleton width="3.5rem" height="3.5rem" />
      </div>
      <div className={styles.body}>
        <Skeleton width="40%" height="0.75rem" />
        <Skeleton width="80%" height="1.4rem" />
        <Skeleton height="0.9rem" />
        <Skeleton width="65%" height="0.9rem" />
      </div>
    </div>
  );
}
