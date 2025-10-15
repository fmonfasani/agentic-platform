# IOpeer
# 🧠 IOPeer Modular Architecture

**IOPeer** es un framework modular para agentes inteligentes y procesos autónomos.
Su diseño se basa en una arquitectura **por capas cognitivas**, donde cada módulo representa una función fundamental dentro del ciclo de aprendizaje, acción, y reflexión.

---

## 🧬 Estructura General

```
iopeer/
├── __init__.py
│
├── tool/                ← Tool Layer
│   ├── __init__.py
│   └── agents/
│       ├── __init__.py
│       ├── git_agent/
│       │   ├── git_autopilot.py
│       │   ├── git_diagnostic.py
│       │   └── git_health.py
│       └── backend_agent/
│           ├── build.py
│           ├── runtime.py
│           └── repair.py
│
├── data/                ← Data Layer
│   ├── __init__.py
│   ├── memory/
│   │   ├── tiny_memory.py
│   │   ├── sqlite_memory.py
│   │   └── supabase_memory.py
│   ├── storage_adapter.py
│   └── telemetry.py
│
├── metrics/             ← Eval Layer
│   ├── __init__.py
│   ├── eval_layer.py
│   ├── scoring.py
│   └── reports.py
│
├── reflection/          ← Reflection Layer
│   ├── __init__.py
│   ├── analyzer.py
│   ├── reasoning.py
│   └── recommender.py
│
├── planning/            ← Planning Layer
│   ├── __init__.py
│   ├── planner.py
│   ├── goals.py
│   └── tasks.py
│
├── learning/            ← Loops Layer
│   ├── __init__.py
│   ├── repair_loop.py
│   ├── feedback_loop.py
│   └── adaptation_loop.py
│
└── utils/               ← utilitarios compartidos
    ├── __init__.py
    ├── logger.py
    ├── shell_tools.py
    └── apply_patch.py
```

---

## 🧠 Capas Cognitivas

| Capa                 | Módulo / Carpeta        | Rol principal                                                    |
| -------------------- | ----------------------- | ---------------------------------------------------------------- |
| **Tool Layer**       | `tool/agents/*`         | Agentes operativos (Git, backend, web, deploy).                  |
| **Data Layer**       | `data/memory/*`         | Persistencia, logs, métricas, reflexiones.                       |
| **Eval Layer**       | `metrics/eval_layer.py` | Análisis heurístico y cuantitativo del rendimiento.              |
| **Reflection Layer** | `reflection/*`          | Interpretación de resultados (IA o heurística).                  |
| **Planning Layer**   | `planning/*`            | Estrategia, decisiones futuras, objetivos.                       |
| **Learning Layer**   | `learning/*`            | Ciclos de mejora continua: diagnóstico → reflexión → adaptación. |

---

## 🚀 Filosofía de Diseño

Cada capa representa una **función cognitiva o sistémica** dentro del ciclo de mejora continua:

1. **Tool Layer:** ejecuta acciones concretas (por ejemplo, analizar un repositorio Git).
2. **Data Layer:** registra los resultados, estados, logs, y métricas.
3. **Metrics Layer:** evalúa el rendimiento cuantitativamente.
4. **Reflection Layer:** interpreta los resultados usando IA o heurísticas.
5. **Planning Layer:** decide las siguientes acciones o estrategias.
6. **Learning Layer:** integra todo el ciclo en un loop autónomo.

---

## 🧬 Ejemplo de uso

```python
from iopeer.tool.agents.git_agent import GitAutopilot
from iopeer.data.memory import TinyMemory
from iopeer.metrics import EvalLayer
from iopeer.reflection import Reasoner
from iopeer.planning import Planner
from iopeer.learning import FeedbackLoop

if __name__ == "__main__":
    agent = GitAutopilot()
    result = agent.run()
    EvalLayer.evaluate(result)
```

---

## 🔄 Migración desde `iopeer`

### 📁 Estructura actual

```
scripts/
└── iopeer/
    ├── agents/
    ├── core/
    ├── loops/
    ├── modules/
    ├── repair_agent.py
    └── ...
```

### 📦 Nueva estructura destino

```
packages/iopeer/
└── {tool, data, metrics, reflection, planning, learning, utils}/
```

---

### 🖯 Pasos para migrar

#### 1️⃣ Mover las carpetas base

```bash
mv scripts/iopeer/agents packages/iopeer/tool/
mv scripts/iopeer/core/memory packages/iopeer/data/
mv scripts/iopeer/core/eval_layer.py packages/iopeer/metrics/
mv scripts/iopeer/core/reflection_layer.py packages/iopeer/reflection/
mv scripts/iopeer/loops packages/iopeer/learning/
mv scripts/iopeer/core/utils_core.py packages/iopeer/utils/
```

#### 2️⃣ Crear carpetas nuevas y `__init__.py`

