import { FOTOS } from "../../assets/images/index.js";
import InstagramIcon from "../../assets/icons/instagram.svg?react";
import { cx } from "../../utils/classNames.js";
import { NEGOCIO } from "../../utils/constants.js";
import { SECCIONES } from "../../utils/routes.js";
import ExternalLink from "../ui/ExternalLink.jsx";
import SectionHeading from "../ui/SectionHeading.jsx";
import styles from "./GaleriaSection.module.css";

const FOTOS_GALERIA = [
  { ...FOTOS.salon, caption: "El salón ambientado para un cumpleaños infantil" },
  { ...FOTOS.fiesta, caption: "Luces, música y globos en la pista" },
];

/**
 * La barra de navegación del boceto incluye "Galería", pero el wireframe no
 * tenía esa sección: se agrega para que el enlace lleve a algún lugar, con
 * las fotos del salón y un acceso al resto en Instagram.
 */
export default function GaleriaSection() {
  return (
    <section id={SECCIONES.galeria} className={styles.section} aria-labelledby="galeria-titulo" tabIndex={-1}>
      <div className="container">
        <SectionHeading id="galeria-titulo" eyebrow="Galería" title="Así se vive una fiesta en Carpe" />

        <ul className={styles.grid}>
          {FOTOS_GALERIA.map((foto) => (
            <li key={foto.src}>
              <figure className={styles.figure}>
                <img src={foto.src} alt={foto.alt} width={foto.width} height={foto.height} loading="lazy" />
                <figcaption className={styles.caption}>{foto.caption}</figcaption>
              </figure>
            </li>
          ))}
          <li className={cx(styles.instagram, "surface-dark")}>
            <InstagramIcon className={styles.instagramIcon} />
            <p className={styles.instagramText}>Mirá más fotos de cumpleaños, bautismos y casamientos que celebramos.</p>
            <ExternalLink href={NEGOCIO.redes.instagram.url} className={styles.instagramLink}>
              Seguinos en {NEGOCIO.redes.instagram.usuario}
            </ExternalLink>
          </li>
        </ul>
      </div>
    </section>
  );
}
