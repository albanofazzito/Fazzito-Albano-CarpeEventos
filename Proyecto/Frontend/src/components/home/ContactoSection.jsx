import { Link } from "react-router";
import ClockIcon from "../../assets/icons/clock.svg?react";
import MailIcon from "../../assets/icons/mail.svg?react";
import MapPinIcon from "../../assets/icons/map-pin.svg?react";
import WhatsappIcon from "../../assets/icons/whatsapp.svg?react";
import { cx } from "../../utils/classNames.js";
import { DIRECCION_COMPLETA, MENSAJE_WHATSAPP_CONSULTA, NEGOCIO } from "../../utils/constants.js";
import { buildMapsUrl, buildTelUrl, buildWhatsAppUrl } from "../../utils/links.js";
import { paths, SECCIONES } from "../../utils/routes.js";
import Button from "../ui/Button.jsx";
import ExternalLink from "../ui/ExternalLink.jsx";
import SectionHeading from "../ui/SectionHeading.jsx";
import styles from "./ContactoSection.module.css";

/** Sección 5 del boceto: datos de contacto a la izquierda y CTA de WhatsApp a la derecha. */
export default function ContactoSection() {
  const { horarioConsultas } = NEGOCIO;

  return (
    <section
      id={SECCIONES.contacto}
      className={cx(styles.section, "surface-dark")}
      aria-labelledby="contacto-titulo"
      tabIndex={-1}
    >
      <div className={cx("container", styles.grid)}>
        <div>
          <SectionHeading
            id="contacto-titulo"
            eyebrow="Hablemos"
            title="Contacto y presupuesto"
            subtitle="Contanos qué querés celebrar y te pasamos disponibilidad y presupuesto, sin compromiso."
            align="start"
          />

          <dl className={styles.datos}>
            <div className={styles.dato}>
              <dt>
                <WhatsappIcon className={styles.icon} />
                WhatsApp
              </dt>
              <dd>
                <a href={buildTelUrl(NEGOCIO.whatsapp)}>{NEGOCIO.whatsapp}</a>
              </dd>
            </div>
            <div className={styles.dato}>
              <dt>
                <MailIcon className={styles.icon} />
                Email
              </dt>
              <dd>
                <a href={`mailto:${NEGOCIO.email}`}>{NEGOCIO.email}</a>
              </dd>
            </div>
            <div className={styles.dato}>
              <dt>
                <ClockIcon className={styles.icon} />
                Horario de consultas
              </dt>
              <dd>
                {horarioConsultas.dias} de {horarioConsultas.horas}
              </dd>
            </div>
            <div className={styles.dato}>
              <dt>
                <MapPinIcon className={styles.icon} />
                Dirección
              </dt>
              <dd>
                {DIRECCION_COMPLETA}.{" "}
                <ExternalLink href={buildMapsUrl(`${DIRECCION_COMPLETA}, Argentina`)}>Cómo llegar</ExternalLink>
              </dd>
            </div>
          </dl>
        </div>

        <div className={styles.cta}>
          <p className={styles.ctaTitulo}>La forma más rápida de reservar</p>
          <p className={styles.ctaTexto}>
            Te respondemos por WhatsApp con las fechas libres y un presupuesto según la cantidad de invitados.
          </p>
          <Button
            href={buildWhatsAppUrl(NEGOCIO.whatsapp, MENSAJE_WHATSAPP_CONSULTA)}
            external
            size="lg"
            icon={WhatsappIcon}
            fullWidth
          >
            Escribinos por WhatsApp
          </Button>
          <p className={styles.alternativa}>
            ¿Preferís dejar los datos online? <Link to={paths.nuevoEvento()}>Cargá tu solicitud</Link>
          </p>
        </div>
      </div>
    </section>
  );
}
