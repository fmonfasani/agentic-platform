#!/bin/bash
set -e

ROOT_DIR=$(pwd)
LOG_DIR="$ROOT_DIR/logs"
REPORT_DIR="$ROOT_DIR/reports/status"
API_DIR="$ROOT_DIR/apps/api"
mkdir -p "$LOG_DIR" "$REPORT_DIR"

TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
REPORT_FILE="$REPORT_DIR/api_diagnostic_$TIMESTAMP.md"

echo "🚀 Autopilot de desarrollo — API"
pnpm install --frozen-lockfile

echo "🧱 Compilando API..."
pnpm -C apps/api build 2>&1 | tee "$LOG_DIR/api_build.log" || true

echo "📋 Analizando errores..."
if grep -q "error TS" "$LOG_DIR/api_build.log"; then
  echo "❌ Errores detectados en API:"
  grep "error TS" "$LOG_DIR/api_build.log" | head -40
  echo "🤖 Ejecutando reparación automática..."
  python scripts/agentic_autopilot/repair_loop_api_v0.3.2_classified.py || true

  echo "# 🚨 Diagnóstico API (Error)" > "$REPORT_FILE"
  echo "🗓️ $(date)" >> "$REPORT_FILE"
  echo "⚠️ Errores de compilación detectados. Revisar logs en $LOG_DIR/api_build.log" >> "$REPORT_FILE"
else
  echo "✅ Compilación exitosa. Levantando API temporalmente..."
  pnpm -C apps/api start > logs/api_runtime.log 2>&1 &
  API_PID=$!
  sleep 5

  if curl -s localhost:3001/health > /dev/null; then
    echo "✅ API respondió correctamente."
  else
    echo "❌ API no respondió correctamente (000000)"
  fi

  echo "🛑 Apagando API..."
  kill $API_PID 2>/dev/null || echo "⚠️ No se pudo detener el proceso."
fi

echo "📄 Diagnóstico guardado en: $REPORT_FILE"
