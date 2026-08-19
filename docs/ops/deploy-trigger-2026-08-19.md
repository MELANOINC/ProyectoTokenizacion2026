# NOTORIUS Miami production deploy trigger

Fecha: 2026-08-19

Objetivo: disparar el deployment de Vercel Production desde el `main` vigente, sin modificar runtime ni funcionalidad.

Gobierno: despliegue productivo aprobado por Bruno Melano + Paola Soria.

Criterio de éxito:
- `https://notorius.melanoinc.com/miami` -> HTTP 200
- `https://notorius.melanoinc.com/api/miami-pilot` -> HTTP 200
- CRM health operativo
