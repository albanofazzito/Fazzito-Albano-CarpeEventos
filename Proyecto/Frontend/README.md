# Carpe Eventos — Frontend (React + Vite)

Interfaz web de Carpe Eventos. Retoma el boceto de la Entrega 1 (landing con
Hero, Sobre nosotros, Servicios, Contacto y Footer, con la paleta y las
tipografías del documento de identidad visual) y le suma el panel de gestión
de eventos conectado a la API de la Entrega 2.

## Cómo correrlo

Requiere Node.js 20.19 o superior. El backend tiene que estar levantado
primero, porque todos los datos (servicios, clientes y eventos) vienen de la API.

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

| Ruta                   | Pantalla                                                                 |
|------------------------|--------------------------------------------------------------------------|
| `/`                    | Landing del boceto. Los servicios se cargan desde `/api/servicios`.      |
| `/eventos`             | Panel de eventos: listado, filtro por estado, búsqueda y eliminación.   |
| `/eventos/nuevo`       | Alta de evento (destino del botón "Consultá tu fecha").                 |
| `/eventos/:id`         | Detalle: datos, cliente, seguimiento del estado y cambios de estado.    |
| `/eventos/:id/editar`  | Edición de los datos de un evento.                                      |

## Estructura de `src/`

```
src/
├── App.jsx              # rutas y proveedores globales (router + notificaciones)
├── main.jsx             # punto de entrada
├── assets/
│   ├── icons/           # íconos SVG propios (se importan como componentes)
│   └── images/          # fotos del salón + index.js con sus textos alternativos
├── components/
│   ├── layout/          # Layout, Navbar, Footer, Logo, PageHeader
│   ├── ui/              # piezas genéricas: Button, Card, Modal, ConfirmDialog,
│   │                    #   TextField, SelectField, Loader, StatusMessage, ...
│   ├── feedback/        # notificaciones laterales (Toast, ToastViewport)
│   ├── home/            # secciones de la landing
│   ├── servicios/       # ServicioCard, ServicioIcon
│   └── eventos/         # EventoForm, EventoCard, EstadoBadge, EstadoTimeline, ...
├── context/             # ToastContext y ToastProvider
├── hooks/               # useAsync, useToast, useEliminarEvento, useRouteFocus, ...
├── pages/               # una pantalla por archivo
├── services/            # comunicación con la API
├── styles/              # variables de diseño, estilos base y utilidades
└── utils/               # formateo, validaciones, estados, rutas y datos del negocio
```

Cada componente tiene su CSS al lado (`*.module.css`, CSS Modules), así los
estilos no se pisan entre sí. En `styles/` quedan solo los estilos globales.

## Consumo de la API

Todas las peticiones pasan por `services/`:

- `apiClient.js` es el único archivo que usa `fetch`. Arma la URL, envía el
  JSON, interpreta el formato de respuesta de la API (`{ success, data }` o
  `{ success: false, message }`) y, si algo falla, lanza un `ApiError` con el
  mensaje del backend. Si el servidor no responde, el error lo explica.
- `evento.service.js`, `cliente.service.js` y `servicio.service.js` exponen
  una función por operación (`getEventos`, `createEvento`, `cambiarEstadoEvento`,
  `deleteEvento`, ...). Las pantallas solo llaman a estas funciones.
- El hook `useAsync` ejecuta esas funciones y le da a cada pantalla los
  estados de carga, error y datos, con la opción de reintentar.

Ningún dato del negocio está escrito a mano en los componentes: servicios,
clientes y eventos vienen de la API, y los datos fijos (dirección, WhatsApp,
horarios) están en un solo archivo, `utils/constants.js`.

## Respuesta visual ante cada acción

- **Carga:** spinner con texto en las pantallas y tarjetas "esqueleto" en la
  grilla de servicios. Los botones muestran un indicador mientras se guarda.
- **Éxito y error:** un único sistema de notificaciones laterales
  (`useToast`). Lo usan las altas, ediciones, cambios de estado y
  eliminaciones, y también los errores que devuelve la API (por ejemplo, una
  fecha que se superpone con otro evento confirmado). No se usa `alert()`.
- **Validaciones:** el formulario aplica las mismas reglas que el backend
  (fecha no pasada, hora de fin posterior a la de inicio, invitados enteros
  mayores a cero, campos obligatorios). Los errores aparecen junto a cada
  campo, el foco va al primero con problemas y una notificación resume
  cuántos hay.
- **Confirmación:** eliminar o cancelar un evento abre una ventana de
  confirmación que describe exactamente qué evento se va a afectar.
- **Estados vacíos y fallas:** listados vacíos, filtros sin resultados,
  eventos inexistentes y API caída tienen su propio mensaje con una acción
  (reintentar, ver todos, volver al listado).

Además, la interfaz solo ofrece las acciones que el estado del evento
permite (por ejemplo, un evento Confirmado no muestra "Eliminar" y explica
que primero hay que cancelarlo). La API igual vuelve a validar todo.

## Accesibilidad

- Estructura semántica (`header`, `nav`, `main`, `section`, `aside`,
  `footer`), un solo `h1` por pantalla y enlace "Saltar al contenido".
- Cada `label` está asociado a su campo, y las ayudas y los errores se vinculan
  con `aria-describedby` y `aria-invalid`. Los grupos de opciones usan
  `fieldset` y `legend`.
- Botones reales para las acciones y enlaces para la navegación. Los íconos
  son decorativos (`aria-hidden`) y siempre van acompañados de texto.
- Textos alternativos descriptivos en las fotos.
- Las notificaciones se anuncian en una región `aria-live`. La ventana de
  confirmación usa `<dialog>`: atrapa el foco, se cierra con Escape y devuelve
  el foco al botón que la abrió.
- Al cambiar de pantalla se vuelve arriba y el foco pasa al contenido
  principal. Los enlaces a secciones (`/#servicios`) llevan el foco a esa
  sección.
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
  dibujaba esa sección. Se agregó para que el enlace lleve a algún lugar, con
  las fotos reales del salón y un acceso a Instagram.
- **Enlace "Eventos" en la navegación.** Da acceso al panel de gestión, que es
  la parte del sistema conectada a la API.
- **Tarjetas de servicio con precio y "Consultar fecha".** Llevan al
  formulario con ese servicio ya elegido.
- **Pantallas internas con la misma identidad.** Usan el mismo encabezado
  borgoña, las mismas tipografías y los mismos componentes que la landing.
