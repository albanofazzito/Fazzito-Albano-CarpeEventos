import CakeIcon from "../../assets/icons/servicios/cake.svg?react";
import CandleIcon from "../../assets/icons/servicios/candle.svg?react";
import RingsIcon from "../../assets/icons/servicios/rings.svg?react";
import SparklesIcon from "../../assets/icons/servicios/sparkles.svg?react";

// Las categorías son las que devuelve la API en /api/servicios.
const ICONO_POR_CATEGORIA = {
  "Cumpleaños": CakeIcon,
  "Bodas": RingsIcon,
  "Bautismos y comuniones": CandleIcon,
  "Integral": SparklesIcon,
};

/** Ícono ilustrativo de un servicio según su categoría (decorativo). */
export default function ServicioIcon({ categoria, className }) {
  const Icon = ICONO_POR_CATEGORIA[categoria] ?? SparklesIcon;
  return <Icon className={className} />;
}
