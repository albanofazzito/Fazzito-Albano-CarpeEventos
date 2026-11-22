# Carpe Eventos — Frontend (React + Vite)

Interfaz web de Carpe Eventos. Retoma el boceto de la Entrega 1 (landing con
Hero, Sobre nosotros, Servicios, Contacto y Footer, con la paleta y las
tipografías del documento de identidad visual) y le suma todo el sistema de
reservas conectado a la API: cuentas de usuario, pedido de fechas,
presupuestos, calendario de disponibilidad y el panel de gestión del salón.

## Cómo correrlo

Requiere Node.js 20.19 o superior. El backend tiene que estar levantado
primero, porque todos los datos (servicios, clientes, eventos, presupuestos)
vienen de la API.

```bash
# 1) Backend (en otra terminal)
cd Backend
npm install
npm start            # http://localhost:3000

# 2) Frontend
cd Frontend
npm install
npm run dev          # http://localhost:5173
```

Usuarios de prueba (se cargan al levantar el backend):

| Rol           | Email                        | Contraseña    |
|---------------|------------------------------|---------------|
| Administrador | `admin@carpeeventos.com.ar`  | `admin1234`   |
| Cliente       | `marina.gomez@example.com`   | `cliente1234` |
| Cliente       | `lucia.alvarez@example.com`  | `cliente1234` |

También se puede crear una cuenta nueva desde "Ingresar" → "Registrate".

Otros scripts:

| Script            | Qué hace                                             |
|-------------------|------------------------------------------------------|
| `npm run build`   | Genera la versión de producción en `dist/`           |
| `npm run preview` | Sirve `dist/` en http://localhost:4173               |
| `npm run lint`    | Revisa el código con oxlint (incluye reglas de accesibilidad) |

La URL de la API se configura con la variable `VITE_API_URL` (ver
`.env.example`); por defecto es `http://localhost:3000/api`. Los puertos de
Vite son fijos (5173 y 4173) porque son los orígenes que el backend habilita
por CORS.

## Pantallas

| Ruta                  | Quién                | Pantalla                                                            |
|-----------------------|----------------------|---------------------------------------------------------------------|
| `/`                   | Todos                | Landing del boceto. Los servicios se cargan desde la API.          |
| `/disponibilidad`     | Todos                | Calendario del salón: días libres y franjas ya confirmadas.        |
| `/ingresar`           | Todos                | Inicio de sesión.                                                   |
| `/registro`           | Todos                | Registro de clientes.                                               |
| `/eventos`            | Con sesión           | Admin: panel de eventos. Cliente: "Mis eventos".                    |
| `/eventos/nuevo`      | Con sesión           | Pedir una fecha (el admin además elige el cliente).                 |
| `/eventos/:id`        | Con sesión (dueño)   | Detalle: estado, presupuesto, datos y acciones según el rol.       |
| `/eventos/:id/editar` | Con sesión (dueño)   | Modificar una reserva Pendiente o Presupuestada.                    |
| `/mi-cuenta`          | Cliente              | Datos de contacto e historial.                                      |
| `/clientes`           | Administrador        | Gestión de clientes: alta, edición, baja y búsqueda.                |
| `/clientes/:id`       | Administrador        | Ficha del cliente con su historial de eventos.                      |
| `/catalogo`           | Administrador        | Catálogo de servicios: alta, edición, baja lógica y reactivación.   |

Las rutas con sesión están protegidas con `components/auth/RequireAuth.jsx`:
sin sesión manda a "Ingresar" (y después vuelve a la pantalla que se quería
abrir); con un rol que no corresponde, muestra un aviso. Igual la protección
real la hace la API, que rechaza cualquier petición sin permiso.

## Flujo principal: reservar una fecha

1. El visitante toca **"Consultá tu fecha"** o elige un día libre en
   **Disponibilidad**. Si no tiene sesión, ingresa o se registra.
