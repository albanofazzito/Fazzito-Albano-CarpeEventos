import { EventoRepository } from "../repositories/evento.repository.js";
import { NEGOCIO } from "../config/negocio.config.js";
import { ESTADOS_CON_FECHA_BLOQUEADA } from "../enums/EstadoEvento.js";
import { Messages } from "../enums/Messages.js";
import { BadRequestError } from "../exceptions/AppError.js";
import { getTodayISO } from "../utils/dates.js";
import { isValidMonthString } from "../utils/validators.js";

/**
 * salon.service.js
 * Información pública del salón: las reglas con las que se cotiza y el
 * calendario de disponibilidad (análisis del sistema, funcionalidad 4).
 * La disponibilidad muestra solo las franjas ocupadas, nunca quién reservó.
 */
export const SalonService = {
  getInfo() {
    return {
      nombre: NEGOCIO.nombre,
      capacidadMaxima: NEGOCIO.capacidadMaxima,
      invitadosIncluidos: NEGOCIO.invitadosIncluidos,
      precioInvitadoAdicional: NEGOCIO.precioInvitadoAdicional,
    };
  },

  /**
   * Franjas ocupadas (eventos Confirmados o En curso) de cada día del mes
   * indicado ("AAAA-MM"). Si no se indica mes, se usa el actual.
   */
  getDisponibilidad(mes = getTodayISO().slice(0, 7)) {
    if (!isValidMonthString(mes)) {
      throw new BadRequestError(Messages.SALON_MES_INVALIDO);
    }

    const franjasPorDia = new Map();
    EventoRepository.findByMes(mes, ESTADOS_CON_FECHA_BLOQUEADA).forEach(({ fecha, horaInicio, horaFin }) => {
      if (!franjasPorDia.has(fecha)) franjasPorDia.set(fecha, []);
      franjasPorDia.get(fecha).push({ horaInicio, horaFin });
    });

    const dias = [...franjasPorDia.entries()]
      .sort(([fechaA], [fechaB]) => fechaA.localeCompare(fechaB))
      .map(([fecha, franjas]) => ({
        fecha,
        franjas: franjas.sort((a, b) => a.horaInicio.localeCompare(b.horaInicio)),
      }));

    return { mes, dias };
  },
};

export default SalonService;
