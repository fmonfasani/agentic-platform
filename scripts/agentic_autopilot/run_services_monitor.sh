#!/usr/bin/env bash
set -e

echo "🚀 Iniciando monitor de servicios Agentic Platform..."
ROOT=$(dirname "$(dirname "$(realpath "$0")")")
cd "$ROOT"

LOG_DIR="$ROOT/reports/logs"
STATUS_DIR="$ROOT/reports/status"
mkdir -p "$LOG_DIR" "$STATUS_DIR"

API_LOG="$LOG_DIR/api_$(date +%Y%m%d_%H%M).log"
WEB_LOG="$LOG_DIR/web_$(date +%Y%m%d_%H%M).log"

# 1️⃣ Levantar API y WEB en background
echo "🧩 Levantando API..."
pnpm -C apps/api start > "$API_LOG" 2>&1 &
API_PID=$!

echo "🧩 Levantando Web..."
pnpm -C apps/web dev > "$WEB_LOG" 2>&1 &
WEB_PID=$!

# 2️⃣ Esperar a que inicialicen
sleep 15

# 3️⃣ Health checks
echo "🔍 Ejecutando health checks..."
API_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3001/health || echo "000")
WEB_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 || echo "000")

if [ "$API_STATUS" == "200" ]; then
  echo "✅ API online (200)"
else
  echo "❌ API offline ($API_STATUS)"
  echo "🧾 Últimas líneas del log API:"
  tail -n 10 "$API_LOG"
fi

if [ "$WEB_STATUS" == "200" ]; then
  echo "✅ Web online (200)"
else
  echo "❌ Web offline ($WEB_STATUS)"
  echo "🧾 Últimas líneas del log Web:"
  tail -n 10 "$WEB_LOG"
fi

# 4️⃣ Generar reporte de estado
STATUS_FILE="$STATUS_DIR/service-check-$(date +%Y%m%d_%H%M%S).md"
echo "# 🧠 Agentic Service Check — $(date)" > "$STATUS_FILE"
echo "" >> "$STATUS_FILE"
echo "## 🔍 Resultados de health check" >> "$STATUS_FILE"
echo "- API: $API_STATUS" >> "$STATUS_FILE"
echo "- Web: $WEB_STATUS" >> "$STATUS_FILE"
echo "" >> "$STATUS_FILE"

# 5️⃣ Ejecutar Autopilot si hay fallos
if [ "$API_STATUS" != "200" ] || [ "$WEB_STATUS" != "200" ]; then
  echo "🚨 Servicios con errores. Ejecutando Autopilot Master v4..."
  python scripts/agentic-autopilot/autopilot_master_v4.py
else
  echo "✅ Todos los servicios están saludables."
fi

# 6️⃣ Cierre ordenado
echo "🛑 Finalizando servicios..."
kill $API_PID $WEB_PID || true
echo "✅ Monitor completado."
