import RefreshIcon from "../../assets/icons/refresh.svg?react";
import { useAsync } from "../../hooks/useAsync.js";
import { getServicios } from "../../services/servicio.service.js";
import { SECCIONES } from "../../utils/routes.js";
import ServicioCard, { ServicioCardSkeleton } from "../servicios/ServicioCard.jsx";
import Button from "../ui/Button.jsx";
import SectionHeading from "../ui/SectionHeading.jsx";
import StatusMessage from "../ui/StatusMessage.jsx";
import styles from "./ServiciosSection.module.css";

/** Sección 4 del boceto: grilla de servicios, cargada desde la API (/api/servicios). */
export default function ServiciosSection() {
  const { data: servicios, loading, error, reload } = useAsync(getServicios);

  return (
    <section id={SECCIONES.servicios} className={styles.section} aria-labelledby="servicios-titulo" tabIndex={-1}>
      <div className="container">
        <SectionHeading
          id="servicios-titulo"
          eyebrow="Lo que ofrecemos"
          title="Servicios estrella"
          subtitle="Todo lo que necesitás para tu celebración"
        />

        {loading && (
          <div role="status">
            <span className="visually-hidden">Cargando servicios…</span>
            <ul className={styles.grid} aria-hidden="true">
              {[1, 2, 3, 4].map((n) => (
                <li key={n}>
                  <ServicioCardSkeleton />
                </li>
              ))}
            </ul>
          </div>
        )}

        {error && (
          <StatusMessage
            tone="error"
            title="No pudimos cargar los servicios"
            headingLevel={3}
            action={
              <Button variant="outline" icon={RefreshIcon} onClick={reload}>
                Reintentar
              </Button>
            }
          >
            {error.message}
          </StatusMessage>
        )}

        {servicios?.length === 0 && (
          <StatusMessage tone="info" title="Estamos actualizando el catálogo" headingLevel={3}>
            Escribinos por WhatsApp y te contamos todas las opciones disponibles.
          </StatusMessage>
        )}

        {servicios?.length > 0 && (
          <ul className={styles.grid}>
            {servicios.map((servicio) => (
              <li key={servicio.id}>
                <ServicioCard servicio={servicio} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
