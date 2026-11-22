/**
 * negocio.config.js
 * Datos del salón que usan las reglas de negocio. Son los puntos que el
 * análisis del sistema (sección 8) dejaba "a confirmar con el negocio";
 * se toman estos valores y quedan en un solo lugar para poder ajustarlos
 * sin tocar la lógica.
 */
export const NEGOCIO = Object.freeze({
  nombre: "Carpe Eventos",

  // Aforo: ningún evento puede superar esta cantidad de invitados.
  capacidadMaxima: 150,

  // Cotización: el precio de cada servicio incluye hasta esta cantidad de
  // invitados; cada invitado adicional suma un recargo fijo.
  invitadosIncluidos: 50,
  precioInvitadoAdicional: 6000,
});

export default NEGOCIO;
