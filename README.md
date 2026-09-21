# Carpe Eventos — Repositorio del Proyecto

Salón de eventos en Versalles, CABA. Este repositorio contiene el desarrollo
del sitio web (frontend + backend) para Carpe Eventos.

## Estructura

```
Proyecto/
├── Frontend/                          # Vacía por ahora — acá irá el desarrollo del frontend
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
