/**
 * Datos fijos del negocio, tomados de la ficha técnica de Carpe Eventos.
 * Se usan en varias secciones (contacto, footer, enlaces de WhatsApp), así
 * que viven en un solo lugar en vez de repetirse dentro de los componentes.
 */
export const NEGOCIO = Object.freeze({
  nombre: "Carpe Eventos",
  rubro: "Salón de fiestas",
  anioInicio: 2018,
  direccion: {
    calle: "Bruselas 1088",
    barrio: "Versalles",
    ciudad: "CABA",
    codigoPostal: "1408",
  },
  whatsapp: "+54 9 11 5833-5464",
  email: "maju0369@hotmail.com",
  horarioConsultas: {
    dias: "Lunes a viernes",
    diasAbreviado: "Lun. a vie.",
    horas: "17:00 a 20:00",
  },
  redes: {
    facebook: { usuario: "carpeeventosargentina", url: "https://www.facebook.com/carpeeventosargentina" },
    instagram: { usuario: "@carpeeventos", url: "https://www.instagram.com/carpeeventos" },
  },
});

export const DIRECCION_COMPLETA = `${NEGOCIO.direccion.calle}, ${NEGOCIO.direccion.barrio}, ${NEGOCIO.direccion.ciudad}`;

export const MENSAJE_WHATSAPP_CONSULTA =
  "¡Hola! Quiero consultar disponibilidad y presupuesto para un evento en Carpe Eventos.";
