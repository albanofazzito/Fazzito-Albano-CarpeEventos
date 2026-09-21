/**
 * Messages.js
 * Enum (objeto congelado) que centraliza TODOS los mensajes de la aplicación.
 * Ningún controller/service debería escribir un string de mensaje "a mano":
 * siempre se referencia una clave de este objeto.
 */
export const Messages = Object.freeze({
  // Genéricos
  INVALID_DATA: "Los datos enviados son inválidos.",
  DUPLICATED_RESOURCE: "El recurso ya existe.",
  INTERNAL_SERVER_ERROR: "Ocurrió un error interno en el servidor.",
  ROUTE_NOT_FOUND: "La ruta solicitada no existe.",

  // Cliente
  CLIENTE_NOT_FOUND: "El cliente no existe.",
  CLIENTE_DUPLICADO: "Ya existe un cliente registrado con ese email o teléfono.",
  CLIENTE_CAMPOS_OBLIGATORIOS: "Nombre, apellido, teléfono y email son obligatorios.",
  CLIENTE_EMAIL_INVALIDO: "El formato del email no es válido.",
  CLIENTE_TELEFONO_INVALIDO: "El formato del teléfono no es válido.",

  // Servicio
  SERVICIO_NOT_FOUND: "El servicio no existe.",
  SERVICIO_CAMPOS_OBLIGATORIOS: "Nombre, precio y categoría son obligatorios.",
  SERVICIO_PRECIO_INVALIDO: "El precio debe ser un número mayor a cero.",

  // Evento (entidad principal del CRUD)
  EVENTO_NOT_FOUND: "El evento no existe.",
  EVENTO_CAMPOS_OBLIGATORIOS:
    "Fecha, horaInicio, horaFin, cantidadInvitados, clienteId y servicioId son obligatorios.",
  EVENTO_FECHA_INVALIDA: "La fecha debe tener formato AAAA-MM-DD y ser una fecha futura.",
  EVENTO_HORARIO_INVALIDO: "El formato de horario debe ser HH:mm y horaFin debe ser posterior a horaInicio.",
  EVENTO_CANTIDAD_INVITADOS_INVALIDA: "La cantidad de invitados debe ser un número entero mayor a cero.",
  EVENTO_ESTADO_INVALIDO: "El estado indicado no es un estado válido del sistema.",
  EVENTO_TRANSICION_INVALIDA: "No se puede cambiar el evento a ese estado desde su estado actual.",
  EVENTO_FECHA_NO_DISPONIBLE:
    "Ya existe otro evento Confirmado o En curso en esa fecha y horario. Elegí otra fecha/horario.",
  EVENTO_NO_SE_PUEDE_ELIMINAR:
    "No se puede eliminar un evento Confirmado, En curso o Finalizado. Cancelalo primero.",
});

export default Messages;
