import app from "./app.js";
import { cargarDatosDePrueba } from "./data/seed.js";
import { EventoService } from "./services/evento.service.js";

const PORT = process.env.PORT || 3000;
const UN_MINUTO = 60 * 1000;

cargarDatosDePrueba();

// Los eventos confirmados pasan solos a "En curso" y a "Finalizado" según
// su fecha y horario. Se revisa al arrancar y después una vez por minuto.
EventoService.actualizarEstadosPorFecha();
setInterval(() => EventoService.actualizarEstadosPorFecha(), UN_MINUTO);

app.listen(PORT, () => {
  console.log(`Carpe Eventos API corriendo en http://localhost:${PORT}`);
});