2. Completa el formulario: mientras escribe ve si el día está libre
   (`/api/salon/disponibilidad`) y el **presupuesto estimado** calculado por
   la API (`/api/presupuestos/estimacion`). Al enviar, el evento queda **Pendiente**.
3. El administrador abre el evento y toca **"Generar presupuesto"**: el evento
   pasa a **Presupuestado**.
4. El cliente ve el presupuesto con el detalle y lo **aprueba** o lo
   **rechaza** (si lo rechaza, puede modificar la reserva y pedir uno nuevo).
5. Con el presupuesto aprobado, el administrador **confirma** el evento y la
   franja aparece ocupada en el calendario. Después pasa solo a En curso y a
   Finalizado según la fecha y el horario.

El presupuesto se puede **imprimir o guardar como PDF** desde el detalle.

## Estructura de `src/`

```
src/
├── App.jsx              # rutas y proveedores globales (router, notificaciones y sesión)
├── main.jsx             # punto de entrada
├── assets/
│   ├── icons/           # íconos SVG propios (se importan como componentes)
│   └── images/          # fotos del salón + index.js con sus textos alternativos
├── components/
│   ├── auth/            # RequireAuth (protección de rutas por sesión y rol)
│   ├── layout/          # Layout, Navbar, PanelNav, PanelLayout, Footer, Logo, PageHeader
│   ├── ui/              # piezas genéricas: Button, Card, Modal, ConfirmDialog,
│   │                    #   TextField, SelectField, TextAreaField, Loader, StatusMessage, ...
│   ├── feedback/        # notificaciones laterales (Toast, ToastViewport)
│   ├── home/            # secciones de la landing
│   ├── eventos/         # EventoForm, EventoCard, EstadoActions, DisponibilidadDelDia,
│   │                    #   EstimacionPresupuesto, ResumenAtencion, ...
│   ├── presupuestos/    # PresupuestoCard y PresupuestoDetalle
│   ├── clientes/        # ClienteForm, ClienteItem
│   ├── servicios/       # ServicioCard, ServicioForm, ServicioAdminItem, ServicioIcon
│   └── disponibilidad/  # CalendarioMes
├── context/             # ToastProvider y AuthProvider (sesión)
├── hooks/               # useAsync, useAuth, useFormulario, useToast, useEliminarEvento, ...
├── pages/               # una pantalla por archivo
├── services/            # comunicación con la API (único lugar con fetch)
├── styles/              # variables de diseño, estilos base y utilidades
└── utils/               # formateo, validaciones, estados, roles, rutas y datos del negocio
```

Cada componente tiene su CSS al lado (`*.module.css`, CSS Modules), así los
estilos no se pisan entre sí. En `styles/` quedan solo los estilos globales.

## Consumo de la API

Todas las peticiones pasan por `services/`:

- `apiClient.js` es el único archivo que usa `fetch`. Arma la URL, envía el
  JSON y el token de la sesión (`Authorization: Bearer ...`), interpreta el
  formato de respuesta de la API (`{ success, data }` o `{ success: false, message }`)
  y, si algo falla, lanza un `ApiError` con el mensaje del backend. Si la
  sesión venció (401), avisa para cerrarla.
- `session.js` guarda el token en `localStorage` para que la sesión siga
  abierta al recargar.
- `auth.service.js`, `evento.service.js`, `presupuesto.service.js`,
  `cliente.service.js`, `servicio.service.js` y `salon.service.js` exponen
  una función por operación (`login`, `createEvento`, `cambiarEstadoEvento`,
  `generarPresupuesto`, `aprobarPresupuesto`, `getDisponibilidad`, ...).
  Las pantallas solo llaman a estas funciones.
- El hook `useAsync` ejecuta esas funciones y le da a cada pantalla los
  estados de carga, error y datos, con la opción de reintentar.

Ningún dato del negocio está escrito a mano en los componentes: servicios,
precios, aforo, clientes, eventos y presupuestos vienen de la API. Los datos
fijos de contacto (dirección, WhatsApp, horarios) están en un solo archivo,
`utils/constants.js`.

