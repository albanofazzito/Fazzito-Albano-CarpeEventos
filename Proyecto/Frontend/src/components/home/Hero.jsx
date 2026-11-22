import { FOTOS } from "../../assets/images/index.js";
import CalendarIcon from "../../assets/icons/calendar.svg?react";
import { cx } from "../../utils/classNames.js";
import { NEGOCIO } from "../../utils/constants.js";
import { paths, SECCIONES } from "../../utils/routes.js";
import Button from "../ui/Button.jsx";
import styles from "./Hero.module.css";

/**
 * Sección 2 del boceto: foto de fondo, título principal y CTA "Consultá tu
 * fecha". Se suma un acceso secundario al calendario de fechas libres.
 */
export default function Hero() {
  return (
    <section
      id={SECCIONES.inicio}
      className={cx(styles.hero, "surface-dark")}
      aria-labelledby="hero-titulo"
      tabIndex={-1}
    >
      <div className={styles.background} style={{ backgroundImage: `url(${FOTOS.fiesta.src})` }} aria-hidden="true" />

      <div className={cx("container", styles.inner)}>
        <div className={styles.content}>
          <p className={styles.eyebrow}>
            {NEGOCIO.rubro} · {NEGOCIO.direccion.barrio}, {NEGOCIO.direccion.ciudad}
          </p>
          <h1 id="hero-titulo" className={styles.title}>
            Celebrá tus momentos con nosotros
          </h1>
          <p className={styles.subtitle}>
            Desde cumpleaños hasta bodas, todo en un solo lugar: salón, catering, animación, DJ y decoración.
          </p>
          <div className={styles.acciones}>
            <Button to={paths.nuevoEvento()} size="lg" icon={CalendarIcon}>
              Consultá tu fecha
            </Button>
            <Button to={paths.disponibilidad} size="lg" variant="outline">
              Ver fechas libres
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
