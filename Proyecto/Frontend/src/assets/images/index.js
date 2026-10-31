import fiestaLuces from "./fiesta-luces.jpg";
import salonInterior from "./salon-interior.jpg";

/**
 * Fotos reales del salón (incluidas en la ficha técnica del negocio). Cada
 * una lleva su texto alternativo acá, para que sea el mismo en todas las
 * secciones donde se usa.
 */
export const FOTOS = Object.freeze({
  salon: {
    src: salonInterior,
    width: 281,
    height: 308,
    alt: "Interior del salón preparado para un cumpleaños infantil: mesas bajas, puffs de colores y globos frente al ventanal.",
  },
  fiesta: {
    src: fiestaLuces,
    width: 168,
    height: 300,
    alt: "Fiesta en el salón con luces de colores en la pista, guirnaldas de estrellas y un arco de globos rojos, blancos y negros.",
  },
});
