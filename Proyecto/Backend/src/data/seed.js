import bcrypt from "bcryptjs";
import { ClienteRepository } from "../repositories/cliente.repository.js";
import { ServicioRepository } from "../repositories/servicio.repository.js";
import { EventoRepository } from "../repositories/evento.repository.js";
import { PresupuestoRepository } from "../repositories/presupuesto.repository.js";
import { UsuarioRepository } from "../repositories/usuario.repository.js";
import { PresupuestoService } from "../services/presupuesto.service.js";
import { AUTH } from "../config/auth.config.js";
import { EstadoEvento } from "../enums/EstadoEvento.js";
import { EstadoPresupuesto } from "../enums/EstadoPresupuesto.js";
import { Rol } from "../enums/Rol.js";
import { daysFromToday } from "../utils/dates.js";

/**
 * seed.js
 * Datos de prueba que se cargan en memoria al levantar el servidor, para
 * poder recorrer el sistema sin cargar todo a mano. Las fechas se calculan
 * a partir de hoy, así los eventos "futuros" siguen siéndolo sin importar
 * cuándo se ejecute el proyecto. Hay un evento en cada etapa del flujo.
 *
 * Usuarios de prueba (ver Backend/README.md):
 *   admin@carpeeventos.com.ar  / admin1234    -> Administrador
 *   marina.gomez@example.com   / cliente1234  -> Cliente
 *   lucia.alvarez@example.com  / cliente1234  -> Cliente
 * Diego Fernández no tiene cuenta: representa a un cliente que reserva por
 * WhatsApp y que el administrador carga a mano.
 */
export function cargarDatosDePrueba() {
  const marina = ClienteRepository.create({ nombre: "Marina", apellido: "Gómez", telefono: "+54 9 11 5555-0101", email: "marina.gomez@example.com" });
  const diego = ClienteRepository.create({ nombre: "Diego", apellido: "Fernández", telefono: "+54 9 11 5555-0102", email: "diego.fernandez@example.com" });
  const lucia = ClienteRepository.create({ nombre: "Lucía", apellido: "Álvarez", telefono: "+54 9 11 5555-0103", email: "lucia.alvarez@example.com" });

  const cumpleanios = ServicioRepository.create({ nombre: "Cumpleaños infantil", descripcion: "Alquiler de salón con animación incluida", precio: 350000, categoria: "Cumpleaños" });
  const boda = ServicioRepository.create({ nombre: "Boda / Casamiento", descripcion: "Espacio para celebraciones nupciales", precio: 900000, categoria: "Bodas" });
  const bautismo = ServicioRepository.create({ nombre: "Bautismo / Comunión", descripcion: "Evento religioso y familiar", precio: 280000, categoria: "Bautismos y comuniones" });
  const integral = ServicioRepository.create({ nombre: "Servicio integral", descripcion: "Animación, catering, DJ y decoración temática", precio: 550000, categoria: "Integral" });

  const eventos = [
    // Ya se hizo: queda en el historial de Marina.
    { cliente: marina, servicio: cumpleanios, dias: -75, horaInicio: "17:00", horaFin: "21:00", invitados: 40, estado: EstadoEvento.FINALIZADO, presupuesto: EstadoPresupuesto.APROBADO },
    // Presupuesto aprobado y fecha confirmada.
    { cliente: marina, servicio: cumpleanios, dias: 12, horaInicio: "17:00", horaFin: "21:00", invitados: 60, estado: EstadoEvento.CONFIRMADO, presupuesto: EstadoPresupuesto.APROBADO },
    // Presupuesto enviado: Lucía tiene que aprobarlo o rechazarlo.
    { cliente: lucia, servicio: bautismo, dias: 19, horaInicio: "12:00", horaFin: "16:00", invitados: 45, estado: EstadoEvento.PRESUPUESTADO, presupuesto: EstadoPresupuesto.PENDIENTE },
    // Solicitud nueva: el administrador tiene que generar el presupuesto.
    { cliente: diego, servicio: boda, dias: 26, horaInicio: "20:00", horaFin: "23:59", invitados: 120, estado: EstadoEvento.PENDIENTE },
    // Se canceló antes de presupuestarse.
    { cliente: diego, servicio: integral, dias: 33, horaInicio: "19:00", horaFin: "23:00", invitados: 80, estado: EstadoEvento.CANCELADO },
  ];

  eventos.forEach(({ cliente, servicio, dias, horaInicio, horaFin, invitados, estado, presupuesto }) => {
    const evento = EventoRepository.create({
      fecha: daysFromToday(dias),
      horaInicio,
      horaFin,
      cantidadInvitados: invitados,
      estado,
      clienteId: cliente.id,
      servicioId: servicio.id,
    });

    if (presupuesto) {
      PresupuestoRepository.create({
        ...PresupuestoService.calcular(servicio, invitados),
        eventoId: evento.id,
        estado: presupuesto,
        fechaEmision: daysFromToday(Math.min(dias, 0) - 10),
        fechaRespuesta: presupuesto === EstadoPresupuesto.APROBADO ? daysFromToday(Math.min(dias, 0) - 7) : null,
      });
    }
  });

  const hash = (password) => bcrypt.hashSync(password, AUTH.bcryptRounds);
  UsuarioRepository.create({ email: "admin@carpeeventos.com.ar", passwordHash: hash("admin1234"), rol: Rol.ADMINISTRADOR });
  UsuarioRepository.create({ email: marina.email, passwordHash: hash("cliente1234"), rol: Rol.CLIENTE, clienteId: marina.id });
  UsuarioRepository.create({ email: lucia.email, passwordHash: hash("cliente1234"), rol: Rol.CLIENTE, clienteId: lucia.id });
}

export default cargarDatosDePrueba;
