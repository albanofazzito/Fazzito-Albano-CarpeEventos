import { Link } from "react-router";
import SparkleIcon from "../../assets/icons/sparkle.svg?react";
import { cx } from "../../utils/classNames.js";
import { NEGOCIO } from "../../utils/constants.js";
import { paths } from "../../utils/routes.js";
import styles from "./Logo.module.css";

/** Logotipo tipográfico: "Carpe" en Playfair Display y "Eventos" en versalitas. */
export default function Logo({ className, onClick }) {
  return (
    <Link to={paths.home} className={cx(styles.logo, className)} aria-label={`${NEGOCIO.nombre}, ir al inicio`} onClick={onClick}>
      <SparkleIcon className={styles.mark} />
      <span className={styles.text}>
        <span className={styles.name}>Carpe</span>
        <span className={styles.tagline}>Eventos</span>
      </span>
    </Link>
  );
}
