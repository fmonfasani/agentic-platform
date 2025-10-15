#!/bin/bash
set -e

ROOT_DIR=$(pwd)
LOG_DIR="$ROOT_DIR/logs"
API_DIR="$ROOT_DIR/apps/api"
WEB_DIR="$ROOT_DIR/apps/web"

mkdir -p "$LOG_DIR"

echo "🚀 Iniciando Autopilot de desarrollo (API + WEB)..."
echo "📦 Instalando dependencias..."
pnpm install --frozen-lockfile

echo "🧱 Compilando API..."
pnpm -C apps/api build 2>&1 | tee "$LOG_DIR/api_build.log" || true

echo "🌐 Compilando WEB..."
pnpm -C apps/web build 2>&1 | tee "$LOG_DIR/web_build.log" || true

echo "📋 Analizando errores..."
ERRORS_FOUND=false

if grep -q "error TS" "$LOG_DIR/api_build.log"; then
  echo "❌ Errores detectados en API:"
  grep "error TS" "$LOG_DIR/api_build.log" | head -20
  ERRORS_FOUND=true
fi

if grep -q "Failed to compile" "$LOG_DIR/web_build.log"; then
  echo "❌ Errores detectados en WEB:"
  grep "Failed to compile" "$LOG_DIR/web_build.log" | head -20
  ERRORS_FOUND=true
fi

if [ "$ERRORS_FOUND" = true ]; then
  echo "🛑 Corrige los errores antes de continuar. Revisa los logs en $LOG_DIR"
  exit 1
fi

echo "✅ Compilación exitosa. Levantando servidores..."

# Levantar API y Web en paralelo
(cd "$API_DIR" && pnpm start 2>&1 | tee "$LOG_DIR/api_runtime.log") &
API_PID=$!

(cd "$WEB_DIR" && pnpm start 2>&1 | tee "$LOG_DIR/web_runtime.log") &
WEB_PID=$!

echo "🌍 API corriendo en http://localhost:3001"
echo "💻 WEB corriendo en http://localhost:3000"
echo "🧠 Logs guardados en $LOG_DIR"

# Mantener ambos procesos activos
trap "kill $API_PID $WEB_PID" SIGINT
wait
