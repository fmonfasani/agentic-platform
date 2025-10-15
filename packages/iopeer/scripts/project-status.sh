#!/usr/bin/env bash
set -e

ROOT_DIR="$(pwd)"
REPORT_DIR="$ROOT_DIR/reports/status"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
DATE_HUMAN=$(date +"%a, %b %d %Y  %I:%M:%S %p")
REPORT_FILE="$REPORT_DIR/project-status-$TIMESTAMP.md"

mkdir -p "$REPORT_DIR"

echo "# 🧠 Agentic Platform — Project Health Report" > "$REPORT_FILE"
echo "" >> "$REPORT_FILE"
echo "🗓️ **Fecha:** $DATE_HUMAN" >> "$REPORT_FILE"
echo "📂 **Ubicación:** $ROOT_DIR" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"
echo "---" >> "$REPORT_FILE"

# Simplificado para ejecución remota
pnpm exec tsx scripts/agent-diagnostics.ts --json >> "$REPORT_FILE" 2>&1 || echo "⚠️ Error ejecutando diagnóstico" >> "$REPORT_FILE"

echo "---" >> "$REPORT_FILE"
echo "✅ Reporte generado en $REPORT_FILE"
