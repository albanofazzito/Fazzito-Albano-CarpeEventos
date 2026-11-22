/** IDs de las secciones de la landing, usados por la navegación con anclas (/#servicios). */
export const SECCIONES = Object.freeze({
  inicio: "inicio",
  nosotros: "nosotros",
  servicios: "servicios",
  galeria: "galeria",
  contacto: "contacto",
});

/** "/eventos/nuevo" + { servicio: 2, fecha: "" } -> "/eventos/nuevo?servicio=2" */
function conParametros(ruta, parametros = {}) {
  const query = new URLSearchParams();
  Object.entries(parametros).forEach(([clave, valor]) => {
    if (valor !== undefined && valor !== null && valor !== "") query.set(clave, valor);
  });
  const texto = query.toString();
  return texto ? `${ruta}?${texto}` : ruta;
}

/** Rutas de la aplicación, para no escribir las URLs a mano en cada componente. */
export const paths = {
  home: "/",
  seccion: (id) => `/#${id}`,
  disponibilidad: "/disponibilidad",
  ingresar: "/ingresar",
  registro: "/registro",
  miCuenta: "/mi-cuenta",
  eventos: "/eventos",
  /** Parámetros opcionales: { servicio, fecha, cliente } para precargar el formulario. */
  nuevoEvento: (parametros) => conParametros("/eventos/nuevo", parametros),
  evento: (id) => `/eventos/${id}`,
  editarEvento: (id) => `/eventos/${id}/editar`,
  clientes: "/clientes",
  cliente: (id) => `/clientes/${id}`,
  catalogo: "/catalogo",
};

/**
 * A dónde ir después de ingresar o registrarse: la pantalla protegida que
 * se quiso abrir (RequireAuth la guarda en location.state.desde) o el panel.
 */
export function getDestinoTrasIngresar(location) {
  const desde = location.state?.desde;
  return desde ? `${desde.pathname}${desde.search ?? ""}` : paths.eventos;
}
