# Carpe Eventos — API (Backend MVC)

API que implementa el patrón **MVC** sobre el dominio del proyecto
(`Cliente`, `Servicio`, `Evento`, `Presupuesto` y `Usuario`), con
**persistencia en memoria** (arrays), **autenticación con roles** y
**manejo centralizado de errores**.

En la Entrega 2 se implementó el CRUD de **Evento**. En esta entrega se
completa la lógica de negocio que pide el documento de análisis
(`docs/CarpeEventos-AnalisisSistema.docx`): registro e inicio de sesión,
gestión de clientes y del catálogo, presupuestos calculados, disponibilidad
del salón y todas las reglas de negocio de la sección 2.

## Cómo correrlo

```bash
cd Backend
npm install
npm start          # o "npm run dev" para reiniciar automáticamente con --watch
```

El servidor levanta en `http://localhost:3000`.

| Variable         | Para qué sirve                                   | Valor por defecto                              |
|------------------|--------------------------------------------------|------------------------------------------------|
| `PORT`           | Puerto del servidor                              | `3000`                                         |
| `CORS_ORIGIN`    | Orígenes del frontend permitidos (separados por coma) | `http://localhost:5173,http://localhost:4173` |
| `JWT_SECRET`     | Clave con la que se firman los tokens            | una clave de desarrollo (cambiarla en producción) |
| `JWT_EXPIRES_IN` | Duración de la sesión                            | `8h`                                           |

## Usuarios de prueba

Al levantar el servidor se cargan datos de ejemplo (`src/data/seed.js`) con
un evento en cada etapa del flujo. Las fechas se calculan a partir del día
en que se ejecuta, así que siempre hay eventos futuros para probar.

| Rol           | Email                        | Contraseña    | Qué tiene cargado                                       |
|---------------|------------------------------|---------------|---------------------------------------------------------|
| Administrador | `admin@carpeeventos.com.ar`  | `admin1234`   | Acceso a todo el panel                                  |
| Cliente       | `marina.gomez@example.com`   | `cliente1234` | Un evento confirmado y uno finalizado (historial)       |
| Cliente       | `lucia.alvarez@example.com`  | `cliente1234` | Un evento con presupuesto esperando su aprobación       |

Diego Fernández no tiene cuenta: representa a quien reserva por WhatsApp y
el administrador carga a mano. Tiene una solicitud pendiente de presupuesto
y un evento cancelado. **Los datos se pierden al reiniciar el servidor.**

## Estructura de carpetas (`src/`)

```
src/
├── app.js                 # configuración de Express (middlewares, rutas, errores)
├── server.js              # punto de entrada: carga datos, actualiza estados y levanta el servidor
├── config/                # datos del salón (aforo, cotización) y de la autenticación
├── controllers/           # traducen HTTP <-> servicios. Sin lógica de negocio.
├── services/              # reglas de negocio y validaciones. Orquestan repositorios.
├── repositories/          # acceso a los arrays en memoria. CRUD puro, sin reglas.
├── models/                # clases de dominio (Cliente, Servicio, Evento, Presupuesto, Usuario).
├── routes/                # endpoints por entidad + router raíz. Declaran qué rol puede usar cada uno.
├── middlewares/           # authenticate/authorize, errorHandler (centralizado) y notFoundRoute.
├── responses/             # ApiResponse: formato consistente de toda respuesta HTTP.
├── exceptions/            # AppError y subclases (400, 401, 403, 404, 409, 422, 500).
├── enums/                 # Messages, EstadoEvento, EstadoPresupuesto y Rol.
├── data/                  # seed.js: datos de prueba.
└── utils/                 # helpers puros: validadores, fechas, jwt, permisos, parseId, ...
```

Cada capa tiene una única responsabilidad y solo conoce a la capa
inmediatamente inferior:

`routes → middlewares → controllers → services → repositories → models`

Los controllers **nunca** acceden a un repositorio directamente, y los
repositorios **nunca** validan datos ni lanzan errores de negocio — eso es
responsabilidad exclusiva de `services/`.

## Autenticación y roles

- `POST /api/auth/registro` crea un **Cliente** y su **Usuario** (rol Cliente).
  Desde la web no se pueden crear administradores.
