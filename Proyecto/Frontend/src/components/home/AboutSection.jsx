import { FOTOS } from "../../assets/images/index.js";
import { cx } from "../../utils/classNames.js";
import { NEGOCIO } from "../../utils/constants.js";
import { SECCIONES } from "../../utils/routes.js";
import SectionHeading from "../ui/SectionHeading.jsx";
import styles from "./AboutSection.module.css";

/** Sección 3 del boceto: texto y filosofía Carpe Diem a la izquierda, foto del salón a la derecha. */
export default function AboutSection() {
  return (
    <section id={SECCIONES.nosotros} className={styles.section} aria-labelledby="nosotros-titulo" tabIndex={-1}>
      <div className={cx("container", styles.grid)}>
        <div className={styles.text}>
          <SectionHeading id="nosotros-titulo" eyebrow="Quiénes somos" title="Sobre nosotros" align="start" />

          <p className={styles.lema}>
            <span lang="la">Carpe Diem</span>: aprovechá el momento.
          </p>
          <p>
            Somos un salón de eventos en el barrio de {NEGOCIO.direccion.barrio}, abierto desde {NEGOCIO.anioInicio}.
            El nombre viene de <span lang="la">“Carpe Diem”</span>, y esa es la idea con la que preparamos cada fiesta:
            que vos y tus invitados disfruten sin preocuparse por nada más.
          </p>
          <p>
            Organizamos cumpleaños infantiles y de adultos, bautismos, comuniones y casamientos. Además del salón,
            sumamos catering, animación, DJ y decoración temática para armar cada celebración a tu medida.
          </p>

          <ul className={styles.highlights}>
            <li>
              <strong>Desde {NEGOCIO.anioInicio}</strong>
              <span>en {NEGOCIO.direccion.barrio}</span>
            </li>
            <li>
              <strong>Servicio integral</strong>
              <span>catering, DJ y decoración</span>
            </li>
            <li>
              <strong>Trato cercano</strong>
              <span>te atendemos por WhatsApp</span>
            </li>
          </ul>
        </div>

        <figure className={styles.figure}>
          <div className={styles.frame}>
            <img
              src={FOTOS.salon.src}
              alt={FOTOS.salon.alt}
              width={FOTOS.salon.width}
              height={FOTOS.salon.height}
              loading="lazy"
            />
          </div>
          <figcaption className={styles.caption}>El salón, listo para recibir a los más chicos.</figcaption>
        </figure>
      </div>
    </section>
  );
}
