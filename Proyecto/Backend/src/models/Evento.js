class Evento {
    constructor(id, fecha, horaInicio, horaFin, cantidadInvitados, estado, cliente, servicio) {
        this.id = id;
        this.fecha = fecha;
        this.horaInicio = horaInicio;
        this.horaFin = horaFin;
        this.cantidadInvitados = cantidadInvitados;
        this.estado = estado;
        this.cliente = cliente;
        this.servicio = servicio;
    }
}

export default Evento;
