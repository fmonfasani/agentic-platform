#!/bin/bash

set -euo pipefail

SRC_DIR="scripts/agentic_autopilot"
DEST_DIR="packages/iopeer"

log() {
  echo -e "[$(date +'%Y-%m-%d %H:%M:%S')] $1"
}

log "🚀 Iniciando migración de $SRC_DIR hacia $DEST_DIR"

if [[ ! -d "$SRC_DIR" ]]; then
  log "❌ Directorio fuente no encontrado: $SRC_DIR" >&2
  exit 1
fi

mkdir -p "$DEST_DIR"

log "📁 Creando estructura modular en $DEST_DIR"
mkdir -p "$DEST_DIR"/{tool/agents/git_agent,tool/agents/backend_agent,tool/agents/frontend_agent,data/memory,metrics,reflection,planning,learning,utils}

log "🔧 Migrando Tool Layer"
mkdir -p "$DEST_DIR/tool/agents/git_agent"
mkdir -p "$DEST_DIR/tool/agents/backend_agent"
mkdir -p "$DEST_DIR/tool/agents/frontend_agent"

[[ -d "$SRC_DIR/agents/git_agent" ]] && mv "$SRC_DIR/agents/git_agent"/* "$DEST_DIR/tool/agents/git_agent/" || log "⚠️ Sin archivos git_agent"
[[ -d "$SRC_DIR/agents/backend" ]] && mv "$SRC_DIR/agents/backend"/* "$DEST_DIR/tool/agents/backend_agent/" || log "⚠️ Sin archivos backend"
[[ -d "$SRC_DIR/agents/frontend" ]] && mv "$SRC_DIR/agents/frontend"/* "$DEST_DIR/tool/agents/frontend_agent/" || log "ℹ️ Sin archivos frontend (opcional)"

log "💾 Migrando Data Layer"
[[ -d "$SRC_DIR/core/memory" ]] && mv "$SRC_DIR/core/memory"/* "$DEST_DIR/data/memory/" || log "⚠️ Sin módulos de memoria"
[[ -f "$SRC_DIR/core/data_layer.py" ]] && mv "$SRC_DIR/core/data_layer.py" "$DEST_DIR/data/storage_adapter.py" || log "ℹ️ data_layer.py no encontrado"

log "📊 Migrando Metrics Layer"
[[ -f "$SRC_DIR/core/eval_layer.py" ]] && mv "$SRC_DIR/core/eval_layer.py" "$DEST_DIR/metrics/eval_layer.py" || log "ℹ️ eval_layer.py no encontrado"

log "🧠 Migrando Reflection Layer"
[[ -f "$SRC_DIR/core/reflection_layer.py" ]] && mv "$SRC_DIR/core/reflection_layer.py" "$DEST_DIR/reflection/analyzer.py" || log "ℹ️ reflection_layer.py no encontrado"

log "🧩 Migrando Planning Layer"
[[ -f "$SRC_DIR/autopilot_masterv0.0.4.py" ]] && mv "$SRC_DIR/autopilot_masterv0.0.4.py" "$DEST_DIR/planning/planner.py"
[[ -f "$SRC_DIR/autopilot_masterv0.0.3.py" ]] && mv "$SRC_DIR/autopilot_masterv0.0.3.py" "$DEST_DIR/planning/planner_legacy.py"
[[ -f "$SRC_DIR/repair_agent.py" ]] && mv "$SRC_DIR/repair_agent.py" "$DEST_DIR/planning/goals.py"
[[ -f "$SRC_DIR/auto_agent_generator.py" ]] && mv "$SRC_DIR/auto_agent_generator.py" "$DEST_DIR/planning/tasks.py"

log "🔁 Migrando Learning Layer"
if [[ -d "$SRC_DIR/loops/backend" ]]; then
  cat <<'EOPY' > "$DEST_DIR/learning/repair_loop.py"
"""Entry point para el loop de reparación backend."""
# TODO: Integrar lógicas migradas desde loops/backend
EOPY
  mv "$SRC_DIR/loops/backend"/* "$DEST_DIR/learning/" || true
fi
if [[ -d "$SRC_DIR/loops/frontend" ]]; then
  cat <<'EOPY' > "$DEST_DIR/learning/feedback_loop.py"
"""Entry point para el loop de feedback frontend."""
# TODO: Integrar lógicas migradas desde loops/frontend
EOPY
  mv "$SRC_DIR/loops/frontend"/* "$DEST_DIR/learning/" || true
fi

log "🧰 Migrando Utils"
[[ -f "$SRC_DIR/core/utils_core.py" ]] && mv "$SRC_DIR/core/utils_core.py" "$DEST_DIR/utils/shell_tools.py" || log "ℹ️ utils_core.py no encontrado"
[[ -f "$SRC_DIR/core/tiny_logger.py" ]] && mv "$SRC_DIR/core/tiny_logger.py" "$DEST_DIR/utils/logger.py" || log "ℹ️ tiny_logger.py no encontrado"
[[ -f "$SRC_DIR/utils/apply_patch.py" ]] && mv "$SRC_DIR/utils/apply_patch.py" "$DEST_DIR/utils/apply_patch.py" || log "ℹ️ apply_patch.py no encontrado"
[[ -f "$SRC_DIR/verify_env.py" ]] && mv "$SRC_DIR/verify_env.py" "$DEST_DIR/utils/env_check.py" || log "ℹ️ verify_env.py no encontrado"

log "🧹 Moviendo scripts auxiliares"
find "$SRC_DIR" -maxdepth 1 -type f -name '*.sh' -print0 | while IFS= read -r -d '' script; do
  mkdir -p "$DEST_DIR/scripts"
  mv "$script" "$DEST_DIR/scripts/"
  log "   → Script migrado: $(basename "$script")"
done

log "🧱 Asegurando __init__.py"
find "$DEST_DIR" -type d -print0 | while IFS= read -r -d '' pkg; do
  if [[ ! -f "$pkg/__init__.py" ]]; then
    touch "$pkg/__init__.py"
  fi
done

log "🛠️ Actualizando imports"
python <<'PY'
import pathlib

root = pathlib.Path('.')
replacements = {
    'from agentic_autopilot.core.memory': 'from iopeer.data.memory',
    'from agentic_autopilot.agents': 'from iopeer.tool.agents',
    'from agentic_autopilot.core.eval_layer': 'from iopeer.metrics.eval_layer',
    'from agentic_autopilot.core.reflection_layer': 'from iopeer.reflection.analyzer',
    'agentic_autopilot.agents': 'iopeer.tool.agents',
    'agentic_autopilot.core.memory': 'iopeer.data.memory',
    'agentic_autopilot.core.eval_layer': 'iopeer.metrics.eval_layer',
    'agentic_autopilot.core.reflection_layer': 'iopeer.reflection.analyzer',
}
for path in root.rglob('*.py'):
    text = path.read_text()
    updated = text
    for old, new in replacements.items():
        updated = updated.replace(old, new)
    if updated != text:
        path.write_text(updated)
PY

log "🛠️ Actualizando Makefile"
if [[ -f scripts/Makefile ]]; then
  sed -i "s#scripts/agentic_autopilot/agents#packages/iopeer/tool/agents#g" scripts/Makefile
  sed -i "s#scripts/agentic_autopilot#packages/iopeer#g" scripts/Makefile
fi

log "🧾 Resumen"
log "   - Estructura creada en $DEST_DIR"
log "   - Imports actualizados"
log "   - Makefile ajustado"
log "✅ Migración completada"

