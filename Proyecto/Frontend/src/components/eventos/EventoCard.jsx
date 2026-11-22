import { useId } from "react";
import ClockIcon from "../../assets/icons/clock.svg?react";
import EditIcon from "../../assets/icons/edit.svg?react";
import TagIcon from "../../assets/icons/tag.svg?react";
import TrashIcon from "../../assets/icons/trash.svg?react";
import UserIcon from "../../assets/icons/user.svg?react";
import UsersIcon from "../../assets/icons/users.svg?react";
import { puedeEditarse, puedeEliminarse } from "../../utils/estados.js";
import { formatHorario, formatInvitados, formatNombreCompleto, formatPrecio } from "../../utils/formatters.js";
import { paths } from "../../utils/routes.js";
import Button from "../ui/Button.jsx";
import EstadoBadge from "./EstadoBadge.jsx";
import FechaBloque from "./FechaBloque.jsx";
import styles from "./EventoCard.module.css";

/**
 * Fila del listado de eventos. Solo muestra "Editar" y "Eliminar" cuando el
 * estado del evento lo permite (las mismas reglas que valida la API).
 * "Eliminar" aparece solo si se pasa `onEliminar` (lo hace el panel del
 * administrador); el cliente cancela sus reservas desde el detalle.
 */
export default function EventoCard({ evento, onEliminar, mostrarCliente = true, headingLevel = 2 }) {
  const tituloId = useId();
  const Heading = `h${headingLevel}`;
  const nombreServicio = evento.servicio?.nombre ?? "Servicio no disponible";
  const contexto = `${nombreServicio} de ${formatNombreCompleto(evento.cliente)}`;
  const { presupuesto } = evento;

  return (
    <article className={styles.card} aria-labelledby={tituloId}>
      <FechaBloque fecha={evento.fecha} />

      <div className={styles.info}>
        <div className={styles.encabezado}>
          <Heading id={tituloId} className={styles.titulo}>
            {nombreServicio}
          </Heading>
          <EstadoBadge estado={evento.estado} />
        </div>
        <ul className={styles.meta}>
          {mostrarCliente && (
            <li>
              <UserIcon className={styles.metaIcon} />
              <span className="visually-hidden">Cliente: </span>
              {formatNombreCompleto(evento.cliente)}
            </li>
          )}
          <li>
            <ClockIcon className={styles.metaIcon} />
            <span className="visually-hidden">Horario: </span>
            {formatHorario(evento.horaInicio, evento.horaFin)}
          </li>
          <li>
            <UsersIcon className={styles.metaIcon} />
            {formatInvitados(evento.cantidadInvitados)}
          </li>
          <li>
            <TagIcon className={styles.metaIcon} />
            {presupuesto
              ? `Presupuesto ${formatPrecio(presupuesto.montoTotal)} (${presupuesto.estado.toLowerCase()})`
              : "Sin presupuesto todavía"}
          </li>
        </ul>
      </div>

      <div className={styles.acciones}>
        <Button to={paths.evento(evento.id)} variant="outline" size="sm">
          Ver detalle<span className="visually-hidden"> de {contexto}</span>
        </Button>
        {puedeEditarse(evento.estado) && (
          <Button to={paths.editarEvento(evento.id)} variant="ghost" size="sm" icon={EditIcon}>
            Editar<span className="visually-hidden"> {contexto}</span>
          </Button>
        )}
        {onEliminar && puedeEliminarse(evento.estado) && (
          <Button variant="dangerGhost" size="sm" icon={TrashIcon} onClick={() => onEliminar(evento)}>
            Eliminar<span className="visually-hidden"> {contexto}</span>
          </Button>
        )}
      </div>
    </article>
  );
}
