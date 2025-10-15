#!/usr/bin/env bash
set -e

echo "🩺 === Diagnóstico rápido de iopeer (wrapper bash) ==="
PROJECT_ROOT=$(pwd)
PY_FILE="$PROJECT_ROOT/diagnose_iopeer.py"

if [ ! -f "$PY_FILE" ]; then
  echo "❌ No se encontró diagnose_iopeer.py en $PROJECT_ROOT"
  exit 1
fi

export PYTHONPATH="$PROJECT_ROOT/packages"

echo "🐍 Ejecutando diagnóstico Python..."
python3 "$PY_FILE" || {
  echo "⚠️ Diagnóstico completado con errores. Verifica diagnostic_report.json"
  exit 1
}

echo "✅ Diagnóstico bash finalizado correctamente."
