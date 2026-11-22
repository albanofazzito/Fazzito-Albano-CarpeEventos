import { getCurrentTime, getTodayISO, parseISODate } from "./dates.js";

/**
 * validators.js
 * Validaciones de los formularios con las mismas reglas que aplica el
 * backend, para marcar los errores antes de enviar. Cada función devuelve
 * { campo: mensaje } solo con los campos que tienen problemas. La API
 * igual vuelve a validar todo.
 */

const HORA_REGEX = /^([01]\d|2[0-3]):[0-5]\d$/;
const ENTERO_POSITIVO_REGEX = /^\d+$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const TELEFONO_REGEX = /^\+?[\d\s-]+$/;

export const PASSWORD_MIN_LENGTH = 8;

const texto = (valor) => String(valor ?? "").trim();

function validarEmail(email) {
  if (!texto(email)) return "Ingresá tu email.";
  if (!EMAIL_REGEX.test(texto(email))) return "Revisá el email: tiene que ser del tipo nombre@dominio.com.";
  return undefined;
}

function validarTelefono(telefono) {
  const valor = texto(telefono);
  if (!valor) return "Ingresá un teléfono o WhatsApp.";
  const digitos = valor.replace(/\D/g, "").length;
  if (!TELEFONO_REGEX.test(valor) || digitos < 10 || digitos > 13) {
    return "Usá entre 10 y 13 dígitos con la característica, por ejemplo 11 5555-0101.";
  }
  return undefined;
}

function validarNombre(valor, campo) {
  const limpio = texto(valor);
  if (!limpio) return `Ingresá el ${campo}.`;
  if (limpio.length < 2 || limpio.length > 60) return `El ${campo} tiene que tener entre 2 y 60 caracteres.`;
  return undefined;
}

/** Quita las claves sin error para que Object.keys(errores) sean solo los campos con problemas. */
function soloConError(errores) {
  return Object.fromEntries(Object.entries(errores).filter(([, mensaje]) => mensaje));
}

export function validateLoginForm(values) {
  return soloConError({
    email: validarEmail(values.email),
    password: values.password ? undefined : "Ingresá tu contraseña.",
  });
}

export function validateClienteForm(values) {
  return soloConError({
    nombre: validarNombre(values.nombre, "nombre"),
    apellido: validarNombre(values.apellido, "apellido"),
    telefono: validarTelefono(values.telefono),
    email: validarEmail(values.email),
  });
}

export function validateRegistroForm(values) {
  let password;
  if (!values.password) password = "Elegí una contraseña.";
  else if (values.password.length < PASSWORD_MIN_LENGTH) {
    password = `Tiene que tener al menos ${PASSWORD_MIN_LENGTH} caracteres.`;
  }

  let confirmacion;
  if (!values.confirmacion) confirmacion = "Repetí la contraseña.";
  else if (values.confirmacion !== values.password) confirmacion = "Las contraseñas no coinciden.";

  return { ...validateClienteForm(values), ...soloConError({ password, confirmacion }) };
}

export function validateServicioForm(values) {
  const errores = {};
  const nombre = texto(values.nombre);
  const categoria = texto(values.categoria);
  const precio = texto(values.precio);

  if (!nombre) errores.nombre = "Ingresá el nombre del servicio.";
  else if (nombre.length < 3 || nombre.length > 60) errores.nombre = "Tiene que tener entre 3 y 60 caracteres.";

  if (!categoria) errores.categoria = "Ingresá una categoría.";
  else if (categoria.length < 3 || categoria.length > 60) errores.categoria = "Tiene que tener entre 3 y 60 caracteres.";

  if (texto(values.descripcion).length > 200) errores.descripcion = "Puede tener hasta 200 caracteres.";

  if (!precio) errores.precio = "Ingresá el precio.";
  else if (!(Number(precio) > 0)) errores.precio = "Tiene que ser un número mayor a cero.";

  return errores;
}

/**
 * Formulario de Evento. `requiereCliente` es true cuando reserva el
 * administrador (elige para quién); un cliente siempre reserva a su nombre.
 */
export function validateEventoForm(values, { requiereCliente = false, capacidadMaxima, hoy = getTodayISO() } = {}) {
  const errors = {};

  if (requiereCliente && !values.clienteId) {
    errors.clienteId = "Elegí quién hace la reserva.";
  }

  if (!values.servicioId) {
    errors.servicioId = "Elegí el tipo de evento.";
  }

  if (!values.fecha) {
    errors.fecha = "Ingresá la fecha del evento.";
  } else if (!parseISODate(values.fecha)) {
    errors.fecha = "La fecha no es válida.";
  } else if (values.fecha < hoy) {
    errors.fecha = "La fecha no puede ser anterior a hoy.";
  }

  const horaInicioValida = HORA_REGEX.test(values.horaInicio);
  if (!values.horaInicio) {
    errors.horaInicio = "Ingresá la hora de inicio.";
  } else if (!horaInicioValida) {
    errors.horaInicio = "Usá el formato HH:MM, por ejemplo 18:00.";
  } else if (values.fecha === hoy && values.horaInicio <= getCurrentTime()) {
    errors.horaInicio = "Ese horario de hoy ya pasó.";
  }

  if (!values.horaFin) {
    errors.horaFin = "Ingresá la hora de finalización.";
  } else if (!HORA_REGEX.test(values.horaFin)) {
    errors.horaFin = "Usá el formato HH:MM, por ejemplo 23:00.";
  } else if (horaInicioValida && values.horaFin <= values.horaInicio) {
    errors.horaFin = "Tiene que ser posterior a la hora de inicio.";
  }

  const invitados = String(values.cantidadInvitados).trim();
  if (!invitados) {
    errors.cantidadInvitados = "Ingresá la cantidad de invitados.";
  } else if (!ENTERO_POSITIVO_REGEX.test(invitados) || Number(invitados) <= 0) {
    errors.cantidadInvitados = "Tiene que ser un número entero mayor a cero.";
  } else if (capacidadMaxima && Number(invitados) > capacidadMaxima) {
    errors.cantidadInvitados = `El salón tiene capacidad para ${capacidadMaxima} personas como máximo.`;
  }

  return errors;
}
