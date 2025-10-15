#!/bin/bash
set -e

ROOT_DIR=$(pwd)
LOG_DIR="$ROOT_DIR/logs"
REPORT_DIR="$ROOT_DIR/reports/status"
WEB_DIR="$ROOT_DIR/apps/web"
mkdir -p "$LOG_DIR" "$REPORT_DIR"

TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
REPORT_FILE="$REPORT_DIR/web_diagnostic_$TIMESTAMP.md"

echo "🚀 Autopilot de desarrollo — WEB"
pnpm install --frozen-lockfile

echo "🌐 Compilando WEB..."
pnpm -C apps/web build 2>&1 | tee "$LOG_DIR/web_build.log" || true

echo "📋 Analizando errores..."
if grep -q "Failed to compile" "$LOG_DIR/web_build.log"; then
  echo "❌ Errores detectados en WEB:"
  grep "Failed to compile" "$LOG_DIR/web_build.log" | head -20
  echo "🤖 Ejecutando reparación automática..."
  python scripts/agentic-autopilot/repair_loop_web.py || true

  echo "# 🚨 Diagnóstico WEB (Error)" > "$REPORT_FILE"
  echo "🗓️ $(date)" >> "$REPORT_FILE"
  echo "⚠️ Errores de compilación detectados. Revisar logs en $LOG_DIR/web_build.log" >> "$REPORT_FILE"
else
  echo "✅ Compilación exitosa. Levantando Web temporalmente..."
  (cd "$WEB_DIR" && pnpm start 2>&1 | tee "$LOG_DIR/web_runtime.log") &
  WEB_PID=$!

  # Esperar 15 segundos para health check
  sleep 15
  STATUS_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 || echo "000")

  if [ "$STATUS_CODE" = "200" ]; then
    echo "✅ Web saludable (200)"
    echo "# ✅ Diagnóstico WEB (OK)" > "$REPORT_FILE"
    echo "🗓️ $(date)" >> "$REPORT_FILE"
    echo "✔️ Health check OK (200)" >> "$REPORT_FILE"
  else
    echo "❌ Web no respondió correctamente ($STATUS_CODE)"
    echo "# ⚠️ Diagnóstico WEB (Fallido)" > "$REPORT_FILE"
    echo "🗓️ $(date)" >> "$REPORT_FILE"
    echo "❌ Health check fallido ($STATUS_CODE)" >> "$REPORT_FILE"
  fi

  echo "🛑 Apagando Web..."
  kill $WEB_PID || true
fi

echo "📄 Diagnóstico guardado en: $REPORT_FILE"

if grep -q "error TS" "$LOG_DIR/api_build.log"; then
  echo "[ $(date '+%Y-%m-%d %H:%M:%S') ] ❌ Build failed" >> "$LOG_DIR/api_result.log"
  python scripts/agentic-autopilot/repair_agent.py api || true
else
  echo "[ $(date '+%Y-%m-%d %H:%M:%S') ] ✅ Build successful" >> "$LOG_DIR/api_result.log"
fi
