#!/usr/bin/env python3
"""
Analiza los reportes project-status-YYYYMMDD_HHMMSS.md
y genera un historial con evolución, comparaciones y sugerencias.
"""

import os
import re
import datetime
from statistics import mean

REPORTS_DIR = "reports/status"
OUTPUT_FILE = os.path.join(REPORTS_DIR, "health-history.md")

# --- Funciones auxiliares ---
def parse_report(file_path):
    """Extrae la información principal de un reporte."""
    with open(file_path, "r", encoding="utf-8") as f:
        content = f.read()

    # Detectar formato de nombre con segundos: project-status-YYYYMMDD_HHMMSS.md
    date_match = re.search(r"project-status-(\d{8}_\d{6})", file_path)
    score_match = re.search(r"Estado general del proyecto:\*\* [^\s]+ +(\d+)/100", content)
    api_match = re.search(r"\| API health \| (\w+) \|", content)
    api_tests_match = re.search(r"\| API tests \| (\w+) \|", content)
    web_match = re.search(r"\| WEB tests \| (\w+) \|", content)

    if not date_match or not score_match:
        return None

    timestamp = datetime.datetime.strptime(date_match.group(1), "%Y%m%d_%H%M%S")
    return {
        "file": os.path.basename(file_path),
        "date": timestamp,
        "score": int(score_match.group(1)),
        "api": api_match.group(1) if api_match else "unknown",
        "api_tests": api_tests_match.group(1) if api_tests_match else "unknown",
        "web": web_match.group(1) if web_match else "unknown",
    }

def load_reports():
    """Carga todos los reportes disponibles."""
    reports = []
    for fname in sorted(os.listdir(REPORTS_DIR)):
        if fname.startswith("project-status-") and fname.endswith(".md"):
            data = parse_report(os.path.join(REPORTS_DIR, fname))
            if data:
                reports.append(data)
    return sorted(reports, key=lambda r: r["date"])

def trend_symbol(current, previous):
    if current > previous:
        return "⬆️"
    elif current < previous:
        return "⬇️"
    return "➡️"

def generate_chart(scores):
    """Gráfico ASCII simple para evolución."""
    chart = "\n```\n"
    for i, s in enumerate(scores):
        bar = "█" * (s // 2)
        chart += f"{i+1:02d} | {bar:<50} {s}/100\n"
    chart += "```\n"
    return chart

def recommendations(latest):
    """Genera recomendaciones según los estados."""
    recs = []
    if latest["api"] == "offline":
        recs.append(("Alta", "Levantar API (`pnpm -C apps/api start`)", "Recuperar health check"))
    if latest["api_tests"] == "failed":
        recs.append(("Media", "Revisar tests de API (`pnpm -C apps/api test`)", "Mejorar estabilidad"))
    if latest["web"] == "failed":
        recs.append(("Media", "Revisar tests de Web (`pnpm -C apps/web test`)", "Corregir UI o componentes"))
    if latest["score"] == 0:
        recs.append(("Alta", "Verificar configuración base y puertos activos (3000/3001)", "Restaurar entorno local"))
    if not recs:
        recs.append(("Baja", "Mantener el estado actual", "Todo en orden ✅"))
    return recs

# --- Generación de reporte ---
def write_history(reports):
    if not reports:
        print("⚠️ No se encontraron reportes en reports/status/")
        return

    os.makedirs(REPORTS_DIR, exist_ok=True)
    latest = reports[-1]
    previous = reports[-2] if len(reports) > 1 else None
    scores = [r["score"] for r in reports]

    with open(OUTPUT_FILE, "w", encoding="utf-8") as out:
        out.write("# 📈 Agentic Platform — Health Evolution Report\n\n")
        out.write(f"📅 Última actualización: {datetime.datetime.now():%Y-%m-%d %H:%M:%S}\n\n")

        # Tabla de historial
        out.write("| Fecha | Puntuación | API | API Tests | Web |\n")
        out.write("|--------|-------------|------|------------|------|\n")
        for r in reports:
            date_str = r["date"].strftime("%Y-%m-%d %H:%M:%S")
            out.write(f"| {date_str} | {r['score']} | {r['api']} | {r['api_tests']} | {r['web']} |\n")

        out.write("\n---\n")

        # Evolución reciente
        if previous:
            out.write("## 📈 Evolución reciente\n\n")
            out.write("| Métrica | Anterior | Actual | Tendencia |\n")
            out.write("|----------|-----------|---------|-----------|\n")
            out.write(f"| Puntuación | {previous['score']} | **{latest['score']}** | {trend_symbol(latest['score'], previous['score'])} |\n")
            out.write(f"| API health | {previous['api']} | **{latest['api']}** | {trend_symbol(latest['api'] != 'offline', previous['api'] != 'offline')} |\n")
            out.write(f"| API tests | {previous['api_tests']} | **{latest['api_tests']}** | {trend_symbol(latest['api_tests'] == 'passed', previous['api_tests'] == 'passed')} |\n")
            out.write(f"| WEB tests | {previous['web']} | **{latest['web']}** | {trend_symbol(latest['web'] == 'passed', previous['web'] == 'passed')} |\n")
        else:
            out.write("_No hay reportes anteriores para comparar._\n")

        # Promedio y tendencia general
        avg_score = mean(scores)
        trend = "⬆️ Mejorando" if scores[-1] > scores[0] else "⬇️ Empeorando" if scores[-1] < scores[0] else "➡️ Estable"
        out.write(f"\n**Promedio histórico:** {avg_score:.1f}/100 — {trend}\n\n")
        out.write(generate_chart(scores))

        # Recomendaciones
        out.write("## 🧠 Recomendaciones automáticas\n\n")
        out.write("| Prioridad | Acción | Impacto esperado |\n")
        out.write("|------------|---------|------------------|\n")
        for prio, act, imp in recommendations(latest):
            out.write(f"| {prio} | {act} | {imp} |\n")

    print(f"✅ Informe actualizado en: {OUTPUT_FILE}")

def main():
    reports = load_reports()
    write_history(reports)

if __name__ == "__main__":
    main()
