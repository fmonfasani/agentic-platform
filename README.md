# Agentic Platform · Integración con OpenAI AgentKit

Este monorepo contiene el backend (NestJS + Prisma) y el frontend (Next.js) necesarios para operar el panel de agentes del ENACOM integrado con **OpenAI AgentKit**.

La integración permite:

- Registrar automáticamente cada agente del catálogo en Agent Builder.
- Conversar con los agentes desde la UI mediante ChatKit embebido (con fallback local).
- Exponer los endpoints existentes (`use`, `download`, `reward`, `rate`, etc.) como herramientas invocables por los agentes durante un flujo.
- Registrar trazas de ejecución y obtener evaluaciones automáticas (trace grading) para cada ejecución.

## Configuración rápida

1. **Variables de entorno (backend `apps/api`)**

   | Variable | Descripción |
   | --- | --- |
   | `DATABASE_URL` | Ruta SQLite (por defecto `file:./dev.db`). |
   | `OPENAI_API_KEY` | API key con acceso a AgentKit/Responses/Evals. |
   | `OPENAI_ORG_ID` | (Opcional) ID de la organización en OpenAI. |
   | `OPENAI_PROJECT_ID` | (Opcional) ID de proyecto para el Agent Builder. |
   | `OPENAI_AGENT_MODEL` | Modelo por defecto (ej. `gpt-4.1-mini`). |
   | `OPENAI_EVAL_MODEL` | Modelo usado para grading (ej. `o4-mini`). |

2. **Variables de entorno (frontend `apps/web`)**

   | Variable | Descripción |
   | --- | --- |
   | `NEXT_PUBLIC_ENACOM_API_URL` | URL del backend NestJS (p. ej. `http://localhost:3001`). |
   | `NEXT_PUBLIC_CHATKIT_CDN` | (Opcional) CDN de ChatKit embebido. |

3. **Instalar dependencias**

   ```bash
   pnpm install
   pnpm prisma migrate deploy --filter api
   ```

4. **Levantar los servicios**

   ```bash
   # Backend NestJS
   pnpm --filter api start:dev

   # Frontend Next.js
   pnpm --filter web dev
   ```

5. **Accesos y permisos**

   - La API key debe tener habilitado Agent Builder/AgentKit y evaluaciones.
   - Configurá CORS en el backend para el dominio del frontend (ya habilitado por defecto para `localhost`).

## Flujo desde la UI

1. En el dashboard, seleccionar un agente y abrir el modal “Chat del agente”.
2. El frontend solicitará al backend una sesión de ChatKit (`POST /api/agents/:id/chat-session`). Si ChatKit no está disponible, se activa un panel fallback que usa directamente el endpoint de ejecución (`POST /api/agents/:id`).
3. El backend registra (o actualiza) el agente en Agent Builder, ejecuta la conversación vía Responses API y atiende las llamadas a herramientas (`use`, `download`, `reward`, `rate`, `consultar_metricas`).
4. Tras finalizar la conversación, se almacena la traza (`AgentTrace`) y se solicita una evaluación automática usando el modelo definido en `OPENAI_EVAL_MODEL`.
5. Las trazas y su calificación se muestran en el modal y pueden consultarse desde `GET /api/agents/:id/traces`.

## Endpoints principales

- `GET /api/agents` – listado resumido de agentes con métricas actuales.
- `GET /api/agents/:id` – detalle del agente incluyendo configuración AgentKit.
- `POST /api/agents/:id/run` – ejecuta una conversación/respuesta con el agente.
- `POST /api/agents/:id/chat-session` – crea una sesión embebible de ChatKit.
- `GET /api/agents/:id/traces` – devuelve las últimas trazas evaluadas.
- `POST /agents/:id/use|download|reward|rate` – herramientas expuestas al agente y reutilizables por UI.

## Consideraciones adicionales

- El backend agrega automáticamente instrucciones si el agente aún no tiene configuración personalizada (`Agent.instructions`).
- Las trazas y evaluaciones se almacenan en SQLite (`AgentTrace`).
- Si no hay `OPENAI_API_KEY`, las rutas de ejecución devolverán `503` y el frontend utilizará el fallback local.
- Podés extender la evaluación automática ajustando el prompt en `AgentRunnerService.evaluateRun`.

## Lanzar un agente desde la UI

1. Abrí el panel web y haz clic en “Abrir chat del agente”.
2. Chateá desde el componente ChatKit (o fallback) y pide acciones como “descargar informe”.
3. Las herramientas configuradas llamarán a los endpoints del backend para registrar cada acción.
4. Revisa el apartado “Últimas ejecuciones” para ver la traza, la calificación y acceder al enlace externo de seguimiento (`traceUrl`) si está disponible.

## Base de datos y seed

- Para regenerar la base de datos con los agentes demo ejecutá:

  ```bash
  pnpm -C apps/api prisma db seed
  ```

- El script `apps/api/prisma/seed.ts` crea agentes con métricas iniciales para la demo del dashboard.
