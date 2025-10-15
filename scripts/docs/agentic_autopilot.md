# 🧠 Agentic Autopilot System

## Descripción general

`agentic_autopilot` es el módulo de **automatización inteligente y aprendizaje continuo** de la plataforma.
Su objetivo es permitir que distintos agentes —como `GitAgent`, `BackendAgent` o `WebAgent`— **ejecuten tareas reales, aprendan de sus resultados y se auto-mejoren con IA**.

El sistema combina componentes de ejecución, memoria, evaluación y reflexión para construir un flujo de mejora continua completamente modular y reutilizable.

---

## 🚀 Arquitectura general

### Estructura de directorios

```
scripts/
├── Makefile
├── agent-diagnostics.ts
└── agentic_autopilot/
    ├── core/
    │   ├── eval_layer.py              # Evaluación y scoring de ejecuciones
    │   └── memory/
    │       └── tiny_memory.py         # Memoria persistente basada en TinyDB
    │
    ├── agents/
    │   └── git_agent/
    │       ├── git_autopilot.py       # Orquestador principal del agente Git
    │       ├── git_health.py          # Diagnóstico del entorno Git
    │       ├── git_repair.py          # Reparación automática
    │       ├── git_commit_ai.py       # Mensajes de commit generados con IA
    │       ├── git_status_reporter.py # Generación de reportes Markdown
    │       ├── utils_git.py           # Funciones y helpers comunes
    │       └── memory/git_logs.json   # Logs locales de ejecución
    │
    ├── loops/                         # (Próximamente) bucles de aprendizaje continuo
    ├── modules/                       # (Próximamente) herramientas de análisis compartidas
    └── __init__.py
```

---

## 🧩 Capas del sistema

| Capa                 | Archivo principal               | Función                                               |
| -------------------- | ------------------------------- | ----------------------------------------------------- |
| **Tool Layer**       | `agents/git_agent/*`            | Ejecuta tareas concretas (Git, build, deploy).        |
| **Data Layer**       | `core/memory/tiny_memory.py`    | Guarda logs, métricas, errores y reflexiones.         |
| **Eval Layer**       | `core/eval_layer.py`            | Evalúa heurísticamente la calidad de las ejecuciones. |
| **Reflection Layer** | (parcial en `git_autopilot.py`) | Analiza errores con GPT y genera sugerencias.         |
| **Planning Layer**   | *(en desarrollo)*               | Planifica acciones futuras según resultados previos.  |

---

## 🧠 Flujo general de aprendizaje

1. **Ejecución:** el agente ejecuta una tarea real (ej. comandos Git).
2. **Registro:** los resultados se guardan en la memoria local (`TinyMemory`).
3. **Evaluación:** `EvalLayer` analiza los logs y genera métricas.
4. **Reflexión:** el sistema consulta a GPT para interpretar errores y proponer soluciones.
5. **Reentrenamiento:** los resultados se almacenan como “experiencia” para mejorar futuras ejecuciones.

---

## ⚙️ Ejecución desde Makefile

El `Makefile` detecta automáticamente si se ejecuta en **Git Bash o WSL**
y elige el intérprete Python correcto.

### Comandos disponibles

```bash
make git-auto       # Ejecuta el Git Autopilot completo
make git-di         # Diagnóstico de Git
make repair-git     # Reparación automática del repo
make report-git     # Genera un reporte Markdown del estado del repo
make ai-commit      # Commit automático con mensaje IA
make fix-back       # Repara backend con agentes
make fix-web        # Repara frontend con agentes
```

---

## 🧮 Dependencias básicas

```bash
pip install openai python-dotenv tinydb
```

Opcional:

```bash
pip install colorama rich
```

---

## 💾 Memoria (TinyDB)

Todos los agentes guardan sus ejecuciones, errores y métricas dentro de una base local gestionada por `TinyMemory`.

**Ubicación por defecto:**
`scripts/agentic_autopilot/core/memory/tiny_memory.json`

Cada entrada almacena:

```json
{
  "timestamp": "2025-10-14T17:32:00Z",
  "agent": "git",
  "command": "git pull --rebase",
  "status": "error",
  "output": "...",
  "score": 0.5,
  "tags": ["conflict"]
}
```

---

## 🔁 Ciclo de vida de un agente

1. **Inicialización** → carga variables del entorno (`.env`)
2. **Ejecución** → corre comandos o tareas específicas
3. **Evaluación** → analiza resultados con `EvalLayer`
4. **Memorización** → registra datos en `TinyMemory`
5. **Reflexión** → GPT analiza logs y sugiere mejoras
6. **Aprendizaje** → el sistema ajusta sus prompts y estrategias

---

## 🧪 Estado actual

| Módulo           | Estado           | Descripción                                  |
| ---------------- | ---------------- | -------------------------------------------- |
| Git Agent        | ✅ Operativo      | Ejecuta, analiza y aprende de comandos Git.  |
| Backend Agent    | 🧩 En desarrollo | Autoreparación de API y DB.                  |
| Frontend Agent   | 🧩 En desarrollo | Diagnóstico y build de web apps.             |
| Core Layer       | ✅ Estable        | Base común para todos los agentes.           |
| Reflection Layer | 🔄 Parcial       | GPT ya analiza errores y genera sugerencias. |

---

## 🌱 Próximos pasos

* Implementar **TinyMemory global** para todos los agentes.
* Agregar **bucles de aprendizaje continuo (`loops/`)**.
* Crear **Dashboard de visualización** de métricas.
* Integrar **evals automáticos** y comparación de versiones.
* Extender el sistema a **backend y frontend agents**.

---

## 📘 Licencia

MIT License © 2025 — Intelligent Agents Platform
Desarrollado por **F. Monfasani** 🧠