```bash
mkdir -p packages/iopeer/{planning,metrics,reflection,learning,utils}
touch packages/iopeer/{planning,metrics,reflection,learning,utils}/__init__.py
```

#### 3️⃣ Actualizar imports (VS Code → *Find & Replace*)

* Buscar:
  `from iopeer.core.memory`
  Reemplazar por:
  `from iopeer.data.memory`

* Buscar:
  `from iopeer.agents`
  Reemplazar por:
  `from iopeer.tool.agents`

#### 4️⃣ Actualizar `Makefile` (si lo usás)

Reemplazá todas las rutas:

```
scripts/iopeer/agents/git_agent/
```

por

```
packages/iopeer/tool/agents/git_agent/
```

#### 5️⃣ Verificación final

Ejecutá:

```bash
cd packages/iopeer
python -m iopeer.tool.agents.git_agent.git_autopilot
```

y confirmá que los logs se guardan en `iopeer/data/memory/tiny_memory.json`.

---

## ✅ Ventajas del nuevo modelo

* Claridad semántica: cada módulo representa una función cognitiva.
* Escalabilidad: se pueden agregar nuevos agentes o memorias sin romper dependencias.
* Reutilización: los módulos `data`, `metrics` y `reflection` son independientes.
* Listo para empaquetar en **PyPI** (`pyproject.toml` minimalista).
* Compatible con CI/CD y despliegues (`Makefile` o `invoke`).

---

## 🧠 Próximos pasos

1. Agregar `externals/` para integraciones (APIs, servicios cloud, etc.).
2. Implementar `iopeer.learning.feedback_loop` con conexión a métricas reales.
3. Publicar en TestPyPI:

   ```bash
   cd packages/iopeer
   python -m build
   python -m twine upload --repository testpypi dist/*
   ```

---

## ⚙️ Instalación y configuración

### 1️⃣ Requisitos

* Python 3.10+
* `pip install openai python-dotenv tinydb`
* Archivo `.env` en la raíz de `scripts/`:

  ```bash
  OPENAI_API_KEY=tu_clave_openai
  ```

### 2️⃣ Ejecutar desde `Makefile`

El sistema detecta automáticamente si estás en **Git Bash** o **WSL**, y usa el intérprete correcto.

```bash
# Diagnóstico y aprendizaje automático de Git
make git-auto

# Solo diagnóstico
make git-di

# Reparación automática
make repair-git

# Reporte Markdown
make report-git

# Commit con IA
make ai-commit
```

---

## 📊 Registro y memoria

El sistema usa `tiny_memory.py` para almacenar cada ejecución como experiencia:

```json
{
  "agent": "git",
  "command": "git pull --rebase",
  "status": "error",
  "output": "cannot pull with rebase: unstaged changes",
  "timestamp": "2025-10-14T22:13:00Z"
}
```

Estos registros permiten:

* Generar métricas históricas.
* Identificar patrones de fallas.
* Alimentar el `EvalLayer` para puntuación de rendimiento.

---

## 🧮 Evaluación y puntuación

El módulo `eval_layer.py` analiza las ejecuciones y devuelve métricas cuantitativas:

```python
{
  "agent": "git",
  "status": "evaluated",
  "score": 0.75,
  "success": 3,
  "errors": 1
}
```

Esta puntuación podrá usarse para dashboards, recompensas internas o métricas de fiabilidad.

---

## 🧠 Roadmap de evolución

| Etapa     | Objetivo                  | Descripción                                        |
| --------- | ------------------------- | -------------------------------------------------- |
| ✅ Fase 1  | Git Agent operativo       | Diagnóstico, reparación y commits automáticos      |
| 🚧 Fase 2 | Aprendizaje general       | Reflexión de errores y mejora automática           |
| 🔜 Fase 3 | Backend/Frontend Agents   | Extensión de la arquitectura a otros entornos      |
| 🔜 Fase 4 | Dashboard y reporting     | Interfaz visual con métricas en tiempo real        |
| 🔜 Fase 5 | Sincronización en la nube | Supabase / Postgres para persistencia centralizada |
| 🔜 Fase 6 | Agentes colaborativos     | Intercomunicación entre agentes especializados     |

---

## 🧩 Filosofía del proyecto

Cada agente es **independiente pero interoperable**.
El objetivo es construir una red de agentes capaces de **aprender del uso real del sistema**, detectar errores, proponer soluciones y evolucionar con mínima intervención humana.

> “El código que se corrige a sí mismo no es un sueño, es la próxima capa de abstracción.”

---

## 👤 Autor

**Federico Monfasani**
Ingeniero en Telecomunicaciones y Desarrollador de Software
📧 [fmonfasani@gmail.com](mailto:fmonfasani@gmail.com)
🌐 [github.com/fmonfasani](https://github.com/fmonfasani)
