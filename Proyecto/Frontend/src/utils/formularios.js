/**
 * Valores iniciales de los formularios de cliente y servicio. Los inputs
 * trabajan con strings, así que los números se convierten al cargar.
 */
export const CLIENTE_FORM_VACIO = Object.freeze({ nombre: "", apellido: "", telefono: "", email: "" });

export const SERVICIO_FORM_VACIO = Object.freeze({ nombre: "", categoria: "", descripcion: "", precio: "" });

export function clienteToFormValues(cliente) {
  return {
    nombre: cliente.nombre,
    apellido: cliente.apellido,
    telefono: cliente.telefono,
    email: cliente.email,
  };
}

export function servicioToFormValues(servicio) {
  return {
    nombre: servicio.nombre,
    categoria: servicio.categoria,
    descripcion: servicio.descripcion ?? "",
    precio: String(servicio.precio),
  };
}
