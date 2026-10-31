/** IDs de las secciones de la landing, usados por la navegación con anclas (/#servicios). */
export const SECCIONES = Object.freeze({
  inicio: "inicio",
  nosotros: "nosotros",
  servicios: "servicios",
  galeria: "galeria",
  contacto: "contacto",
});

/** Rutas de la aplicación, para no escribir las URLs a mano en cada componente. */
export const paths = {
  home: "/",
  seccion: (id) => `/#${id}`,
  eventos: "/eventos",
  nuevoEvento: (servicioId) => (servicioId ? `/eventos/nuevo?servicio=${servicioId}` : "/eventos/nuevo"),
  evento: (id) => `/eventos/${id}`,
  editarEvento: (id) => `/eventos/${id}/editar`,
};