## Respuesta visual ante cada acción

- **Carga:** spinner con texto en las pantallas y tarjetas "esqueleto" en la
  grilla de servicios. Los botones muestran un indicador mientras se guarda.
- **Éxito y error:** un único sistema de notificaciones laterales
  (`useToast`) para altas, ediciones, cambios de estado, presupuestos y
  bajas, y para los errores que devuelve la API (por ejemplo, una fecha que
  se superpone con otro evento confirmado). En el login y el registro, el
  error de la API además aparece dentro del formulario. No se usa `alert()`.
- **Validaciones:** los formularios aplican las mismas reglas que el backend
  (campos obligatorios, formato de email y teléfono, contraseña de 8
  caracteres, fecha no pasada, horario coherente, aforo de 150 personas). La
  lógica común está en el hook `useFormulario`: los errores aparecen junto a
  cada campo, el foco va al primero con problemas y una notificación resume
  cuántos hay.
- **Confirmación:** eliminar, cancelar, rechazar un presupuesto o dar de baja
  un servicio abre una ventana de confirmación que explica qué va a pasar.
- **Estados vacíos y fallas:** listados vacíos, filtros sin resultados,
  registros inexistentes, accesos sin permiso y API caída tienen su propio
  mensaje con una acción (reintentar, ver todos, volver al listado).

Además, la interfaz solo ofrece las acciones que el rol y el estado permiten
(por ejemplo, "Confirmar evento" aparece deshabilitado con el motivo hasta
que el cliente aprueba el presupuesto). La API igual vuelve a validar todo.

## Accesibilidad

- Estructura semántica (`header`, `nav`, `main`, `section`, `aside`,
  `footer`), un solo `h1` por pantalla y enlace "Saltar al contenido".
- Cada `label` está asociado a su campo, y las ayudas y los errores se vinculan
  con `aria-describedby` y `aria-invalid`. Los grupos de opciones usan
  `fieldset` y `legend`.
- Botones reales para las acciones y enlaces para la navegación. Los íconos
  son decorativos (`aria-hidden`) y siempre van acompañados de texto.
- El calendario es una tabla con encabezados de día, y cada día anuncia su
  fecha completa y si está libre u ocupado.
- Las notificaciones y las ayudas en vivo del formulario (disponibilidad,
  estimación) se anuncian en regiones `aria-live`. Las ventanas usan
  `<dialog>`: atrapan el foco, se cierran con Escape y devuelven el foco.
- Contraste AA verificado para todos los textos. El dorado de la paleta no
  alcanza 4.5:1 con texto blanco, por eso los botones dorados llevan texto
  borgoña oscuro (`#2B0F1C`, 6.2:1).
- Se respeta `prefers-reduced-motion`, y el foco visible cambia de color según
  el fondo (borgoña sobre claro, dorado sobre oscuro).

## Respeto por el boceto y mejoras

Se mantiene el orden y la composición del wireframe: barra de navegación
borgoña con logo a la izquierda y enlaces a la derecha, Hero de 520 px con
foto de fondo y CTA "Consultá tu fecha", Sobre nosotros en dos columnas,
grilla de cuatro servicios, Contacto con los datos a la izquierda y el botón
de WhatsApp a la derecha, y Footer con dirección, redes y copyright. Colores
y tipografías salen tal cual del documento de identidad visual.

Mejoras agregadas, con su motivo:

- **Sección Galería.** El menú del boceto tenía "Galería" pero el wireframe no
  dibujaba esa sección. Se agregó para que el enlace lleve a algún lugar.
- **Disponibilidad y "Ver fechas libres".** La ficha técnica marcaba como
  necesidad no resuelta que no hubiera un calendario de fechas disponibles.
- **Acceso a la cuenta en la navegación** ("Ingresar", "Mis eventos" o
  "Panel") y una barra de secciones propia del panel según el rol.
- **Pantallas internas con la misma identidad.** Usan el mismo encabezado
  borgoña, las mismas tipografías y los mismos componentes que la landing.
