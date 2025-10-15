# Agentic Autopilot Python Scripts — Auditoría Técnica

## 1. Mapa de archivos y responsabilidades
- `packages/iopeer/tool/agents/git_agent/`: agentes especializados en mantenimiento de Git.
- `packages/iopeer/tool/agents/backend_agent/`: agentes para errores de backend (build, runtime, dependencias, entorno) y router.
- `packages/iopeer/tool/agents/frontend_agent/`: agentes orientados a la app web.
- `packages/iopeer/data/`: capa de memoria y almacenamiento auxiliar.
- `packages/iopeer/metrics/`: evaluación de ejecuciones.
- `packages/iopeer/reflection/`: generación de insights post-ejecución.
- `packages/iopeer/learning/`: loops de reparación/aprendizaje.
- `packages/iopeer/planning/`: orquestadores y generación de agentes.
- `packages/iopeer/utils/`: utilidades compartidas (shell, logging, env, apply_patch).

## 2. Flujo general de ejecución
1. Un agente (por ejemplo `GitAutopilot`) instancia `TinyMemory`, ejecuta comandos Git y registra métricas (`EvalLayer`).
2. El agente puede invocar utilitarios (`git_health`, `git_repair`, `git_status_reporter`) y guardar información en memoria.
3. La capa de reflexión (`ReflectionLayer`) analiza los logs y guarda insights.
4. Los loops de aprendizaje (`repair_loop_web_v0.4`) clasifican errores con OpenAI y despachan agentes especializados mediante el router.

## 3. Estado actual (completo vs incompleto)
- **Completos / funcionales:**
  - `git_diagnostic.py`, `git_health.py`, `git_repair.py`, `git_status_reporter.py`, `git_diagnostic_extended.py`.
  - Capa de métricas (`metrics/eval_layer.py`) y utilidades (`utils/shell_tools.py`, `utils/env_check.py`).
  - `TinyMemory` guarda logs y sincroniza con SQLite, aunque la API difiere con otros módulos.
- **Incompletos / inconsistencias:**
  - `GitAutopilot.run` está duplicado y la segunda definición sobreescribe la primera.
  - Backend agents importan rutas inexistentes (`iopeer.tool.agents.logger`, `iopeer.tool.agents.agents_build`, etc.).
  - `backend_agent/registry.py` referencia clases que no existen con esos nombres.
  - `router_api.py` mantiene referencias a rutas antiguas (`scripts`, `agents.router`) y llaves duplicadas en el diccionario.
  - `TinyMemory.save_log` recibe un único diccionario, pero los agentes backend/frontend esperan una firma diferente.
  - `planning/planner.py` importa módulos que no existen o están vacíos (`repair_loop_api`, `repair_loop_web`).
  - Varios loops (`repair_loop.py`, `repair_loop_api.py`, `repair_loop_db.py`, etc.) son placeholders vacíos.
  - Agentes frontend dependen de módulos inexistentes (`agents.base_agent`, `modules.logger`).

## 4. Recomendaciones de arquitectura
- Normalizar la interfaz de memoria (`BaseMemory`) y asegurar que los agentes usen una API consistente (`save_log(agent, action, status, output)`).
- Consolidar los agentes backend/frontend para heredar de `BaseAgent` real y utilizar un `Logger` centralizado.
- Actualizar `router_api` para operar dentro del paquete `iopeer` (imports relativos) y evitar diccionarios con llaves duplicadas.
- Completar los loops de aprendizaje y planning, o extraerlos a módulos independientes que expongan funciones claras.
- Introducir pruebas unitarias para cada agente y simulaciones de pipeline.

## 5. Próximos pasos sugeridos
1. Definir contrato claro para la memoria y actualizar todos los agentes.
2. Reescribir `GitAutopilot` para orquestar diagnóstico, reparación y reflexión en un único `run`.
3. Migrar router y registro de agentes al namespace `iopeer.tool.agents.backend_agent`.
4. Completar los loops y planners con lógica real o eliminarlos hasta tener implementación.
5. Añadir CLI/servicios que expongan la orquestación y métricas de manera consistente.

