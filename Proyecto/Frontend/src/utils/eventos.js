import { formatNombreCompleto } from "./formatters.js";
import { LISTA_ESTADOS } from "./estados.js";

/** La API devuelve solo clienteId y servicioId: acá se agregan los objetos completos. */
export function enrichEventos(eventos, clientes, servicios) {
  const clientesPorId = new Map(clientes.map((cliente) => [cliente.id, cliente]));
  const serviciosPorId = new Map(servicios.map((servicio) => [servicio.id, servicio]));

  return eventos.map((evento) => ({
    ...evento,
    cliente: clientesPorId.get(evento.clienteId) ?? null,
    servicio: serviciosPorId.get(evento.servicioId) ?? null,
  }));
}

export function sortByFecha(eventos) {
  return [...eventos].sort((a, b) =>
    `${a.fecha} ${a.horaInicio}`.localeCompare(`${b.fecha} ${b.horaInicio}`)
  );
}

/** Minúsculas y sin tildes, para que "lucia" encuentre a "Lucía". */
function normalizar(texto) {
  return texto.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase().trim();
}

export function filterEventos(eventos, { estado, busqueda = "" }) {
  const termino = normalizar(busqueda);

  return eventos.filter((evento) => {
    if (estado && evento.estado !== estado) return false;
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

export function formValuesToPayload(values) {
  return {
    clienteId: Number(values.clienteId),
    servicioId: Number(values.servicioId),
    fecha: values.fecha,
    horaInicio: values.horaInicio,
    horaFin: values.horaFin,
    cantidadInvitados: Number(values.cantidadInvitados),
  };
}
