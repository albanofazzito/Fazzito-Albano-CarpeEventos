import { getMonthOf, getTodayISO } from "./dates.js";
import { formatNombreCompleto } from "./formatters.js";
import { LISTA_ESTADOS } from "./estados.js";

export function sortByFecha(eventos) {
  return [...eventos].sort((a, b) =>
    `${a.fecha} ${a.horaInicio}`.localeCompare(`${b.fecha} ${b.horaInicio}`)
  );
}

/** Minúsculas y sin tildes, para que "lucia" encuentre a "Lucía". */
export function normalizar(texto) {
  return texto.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase().trim();
}

/** Períodos del filtro de fechas del panel. */
export const PERIODOS = Object.freeze({
  TODOS: "",
  PROXIMOS: "proximos",
  ESTE_MES: "este-mes",
  PASADOS: "pasados",
});

function estaEnPeriodo(fecha, periodo) {
  const hoy = getTodayISO();
  if (periodo === PERIODOS.PROXIMOS) return fecha >= hoy;
  if (periodo === PERIODOS.PASADOS) return fecha < hoy;
  if (periodo === PERIODOS.ESTE_MES) return getMonthOf(fecha) === getMonthOf(hoy);
  return true;
}

export function filterEventos(eventos, { estado, periodo = PERIODOS.TODOS, busqueda = "" }) {
  const termino = normalizar(busqueda);

  return eventos.filter((evento) => {
    if (estado && evento.estado !== estado) return false;
    if (!estaEnPeriodo(evento.fecha, periodo)) return false;
    if (!termino) return true;

    const texto = `${formatNombreCompleto(evento.cliente)} ${evento.servicio?.nombre ?? ""}`;
    return normalizar(texto).includes(termino);
  });
}

export function countByEstado(eventos) {
  const conteo = Object.fromEntries(LISTA_ESTADOS.map((estado) => [estado, 0]));
  eventos.forEach((evento) => {
    conteo[evento.estado] = (conteo[evento.estado] ?? 0) + 1;
  });
  return conteo;
}

// Los inputs trabajan con strings; la API espera números en IDs y cantidad.
export const EVENTO_FORM_VACIO = Object.freeze({
  clienteId: "",
  servicioId: "",
  fecha: "",
  horaInicio: "",
  horaFin: "",
  cantidadInvitados: "",
});

export function eventoToFormValues(evento) {
  return {
    clienteId: String(evento.clienteId),
    servicioId: String(evento.servicioId),
    fecha: evento.fecha,
    horaInicio: evento.horaInicio,
    horaFin: evento.horaFin,
    cantidadInvitados: String(evento.cantidadInvitados),
  };
}

/** clienteId solo se envía cuando el formulario lo pide (lo elige el administrador). */
export function formValuesToPayload(values, { incluirCliente = false } = {}) {
  return {
    ...(incluirCliente && { clienteId: Number(values.clienteId) }),
    servicioId: Number(values.servicioId),
    fecha: values.fecha,
    horaInicio: values.horaInicio,
    horaFin: values.horaFin,
    cantidadInvitados: Number(values.cantidadInvitados),
  };
}
