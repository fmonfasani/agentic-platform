# Iopeer Migration Plan

## Objetivo
Migrar el módulo `scripts/agentic_autopilot` a la nueva librería modular `packages/iopeer`, organizada en capas cognitivas (tool, data, metrics, reflection, planning, learning y utils) para habilitar empaquetado limpio (`pip install iopeer`).

## Estructura final esperada
```
iopeer/
├── __init__.py
├── tool/
│   ├── __init__.py
│   └── agents/
│       ├── __init__.py
│       ├── git_agent/
│       │   ├── __init__.py
│       │   ├── git_autopilot.py
│       │   ├── git_diagnostic.py
│       │   └── git_health.py
│       └── backend_agent/
│           ├── __init__.py
│           ├── build.py
│           ├── runtime.py
│           └── repair.py
├── data/
│   ├── __init__.py
│   ├── memory/
│   │   ├── __init__.py
│   │   ├── tiny_memory.py
│   │   ├── sqlite_memory.py
│   │   └── supabase_memory.py
│   ├── storage_adapter.py
│   └── telemetry.py
├── metrics/
│   ├── __init__.py
│   ├── eval_layer.py
│   ├── scoring.py
│   └── reports.py
├── reflection/
│   ├── __init__.py
│   ├── analyzer.py
│   ├── reasoning.py
│   └── recommender.py
├── planning/
│   ├── __init__.py
│   ├── planner.py
│   ├── goals.py
│   └── tasks.py
├── learning/
│   ├── __init__.py
│   ├── repair_loop.py
│   ├── feedback_loop.py
│   └── adaptation_loop.py
└── utils/
    ├── __init__.py
    ├── logger.py
    ├── shell_tools.py
    ├── apply_patch.py
    └── env_check.py
```

## Tabla de mapeo (antes → después)

| Origen `scripts/agentic_autopilot`                     | Destino `packages/iopeer`                               | Notas |
|--------------------------------------------------------|----------------------------------------------------------|-------|
| agents/git_agent/*                                     | tool/agents/git_agent/*                                  | Conserva estructura interna |
| agents/backend/*                                       | tool/agents/backend_agent/*                              | Renombrar a `backend_agent` |
| agents/frontend/*                                      | tool/agents/frontend_agent/* (si se requiere)            | Inicialmente opcional |
| core/memory/*                                          | data/memory/*                                            | Mantener implementaciones |
| core/data_layer.py                                     | data/storage_adapter.py                                  | Ajustar interfaz |
| core/eval_layer.py                                     | metrics/eval_layer.py                                    | Preparar futuras métricas |
| core/reflection_layer.py                               | reflection/analyzer.py                                   | Posible modularización posterior |
| core/utils_core.py                                     | utils/shell_tools.py                                     | Agrupar con utilidades de shell |
| core/tiny_logger.py                                    | utils/logger.py                                          | Centralizar logging |
| loops/backend/*                                        | learning/repair_loop.py                                  | Unificar lógicas de reparación |
| loops/frontend/*                                       | learning/feedback_loop.py                                | Integrar con feedback loop |
| autopilot_masterv*.py, repair_agent.py                 | planning/planner.py y planning/goals.py                  | Planificación y objetivos |
| auto_agent_generator.py                                | planning/tasks.py                                        | Generación de tareas/agentes |
| verify_env.py                                          | utils/env_check.py                                       | Validaciones del entorno |
| utils/apply_patch.py                                   | utils/apply_patch.py                                     | Reutilizar utilitario |
| scripts `.sh` (dev-*.sh, etc.)                         | scripts/ (raíz o `packages/iopeer/scripts`)              | Opcional según necesidades |

## Pasos de migración

1. Crear estructura base dentro de `packages/iopeer`.
2. Mover módulos del directorio `scripts/agentic_autopilot` según la tabla de mapeo.
3. Renombrar archivos cuando corresponda (`agents_backend.py` → `backend_agent/build.py`, etc.).
4. Crear `__init__.py` en todos los paquetes nuevos para garantizar importaciones limpias.
5. Actualizar imports en todo el repositorio para apuntar al nuevo namespace `iopeer`.
6. Ajustar referencias en Makefiles, scripts y documentación.
7. Eliminar archivos huérfanos y validar que no queden rutas antiguas.
8. Ejecutar los tests y validaciones indicadas.

## Refactor automático de imports

Actualizar las referencias de la antigua ruta al nuevo paquete:
- `from agentic_autopilot.core.memory` → `from iopeer.data.memory`
- `from agentic_autopilot.agents` → `from iopeer.tool.agents`
- `from agentic_autopilot.core.eval_layer` → `from iopeer.metrics.eval_layer`
- `from agentic_autopilot.core.reflection_layer` → `from iopeer.reflection.analyzer`

También reemplazar rutas en strings (p. ej. configuraciones o f-strings) que hagan referencia al árbol original.

## Pasos de verificación post-migración

1. Ejecutar `python -m compileall packages/iopeer` para asegurar que no haya errores de sintaxis.
2. Ejecutar linters/tests existentes (por ejemplo `pnpm test` o `pytest` si aplica).
3. Validar que los scripts de CLI funcionen apuntando al nuevo paquete.
4. Confirmar que los módulos se pueden importar sin modificar `sys.path`.
5. Revisar la salida de `git status` para asegurar que sólo existan los archivos esperados.
6. Revisar `tree packages/iopeer` para garantizar la estructura final.
7. Ejecutar el comando de arranque principal:
   ```bash
   cd packages/iopeer
   python -m iopeer.tool.agents.git_agent.git_autopilot
   ```

