# Carpe Eventos — API (Backend MVC)

API que implementa el patrón **MVC** sobre el dominio definido en la Entrega 1
(`Cliente`, `Servicio`, `Evento`, `Presupuesto`), con **persistencia en
memoria** (arrays) y **manejo centralizado de errores**.

Se elige **Evento** como entidad principal del CRUD porque es el proceso
central del negocio (ver `docs/CarpeEventos-AnalisisSistema.docx`, secciones
5 y 6): une a un Cliente con un Servicio en una fecha/horario y recorre un
flujo de estados.

## Cómo correrlo

```bash
cd Backend
npm install
npm start          # o "npm run dev" para reiniciar automáticamente con --watch
```

El servidor levanta en `http://localhost:3000` (configurable con la
variable de entorno `PORT`).

## Estructura de carpetas (`src/`)

```
src/
├── app.js                 # configuración de Express (middlewares, rutas, errores)
├── server.js              # punto de entrada, levanta el servidor HTTP
├── controllers/           # traducen HTTP <-> servicios. Sin lógica de negocio.
├── services/               # reglas de negocio y validaciones. Orquestan repositorios.
├── repositories/          # acceso a los arrays en memoria. CRUD puro, sin reglas.
├── models/                 # clases de dominio (Cliente, Servicio, Evento, Presupuesto).
├── routes/                 # definición de endpoints por entidad + router raíz.
├── middlewares/            # errorHandler (centralizado) y notFoundRoute.
├── responses/              # ApiResponse: formato consistente de toda respuesta HTTP.
├── exceptions/             # AppError y subclases (BadRequestError, NotFoundError, etc.).
├── enums/                   # Messages.js (mensajes) y EstadoEvento.js (estados + transiciones).
└── utils/                   # helpers puros: validadores, idGenerator, asyncHandler, parseId.
```

Cada capa tiene una única responsabilidad y solo conoce a la capa
inmediatamente inferior:

`routes → controllers → services → repositories → models`

Los controllers **nunca** acceden a un repositorio directamente, y los
repositorios **nunca** validan datos ni lanzan errores de negocio — eso es
responsabilidad exclusiva de `services/`.

## Entidad principal del CRUD: Evento

| Verbo    | Ruta                | Acción                          |
|----------|---------------------|----------------------------------|
| `GET`    | `/api/eventos`      | Obtener todos los eventos       |
| `GET`    | `/api/eventos/:id`  | Obtener un evento por ID        |
| `POST`   | `/api/eventos`      | Crear un evento (nace `Pendiente`) |
| `PUT`    | `/api/eventos/:id`  | Modificar datos y/o estado      |
| `DELETE` | `/api/eventos/:id`  | Eliminar (solo si el estado lo permite) |

Body esperado para `POST`/`PUT`:

```json
{
  "fecha": "2026-12-20",
  "horaInicio": "18:00",
  "horaFin": "23:00",
  "cantidadInvitados": 40,
  "clienteId": 1,
  "servicioId": 3
}
```

Además se agregaron dos rutas auxiliares de **solo lectura**
(`/api/clientes` y `/api/servicios`) para poder consultar qué `clienteId` y
`servicioId` existen a la hora de armar un Evento. El CRUD evaluado en esta
entrega es exclusivamente el de Evento.

## Reglas de negocio implementadas en `evento.service.js`

Tomadas del documento de análisis del sistema (Entrega 2, sección 2):

1. Campos obligatorios al crear (`fecha`, `horaInicio`, `horaFin`, `cantidadInvitados`, `clienteId`, `servicioId`).
2. Fecha con formato válido y **no puede ser pasada**.
3. `horaFin` debe ser posterior a `horaInicio`.
4. `cantidadInvitados` debe ser un entero mayor a cero.
5. `clienteId` y `servicioId` deben existir (si no, `404`).
6. Un evento **siempre nace en estado `Pendiente`** — el estado inicial no lo decide quien llama a la API.
7. Solo se permiten las **transiciones de estado** definidas en `enums/EstadoEvento.js` (por ejemplo, no se puede pasar de `Confirmado` a `Pendiente`, ni cancelar un evento `Finalizado`).
8. **Disponibilidad de fecha/horario:** no se puede confirmar (o pasar a `En curso`) un evento si se superpone en fecha y horario con otro evento ya `Confirmado`/`En curso`.
9. **No se puede eliminar** un evento en estado `Confirmado`, `En curso` o `Finalizado` — primero hay que cancelarlo (`PUT` con `{ "estado": "Cancelado" }`).

## Manejo centralizado de errores

- `enums/Messages.js`: **un solo lugar** con todos los mensajes de la app.
- `exceptions/AppError.js`: clase base + subclases por código HTTP
  (`BadRequestError` 400, `NotFoundError` 404, `ConflictError` 409,
  `UnprocessableEntityError` 422, `InternalServerError` 500).
- Los controllers están envueltos con `utils/asyncHandler.js`, que reenvía
  cualquier error a `next(err)`.
- `middlewares/errorHandler.js` es el **único lugar** de la app que arma una
  respuesta de error: si el error es un `AppError` usa su `statusCode` y
  `message`; si es un error inesperado, responde `500` con un mensaje
  genérico (y loguea el detalle en el servidor, nunca lo expone al cliente).

## Formato de respuesta (`responses/ApiResponse.js`)

Éxito:

```json
{ "success": true, "data": { "id": 1, "...": "..." } }
```

Error (mismo formato sin importar la causa):

```json
{ "success": false, "message": "El evento no existe." }
```

## Ejemplos de prueba (curl)

```bash
# Crear un evento
curl -X POST http://localhost:3000/api/eventos \
  -H "Content-Type: application/json" \
  -d '{"fecha":"2026-12-20","horaInicio":"18:00","horaFin":"23:00","cantidadInvitados":40,"clienteId":1,"servicioId":3}'

# Confirmar un evento (requiere pasar antes por "Presupuestado")
curl -X PUT http://localhost:3000/api/eventos/1 \
  -H "Content-Type: application/json" -d '{"estado":"Presupuestado"}'
curl -X PUT http://localhost:3000/api/eventos/1 \
  -H "Content-Type: application/json" -d '{"estado":"Confirmado"}'

# Intentar eliminar un evento Confirmado -> 409
curl -X DELETE http://localhost:3000/api/eventos/1
```

## Datos de prueba (seed)

Al levantar el servidor, los repositorios cargan datos de ejemplo en
memoria (3 clientes, 4 servicios del catálogo real de Carpe Eventos, y 2
eventos) para poder probar la API inmediatamente sin tener que crear todo
a mano. **Los datos se pierden al reiniciar el servidor** (es memoria, no
hay base de datos todavía).

## Pendiente para próximas entregas

- Persistencia real (base de datos) en lugar de arrays en memoria.
- Autenticación (login/registro) y autorización por rol (Cliente/Administrador).
- CRUD completo también para `Cliente` y `Servicio` (hoy son solo lectura).
- Cálculo automático del monto del `Presupuesto` a partir de los `Servicio` elegidos.
