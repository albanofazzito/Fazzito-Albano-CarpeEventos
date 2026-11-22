import { useId } from "react";
import { Link } from "react-router";
import EditIcon from "../../assets/icons/edit.svg?react";
import MailIcon from "../../assets/icons/mail.svg?react";
import PhoneIcon from "../../assets/icons/phone.svg?react";
import TrashIcon from "../../assets/icons/trash.svg?react";
import { formatNombreCompleto } from "../../utils/formatters.js";
import { paths } from "../../utils/routes.js";
import Button from "../ui/Button.jsx";
import styles from "./ClienteItem.module.css";

/**
 * Fila del listado de clientes. "Eliminar" solo aparece si el cliente no
 * tiene eventos: la API no permite borrar a alguien con historial.
 */
export default function ClienteItem({ cliente, onEditar, onEliminar }) {
  const tituloId = useId();
  const nombre = formatNombreCompleto(cliente);

  return (
    <article className={styles.item} aria-labelledby={tituloId}>
      <div className={styles.info}>
        <h2 id={tituloId} className={styles.nombre}>
          <Link to={paths.cliente(cliente.id)}>{nombre}</Link>
        </h2>
        <ul className={styles.meta}>
          <li>
            <PhoneIcon className={styles.icon} />
            <span className="visually-hidden">Teléfono: </span>
            {cliente.telefono}
          </li>
          <li>
            <MailIcon className={styles.icon} />
            <span className="visually-hidden">Email: </span>
            {cliente.email}
          </li>
        </ul>
        <ul className={styles.etiquetas}>
          <li className={styles.etiqueta}>{cliente.tieneCuenta ? "Tiene cuenta en la web" : "Cargado por el salón"}</li>
          <li className={styles.etiqueta}>
            {cliente.cantidadEventos === 1 ? "1 evento" : `${cliente.cantidadEventos} eventos`}
          </li>
        </ul>
      </div>

      <div className={styles.acciones}>
        <Button to={paths.cliente(cliente.id)} variant="outline" size="sm">
          Ver ficha<span className="visually-hidden"> de {nombre}</span>
        </Button>
        <Button variant="ghost" size="sm" icon={EditIcon} onClick={() => onEditar(cliente)}>
          Editar<span className="visually-hidden"> a {nombre}</span>
        </Button>
        {cliente.cantidadEventos === 0 && (
          <Button variant="dangerGhost" size="sm" icon={TrashIcon} onClick={() => onEliminar(cliente)}>
            Eliminar<span className="visually-hidden"> a {nombre}</span>
          </Button>
        )}
      </div>
    </article>
  );
}
