# Carpe Eventos — Repositorio del Proyecto

Salón de eventos en Versalles, CABA. Este repositorio contiene el desarrollo
del sitio web (frontend + backend) para Carpe Eventos.

## Estructura

```
Proyecto/
├── Frontend/                          # Interfaz en React + Vite, conectada a la API
│   ├── package.json
│   ├── README.md                      # instrucciones, estructura y decisiones de diseño
│   ├── index.html
│   ├── public/                        # favicon
│   └── src/
│       ├── App.jsx                    # rutas y proveedores globales
│       ├── main.jsx                   # punto de entrada
│       ├── assets/                    # íconos SVG y fotos del salón
│       ├── components/                # componentes reutilizables (layout, ui, home, eventos...)
│       ├── context/                   # sistema de notificaciones
│       ├── hooks/                     # lógica reutilizable (carga de datos, foco, etc.)
│       ├── pages/                     # una pantalla por archivo
│       ├── services/                  # comunicación con la API (único lugar con fetch)
│       ├── styles/                    # variables de diseño y estilos globales
│       └── utils/                     # formateo, validaciones, estados y constantes
│
├── Backend/                           # API en Node.js/Express, arquitectura MVC
│   ├── package.json
│   ├── package-lock.json
│   ├── .gitignore
│   ├── README.md                      # instrucciones para correr y probar la API
│   └── src/
│       ├── app.js                     # configuración de Express (middlewares, rutas, errores)
│       ├── server.js                  # punto de entrada, levanta el servidor HTTP
│       ├── controllers/               # traducen HTTP <-> services. Sin lógica de negocio.
│       ├── services/                  # reglas de negocio y validaciones.
│       ├── repositories/              # acceso a los arrays en memoria (CRUD puro).
│       ├── models/                    # clases de dominio
│       │   ├── Cliente.js
│       │   ├── Servicio.js
│       │   ├── Evento.js
│       │   └── Presupuesto.js
│       ├── routes/                    # definición de endpoints por entidad
│       ├── middlewares/               # errorHandler (centralizado) y notFoundRoute
│       ├── responses/                 # ApiResponse: formato consistente de toda respuesta HTTP
│       ├── exceptions/                # AppError y subclases (BadRequestError, NotFoundError, etc.)
│       ├── enums/                     # Messages.js y EstadoEvento.js
│       └── utils/                     # validadores, idGenerator, asyncHandler, parseId
│
└── docs/                              # entregables de análisis (no son código)
    ├── DIAGRAMA.md                    # diagrama de clases del dominio (Mermaid)
    └── CarpeEventos-AnalisisSistema.docx  # funcionalidades, reglas de negocio, estados, etc.
```

## Modelo del dominio

Ver `docs/DIAGRAMA.md` para el diagrama de clases (formato Mermaid) con
atributos, métodos y relaciones entre entidades.

Las clases en `Backend/src/models/` son representaciones puras del dominio
(sin lógica de negocio ni de persistencia). El análisis funcional completo
—funcionalidades, reglas de negocio, validaciones, tipos de usuario y
estados del sistema— está en `docs/CarpeEventos-AnalisisSistema.docx`.

## Backend — API con arquitectura MVC

El backend implementa el patrón **MVC** (`controllers → services →
repositories → models`) con persistencia en memoria (arrays) y manejo
centralizado de errores. La entidad principal del CRUD es **Evento**.

Para correrlo:

```bash
cd Backend
npm install
npm start
```

Ver `Backend/README.md` para el detalle completo de endpoints, reglas de
negocio implementadas y ejemplos de uso con `curl`.

## Frontend — React + Vite

Interfaz que respeta el boceto de la landing (identidad visual y wireframe
de la Entrega 1) y agrega el panel de gestión de eventos: listado con
filtros, alta, edición, cambios de estado y eliminación con confirmación,
todo contra la API del backend.

Para correrlo (con el backend ya levantado en el puerto 3000):

```bash
cd Frontend
npm install
npm run dev        # http://localhost:5173
```

Ver `Frontend/README.md` para la estructura de carpetas, el consumo de la
API, el manejo de errores y notificaciones, y las decisiones de
accesibilidad.
