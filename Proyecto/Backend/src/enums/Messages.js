import { NEGOCIO } from "../config/negocio.config.js";
import { AUTH } from "../config/auth.config.js";

/**
 * Messages.js
 * Enum (objeto congelado) que centraliza TODOS los mensajes de la aplicación.
 * Ningún controller/service debería escribir un string de mensaje "a mano":
 * siempre se referencia una clave de este objeto.
 */
export const Messages = Object.freeze({
  // Genéricos
  INVALID_DATA: "Los datos enviados son inválidos.",
  INVALID_JSON: "El cuerpo de la petición no es un JSON válido.",
  INVALID_ID: "El identificador indicado no es válido.",
  DUPLICATED_RESOURCE: "El recurso ya existe.",
  INTERNAL_SERVER_ERROR: "Ocurrió un error interno en el servidor.",
  ROUTE_NOT_FOUND: "La ruta solicitada no existe.",

  // Autenticación y permisos
  AUTH_TOKEN_REQUERIDO: "Tenés que iniciar sesión para realizar esta acción.",
  AUTH_TOKEN_INVALIDO: "La sesión no es válida. Volvé a iniciar sesión.",
  AUTH_TOKEN_VENCIDO: "Tu sesión venció. Volvé a iniciar sesión.",
  AUTH_SIN_PERMISO: "Tu usuario no tiene permiso para realizar esta acción.",
  AUTH_LOGIN_CAMPOS_OBLIGATORIOS: "Email y contraseña son obligatorios.",
  AUTH_CREDENCIALES_INVALIDAS: "El email o la contraseña son incorrectos.",
  AUTH_REGISTRO_CAMPOS_OBLIGATORIOS: "Nombre, apellido, teléfono, email y contraseña son obligatorios.",
  AUTH_PASSWORD_INVALIDA: `La contraseña tiene que tener al menos ${AUTH.passwordMinLength} caracteres.`,
  AUTH_EMAIL_REGISTRADO: "Ya existe una cuenta registrada con ese email.",

  // Cliente
  CLIENTE_NOT_FOUND: "El cliente no existe.",
  CLIENTE_DUPLICADO: "Ya existe un cliente registrado con ese email o teléfono.",
  CLIENTE_CAMPOS_OBLIGATORIOS: "Nombre, apellido, teléfono y email son obligatorios.",
  CLIENTE_NOMBRE_INVALIDO: "El nombre y el apellido tienen que tener entre 2 y 60 caracteres.",
  CLIENTE_EMAIL_INVALIDO: "El formato del email no es válido.",
  CLIENTE_TELEFONO_INVALIDO:
    "El teléfono tiene que tener entre 10 y 13 dígitos, con la característica (por ejemplo, 11 5555-0101).",
  CLIENTE_SIN_PERMISO: "Solo podés ver y modificar tus propios datos.",
  CLIENTE_CON_EVENTOS: "No se puede eliminar un cliente con eventos registrados: su historial tiene que conservarse.",

  // Servicio
  SERVICIO_NOT_FOUND: "El servicio no existe.",
  SERVICIO_CAMPOS_OBLIGATORIOS: "Nombre, precio y categoría son obligatorios.",
  SERVICIO_TEXTO_INVALIDO:
    "El nombre y la categoría tienen que tener entre 3 y 60 caracteres, y la descripción hasta 200.",
  SERVICIO_PRECIO_INVALIDO: "El precio debe ser un número mayor a cero.",
  SERVICIO_ACTIVO_INVALIDO: "El campo activo tiene que ser true o false.",
  SERVICIO_NOMBRE_DUPLICADO: "Ya existe un servicio con ese nombre en el catálogo.",
  SERVICIO_INACTIVO: "El servicio elegido ya no está disponible. Elegí otro del catálogo.",
  SERVICIO_CON_RESERVAS_ACTIVAS:
    "No se puede dar de baja un servicio que tiene reservas abiertas. Esperá a que finalicen o cancelalas.",

  // Evento (entidad principal del CRUD)
  EVENTO_NOT_FOUND: "El evento no existe.",
  EVENTO_CAMPOS_OBLIGATORIOS: "Fecha, horaInicio, horaFin, cantidadInvitados y servicioId son obligatorios.",
  EVENTO_CLIENTE_OBLIGATORIO: "Indicá para qué cliente es el evento (clienteId).",
  EVENTO_IDS_INVALIDOS: "clienteId y servicioId tienen que ser números enteros positivos.",
  EVENTO_FECHA_INVALIDA: "La fecha tiene que tener formato AAAA-MM-DD y no puede ser anterior a hoy.",
  EVENTO_HORARIO_INVALIDO: "El formato de horario debe ser HH:mm y horaFin debe ser posterior a horaInicio.",
  EVENTO_HORARIO_PASADO: "El horario de inicio ya pasó. Elegí un horario posterior.",
  EVENTO_CANTIDAD_INVITADOS_INVALIDA: "La cantidad de invitados debe ser un número entero mayor a cero.",
  EVENTO_AFORO_SUPERADO: `La cantidad de invitados supera la capacidad máxima del salón (${NEGOCIO.capacidadMaxima} personas).`,
  EVENTO_ESTADO_INVALIDO: "El estado indicado no es un estado válido del sistema.",
  EVENTO_ESTADO_OBLIGATORIO: "Indicá el estado al que querés pasar el evento.",
  EVENTO_ESTADO_EN_PUT: "El estado no se modifica con PUT: usá PATCH /api/eventos/:id/estado.",
  EVENTO_ESTADO_AUTOMATICO:
    "Ese estado lo asigna el sistema: Presupuestado al generar el presupuesto y Pendiente si el cliente lo rechaza.",
  EVENTO_TRANSICION_INVALIDA: "No se puede cambiar el evento a ese estado desde su estado actual.",
  EVENTO_FECHA_NO_DISPONIBLE:
    "Ya existe otro evento Confirmado o En curso en esa fecha y horario. Elegí otra fecha/horario.",
  EVENTO_SOLICITUD_DUPLICADA: "Ese cliente ya tiene una reserva abierta que se superpone con esa fecha y horario.",
  EVENTO_NO_EDITABLE:
    "Solo se modifican los eventos Pendientes o Presupuestados. Si hace falta cambiar un evento confirmado, cancelalo y registrá uno nuevo.",
  EVENTO_SIN_PERMISO: "No tenés permiso para acceder a este evento.",
  EVENTO_SIN_PRESUPUESTO_APROBADO: "No se puede confirmar el evento: el cliente todavía no aprobó el presupuesto.",
  EVENTO_YA_COMENZO: "El evento ya comenzó o su fecha ya pasó, así que no admite esta acción.",
  EVENTO_INICIO_FUERA_DE_FECHA: "Un evento solo se puede iniciar el mismo día en que se realiza.",
  EVENTO_NO_SE_PUEDE_ELIMINAR:
    "No se puede eliminar un evento Confirmado, En curso o Finalizado. Cancelalo primero.",

  // Presupuesto
  PRESUPUESTO_NOT_FOUND: "El presupuesto no existe.",
  PRESUPUESTO_EVENTO_OBLIGATORIO: "Indicá el evento (eventoId) para el que querés generar el presupuesto.",
  PRESUPUESTO_EVENTO_NO_PENDIENTE: "Solo se puede generar el presupuesto de un evento en estado Pendiente.",
  PRESUPUESTO_YA_RESPONDIDO: "Este presupuesto ya fue respondido.",
  PRESUPUESTO_EVENTO_CERRADO: "El evento de este presupuesto ya no espera una respuesta (se canceló o cambió de estado).",
  PRESUPUESTO_SIN_PERMISO: "No tenés permiso para acceder a este presupuesto.",
  PRESUPUESTO_ESTIMACION_DATOS: "Para estimar el presupuesto indicá servicioId y cantidadInvitados.",

  // Salón
  SALON_MES_INVALIDO: "El mes tiene que tener formato AAAA-MM.",
});

export default Messages;
