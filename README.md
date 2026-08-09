# Carpe Eventos — Repositorio del Proyecto

Salón de eventos en Versalles, CABA. Este repositorio contiene el desarrollo
del sitio web (frontend + backend) para Carpe Eventos.



## Estructura

```
Proyecto/
├── Frontend/          # Vacía por ahora — acá irá el desarrollo del frontend
└── Backend/
    └── src/
        └── models/     # Clases JS que representan el dominio del negocio
            ├── Cliente.js
            ├── Servicio.js
            ├── Evento.js
            └── Presupuesto.js
```

## Modelo del dominio

Ver `DIAGRAMA.md` para el diagrama de clases (formato Mermaid) con atributos,
métodos y relaciones entre entidades.

Las clases en `Backend/src/models/` son representaciones puras del dominio.
