# Carpe Eventos — Repositorio del Proyecto

Salón de eventos en Versalles, CABA. Este repositorio contiene el desarrollo
del sistema web (frontend + backend) para Carpe Eventos: la landing del
salón y un sistema de reservas con cuentas de usuario, presupuestos,
calendario de disponibilidad y panel de gestión.

## Cómo correrlo

Se necesitan dos terminales (Node.js 20.19 o superior):

```bash
# Terminal 1 — API
cd Proyecto/Backend
npm install
npm start          # http://localhost:3000

# Terminal 2 — Interfaz
cd Proyecto/Frontend
npm install
npm run dev        # http://localhost:5173
```

Usuarios de prueba:

| Rol           | Email                        | Contraseña    |
|---------------|------------------------------|---------------|
| Administrador | `admin@carpeeventos.com.ar`  | `admin1234`   |
| Cliente       | `marina.gomez@example.com`   | `cliente1234` |
| Cliente       | `lucia.alvarez@example.com`  | `cliente1234` |

Los datos viven en memoria: al reiniciar el backend vuelven a los de prueba.

## Qué se puede hacer

| Perfil        | Funcionalidades                                                                 |
|---------------|---------------------------------------------------------------------------------|
| Visitante     | Ver la landing y el catálogo, consultar el calendario de disponibilidad, registrarse. |
| Cliente       | Pedir una fecha (con presupuesto estimado y disponibilidad en vivo), aprobar o rechazar su presupuesto, modificar o cancelar sus reservas, ver su historial y editar sus datos. |
| Administrador | Panel de eventos por estado, generar presupuestos, confirmar/iniciar/finalizar/cancelar/eliminar eventos, gestión de clientes con historial y gestión del catálogo de servicios. |

Flujo de una reserva: **Pendiente → Presupuestado → Confirmado → En curso →
Finalizado** (o **Cancelado**). El monto del presupuesto lo calcula el
sistema y un evento solo se confirma con el presupuesto aprobado y la franja
horaria libre. Todas las reglas están detalladas en `Backend/README.md`.

## Estructura

```
Proyecto/
├── Frontend/                          # Interfaz en React + Vite, conectada a la API
│   ├── package.json
│   ├── README.md                      # pantallas, flujo, consumo de la API y accesibilidad
│   ├── index.html
│   ├── public/                        # favicon
│   └── src/
│       ├── App.jsx                    # rutas (públicas y protegidas) y proveedores globales
│       ├── main.jsx                   # punto de entrada
│       ├── assets/                    # íconos SVG y fotos del salón
│       ├── components/                # componentes reutilizables (layout, ui, eventos, presupuestos...)
│       ├── context/                   # notificaciones y sesión del usuario
│       ├── hooks/                     # lógica reutilizable (carga de datos, formularios, sesión...)
│       ├── pages/                     # una pantalla por archivo
│       ├── services/                  # comunicación con la API (único lugar con fetch)
│       ├── styles/                    # variables de diseño y estilos globales
│       └── utils/                     # formateo, validaciones, estados, roles y constantes
│
├── Backend/                           # API en Node.js/Express, arquitectura MVC
│   ├── package.json
│   ├── README.md                      # endpoints, roles, reglas de negocio y ejemplos con curl
│   └── src/
│       ├── app.js                     # configuración de Express (middlewares, rutas, errores)
│       ├── server.js                  # punto de entrada: datos de prueba, estados automáticos y servidor
│       ├── config/                    # aforo, reglas de cotización y autenticación
│       ├── routes/                    # endpoints por entidad, con el rol que puede usar cada uno
│       ├── middlewares/               # autenticación/autorización, errorHandler y notFoundRoute
│       ├── controllers/               # traducen HTTP <-> services. Sin lógica de negocio.
│       ├── services/                  # reglas de negocio y validaciones.
│       ├── repositories/              # acceso a los arrays en memoria (CRUD puro).
│       ├── models/                    # Cliente, Servicio, Evento, Presupuesto y Usuario
│       ├── responses/                 # ApiResponse: formato consistente de toda respuesta HTTP
│       ├── exceptions/                # AppError y subclases (400, 401, 403, 404, 409, 422, 500)
│       ├── enums/                     # mensajes, estados de evento y presupuesto, roles
│       ├── data/                      # datos de prueba
│       └── utils/                     # validadores, fechas, jwt, permisos, asyncHandler, parseId
│
└── docs/                              # entregables de análisis (no son código)
    ├── DIAGRAMA.md                    # diagrama de clases del dominio (Mermaid)
    ├── CarpeEventos-AnalisisSistema.docx  # funcionalidades, reglas de negocio, estados, etc.
    ├── CarpeEventos-EntregableFinal.docx  # identidad visual y wireframe
    └── 03-carpe-eventos.docx          # ficha técnica del negocio
```

## Modelo del dominio

Ver `docs/DIAGRAMA.md` para el diagrama de clases (formato Mermaid) con
atributos y relaciones entre entidades.

Las clases en `Backend/src/models/` son representaciones puras del dominio
(sin lógica de negocio ni de persistencia). El análisis funcional completo
—funcionalidades, reglas de negocio, validaciones, tipos de usuario y
estados del sistema— está en `docs/CarpeEventos-AnalisisSistema.docx`.

## Backend — API con arquitectura MVC

El backend implementa el patrón **MVC** (`routes → middlewares → controllers
→ services → repositories → models`) con persistencia en memoria (arrays),
autenticación con JWT y roles, y manejo centralizado de errores. Ver
`Backend/README.md` para el detalle de endpoints, permisos por rol, reglas
de negocio implementadas y ejemplos de uso con `curl`.

## Frontend — React + Vite

Interfaz que respeta el boceto de la landing (identidad visual y wireframe
de la Entrega 1) y suma el sistema de reservas: registro e inicio de sesión,
pedido de fechas, presupuestos, calendario y el panel de gestión del salón,
todo contra la API del backend. Ver `Frontend/README.md`.