- `POST /api/auth/login` devuelve `{ token, usuario }`. Las contraseñas se
  guardan hasheadas con **bcrypt**; el token es un **JWT** que vence a las 8 h.
- Las rutas protegidas esperan el header `Authorization: Bearer <token>`.
- `middlewares/auth.middleware.js`:
  - `authenticate` valida el token y deja en `req.usuario` quién hace la
    petición. Sin token → `401`.
  - `authorize(...roles)` corta con `403` si el rol no está permitido.
- La regla **"un Cliente solo ve sus propios datos"** se aplica en los
  services: un cliente que pide un evento, presupuesto o cliente ajeno recibe `403`.

| Perfil        | Puede                                                                                           |
|---------------|-------------------------------------------------------------------------------------------------|
| Visitante     | Ver el catálogo, la disponibilidad del salón y estimar un presupuesto. Registrarse.             |
| Cliente       | Pedir reservas a su nombre, modificarlas mientras no estén confirmadas, aprobar o rechazar su presupuesto, cancelar, ver su historial y editar sus datos. |
| Administrador | Todo lo anterior sobre cualquier cliente, más: generar presupuestos, confirmar, iniciar y finalizar eventos, eliminar eventos, CRUD de clientes y del catálogo. |

## Endpoints

### Autenticación (`/api/auth`)

| Verbo  | Ruta        | Acceso  | Acción                                    |
|--------|-------------|---------|-------------------------------------------|
| `POST` | `/registro` | Público | Registrarse como cliente                  |
| `POST` | `/login`    | Público | Iniciar sesión                            |
| `GET`  | `/perfil`   | Sesión  | Datos del usuario con la sesión abierta   |

### Eventos — entidad principal (`/api/eventos`)

| Verbo    | Ruta           | Acceso          | Acción                                                         |
|----------|----------------|-----------------|----------------------------------------------------------------|
| `GET`    | `/`            | Sesión          | Listar (admin: todos; cliente: los suyos). Filtros `?estado=` y `?clienteId=` (admin) |
| `GET`    | `/:id`         | Sesión (dueño)  | Detalle con cliente, servicio y presupuesto                    |
| `POST`   | `/`            | Sesión          | Pedir una reserva (nace `Pendiente`). El admin indica `clienteId` |
| `PUT`    | `/:id`         | Sesión (dueño)  | Modificar los datos (solo `Pendiente` o `Presupuestado`)       |
| `PATCH`  | `/:id/estado`  | Según el estado | Cambiar el estado: `{ "estado": "Confirmado" }`                |
| `DELETE` | `/:id`         | Administrador   | Eliminar (solo `Pendiente`, `Presupuestado` o `Cancelado`)     |

Body de `POST`/`PUT`:

```json
{
  "fecha": "2026-12-20",
  "horaInicio": "18:00",
  "horaFin": "23:00",
  "cantidadInvitados": 40,
  "servicioId": 3,
  "clienteId": 1
}
```

`clienteId` solo lo usa el administrador: un cliente siempre reserva a su nombre.
Las respuestas de eventos incluyen los objetos `cliente`, `servicio` y
`presupuesto` (o `null`), así el frontend no necesita pedirlos aparte.

Quién puede pedir cada cambio de estado con `PATCH /:id/estado`:

| Estado destino | Quién            | Condiciones                                                   |
|----------------|------------------|---------------------------------------------------------------|
| `Confirmado`   | Administrador    | Presupuesto **aprobado**, fecha futura y franja libre         |
| `En curso`     | Administrador    | Solo el día del evento (también pasa solo a la hora de inicio) |
| `Finalizado`   | Administrador    | Desde `En curso` (también pasa solo al terminar el horario)   |
| `Cancelado`    | Admin o el cliente dueño | Desde `Pendiente`, `Presupuestado` o `Confirmado`     |

`Presupuestado` y `Pendiente` no se piden a mano: los asigna el sistema al
generar o rechazar el presupuesto.

### Presupuestos (`/api/presupuestos`)

