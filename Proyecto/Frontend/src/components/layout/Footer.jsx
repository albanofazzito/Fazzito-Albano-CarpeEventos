import FacebookIcon from "../../assets/icons/facebook.svg?react";
import InstagramIcon from "../../assets/icons/instagram.svg?react";
import { cx } from "../../utils/classNames.js";
import { DIRECCION_COMPLETA, NEGOCIO } from "../../utils/constants.js";
import ExternalLink from "../ui/ExternalLink.jsx";
import Logo from "./Logo.jsx";
import styles from "./Footer.module.css";

const ANIO_ACTUAL = new Date().getFullYear();

export default function Footer() {
  const { horarioConsultas, direccion, redes } = NEGOCIO;

  return (
    <footer className={cx(styles.footer, "surface-dark")}>
      <div className={cx("container", styles.grid)}>
        <div className={styles.brand}>
          <Logo />
          <address className={styles.address}>
            <span>
              {DIRECCION_COMPLETA} (CP {direccion.codigoPostal})
            </span>
            <span>
              Consultas: {horarioConsultas.diasAbreviado} de {horarioConsultas.horas}
            </span>
          </address>
        </div>

        <nav aria-label="Redes sociales">
          <ul className={styles.social}>
            <li>
              <ExternalLink href={redes.facebook.url} className={styles.socialLink}>
                <FacebookIcon className={styles.socialIcon} />
                <span>
                  <span className="visually-hidden">Facebook: </span>
                  facebook.com/{redes.facebook.usuario}
                </span>
              </ExternalLink>
            </li>
            <li>
              <ExternalLink href={redes.instagram.url} className={styles.socialLink}>
                <InstagramIcon className={styles.socialIcon} />
                <span>
                  <span className="visually-hidden">Instagram: </span>
                  {redes.instagram.usuario}
                </span>
              </ExternalLink>
            </li>
          </ul>
        </nav>

        <p className={styles.copy}>
          © {ANIO_ACTUAL} {NEGOCIO.nombre}
        </p>
      </div>
    </footer>
  );
}