| Verbo   | Ruta            | Acceso         | Acción                                                       |
|---------|-----------------|----------------|--------------------------------------------------------------|
| `GET`   | `/estimacion`   | Público        | Cotizar sin guardar: `?servicioId=1&cantidadInvitados=80`    |
| `GET`   | `/:id`          | Sesión (dueño) | Ver un presupuesto                                           |
| `POST`  | `/`             | Administrador  | Generar el presupuesto de un evento: `{ "eventoId": 4 }`     |
| `PATCH` | `/:id/aprobar`  | Dueño o admin  | Aprobar                                                      |
| `PATCH` | `/:id/rechazar` | Dueño o admin  | Rechazar (el evento vuelve a `Pendiente`)                    |

### Clientes (`/api/clientes`)

| Verbo    | Ruta   | Acceso                  | Acción                                         |
|----------|--------|-------------------------|------------------------------------------------|
| `GET`    | `/`    | Administrador           | Listar (incluye `tieneCuenta` y `cantidadEventos`) |
| `GET`    | `/:id` | Admin o el propio cliente | Ver datos                                     |
| `POST`   | `/`    | Administrador           | Alta (por ejemplo, un cliente de WhatsApp)     |
| `PUT`    | `/:id` | Admin o el propio cliente | Modificar datos de contacto                   |
| `DELETE` | `/:id` | Administrador           | Eliminar (solo si no tiene eventos)            |

### Catálogo de servicios (`/api/servicios`)

| Verbo    | Ruta   | Acceso        | Acción                                                         |
|----------|--------|---------------|----------------------------------------------------------------|
| `GET`    | `/`    | Público       | Servicios activos. El admin puede sumar `?incluirInactivos=true` |
| `GET`    | `/:id` | Público       | Ver un servicio                                                |
| `POST`   | `/`    | Administrador | Agregar al catálogo                                            |
| `PUT`    | `/:id` | Administrador | Modificar (o reactivar con `{ "activo": true }`)               |
| `DELETE` | `/:id` | Administrador | Dar de baja (baja lógica)                                      |

### Salón (`/api/salon`)

| Verbo | Ruta              | Acceso  | Acción                                                         |
|-------|-------------------|---------|----------------------------------------------------------------|
| `GET` | `/`               | Público | Aforo y reglas de cotización                                   |
| `GET` | `/disponibilidad` | Público | Franjas ocupadas de un mes: `?mes=2026-12` (sin datos personales) |

## Reglas de negocio implementadas

Las 8 reglas de la sección 2 del análisis, más las validaciones de la sección 3:

1. **Disponibilidad de fecha y horario** (`evento.service.js`): no se puede
   confirmar —ni pedir o modificar una reserva— en una franja que se
   superpone con otro evento `Confirmado` o `En curso`. → `409`
2. **No se confirma sin presupuesto aprobado** (`evento.service.js`). → `409`
3. **No se cancela un evento iniciado**: el mapa de transiciones de
   `enums/EstadoEvento.js` solo permite cancelar desde `Pendiente`,
   `Presupuestado` o `Confirmado`. → `409`
4. **Cliente único por email/teléfono** (`cliente.service.js`). El teléfono se
   compara solo por sus dígitos, así `11 5555-0101` y `1155550101` son el mismo. → `409`
5. **El monto del presupuesto se calcula** (`presupuesto.service.js`): precio del
   servicio (incluye hasta 50 invitados) + $6.000 por invitado adicional. No
   hay forma de enviar un monto. Si se modifica un evento ya presupuestado,
   el monto se recalcula y vuelve a esperar la aprobación del cliente.
6. **Solo el Administrador gestiona el catálogo** (`authorize` en `servicio.routes.js`). → `403`
7. **Un Cliente solo ve sus propios datos** (services de evento, presupuesto y cliente). → `403`
8. **Aforo del salón**: máximo 150 invitados (`config/negocio.config.js`). → `422`

Además:

- Un evento **siempre nace `Pendiente`** y el estado solo cambia por
  `PATCH /:id/estado` o por el flujo del presupuesto (enviar `estado` en un `PUT` → `400`).
- Los datos de una reserva se modifican solo mientras está `Pendiente` o
  `Presupuestado` (análisis, sección 6). → `409`
- **Reservas duplicadas**: un cliente no puede tener dos reservas abiertas
  que se superpongan. → `409`
- **Estados automáticos**: `server.js` revisa una vez por minuto y pasa a
  `En curso` los eventos confirmados que empezaron, y a `Finalizado` los que terminaron.
- Fechas en formato `AAAA-MM-DD` que existan de verdad (`2026-02-31` se
  rechaza), no anteriores a hoy, y si es hoy, con un horario que no haya pasado.
- No se puede reservar un servicio dado de baja (`422`), ni dar de baja un
  servicio con reservas abiertas, ni eliminar un cliente con historial (`409`).
- Contraseña de 8 caracteres como mínimo, email con formato válido (también
  en el login) y teléfono argentino de 10 a 13 dígitos.

### Decisiones sobre la información "a confirmar" (análisis, sección 8)

| Pregunta del análisis                      | Decisión tomada                                                            |
|--------------------------------------------|----------------------------------------------------------------------------|
| Aforo del salón                            | 150 personas                                                               |
| Cómo se calcula el presupuesto             | Precio fijo por servicio con 50 invitados incluidos + recargo por invitado extra |
| ¿Más de un evento por día?                 | Sí, mientras las franjas horarias no se superpongan                        |
| ¿Se reprograma un evento confirmado?       | No: se cancela y se pide uno nuevo                                         |
| ¿El admin carga eventos para clientes de WhatsApp? | Sí: puede dar de alta al cliente y reservar a su nombre            |
| Tercer rol (empleado)                      | No se agrega: solo Cliente y Administrador                                 |

Los valores numéricos están en `src/config/negocio.config.js` para poder
cambiarlos sin tocar la lógica.

## Manejo centralizado de errores

- `enums/Messages.js`: **un solo lugar** con todos los mensajes de la app.
- `exceptions/AppError.js`: clase base + subclases por código HTTP
  (`BadRequestError` 400, `UnauthorizedError` 401, `ForbiddenError` 403,
  `NotFoundError` 404, `ConflictError` 409, `UnprocessableEntityError` 422,
  `InternalServerError` 500).
- Los controllers están envueltos con `utils/asyncHandler.js`, que reenvía
  cualquier error a `next(err)`. Los middlewares de autenticación también
  pasan sus errores con `next(err)`.
- `middlewares/errorHandler.js` es el **único lugar** de la app que arma una
  respuesta de error: si es un `AppError` usa su `statusCode` y `message`; si
  el body no es un JSON válido responde `400`; si es un error inesperado,
  responde `500` con un mensaje genérico (y loguea el detalle en el servidor).

## Formato de respuesta (`responses/ApiResponse.js`)

Éxito:

```json
{ "success": true, "data": { "id": 1, "...": "..." } }
```

Error (mismo formato sin importar la causa):

```json
{ "success": false, "message": "No se puede confirmar el evento: el cliente todavía no aprobó el presupuesto." }
```

## Ejemplo de uso: flujo completo de una reserva (curl)

```bash
# 1) El cliente inicia sesión y guarda el token
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"marina.gomez@example.com","password":"cliente1234"}'

# 2) Pide una reserva (nace Pendiente)
curl -X POST http://localhost:3000/api/eventos \
  -H "Authorization: Bearer <TOKEN_CLIENTE>" -H "Content-Type: application/json" \
  -d '{"fecha":"2026-12-20","horaInicio":"18:00","horaFin":"23:00","cantidadInvitados":80,"servicioId":1}'

# 3) El administrador genera el presupuesto (el evento pasa a Presupuestado)
curl -X POST http://localhost:3000/api/presupuestos \
  -H "Authorization: Bearer <TOKEN_ADMIN>" -H "Content-Type: application/json" \
  -d '{"eventoId":6}'

# 4) El cliente lo aprueba
curl -X PATCH http://localhost:3000/api/presupuestos/4/aprobar \
  -H "Authorization: Bearer <TOKEN_CLIENTE>"

# 5) El administrador confirma: la fecha queda bloqueada
curl -X PATCH http://localhost:3000/api/eventos/6/estado \
  -H "Authorization: Bearer <TOKEN_ADMIN>" -H "Content-Type: application/json" \
  -d '{"estado":"Confirmado"}'
```

## Pendiente para próximas entregas

- Persistencia real (base de datos) en lugar de arrays en memoria.
- Seña/anticipo y medios de pago al confirmar (análisis, sección 8).
- Aviso automático al cliente (WhatsApp o email) cuando se genera su presupuesto.
