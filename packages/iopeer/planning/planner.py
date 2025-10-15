#!/usr/bin/env python3
"""
Agentic Autopilot Master v4
Integración avanzada con OpenAI Assistants API y Supabase.
Crea, actualiza y sincroniza agentes reales según los resultados del pipeline.
"""

import os
import json
import time
import subprocess
import datetime
from pathlib import Path
from openai import OpenAI
from supabase import create_client, Client
from dotenv import load_dotenv
from repair_loop_api import main as repair_api
from repair_loop_web import main as repair_web


# ===============================================================
# CONFIGURACIÓN INICIAL
# ===============================================================
load_dotenv()

ROOT = Path(__file__).resolve().parents[2]
REPORTS = ROOT / "reports"
LOGS = REPORTS / "logs"
DOCS = REPORTS / "docs"
STATUS = REPORTS / "status"
for folder in [REPORTS, LOGS, DOCS, STATUS]:
    folder.mkdir(parents=True, exist_ok=True)

OPENAI_KEY = os.getenv("OPENAI_API_KEY")
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

client = OpenAI(api_key=OPENAI_KEY)
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

LOG_PATH = LOGS / f"autopilot_v4_{datetime.datetime.now().strftime('%Y%m%d_%H%M%S')}.log"

# ===============================================================
# FUNCIONES AUXILIARES
# ===============================================================
def log(msg: str):
    ts = datetime.datetime.now().strftime("[%H:%M:%S]")
    line = f"{ts} {msg}"
    print(line)
    with open(LOG_PATH, "a", encoding="utf-8") as f:
        f.write(line + "\n")

def run(cmd: str, cwd=ROOT):
    log(f"→ Ejecutando: {cmd}")
    result = subprocess.run(cmd, shell=True, cwd=cwd)
    if result.returncode != 0:
        log(f"⚠️ Error ejecutando: {cmd}")
    return result

# ===============================================================
# PIPELINE BASE
# ===============================================================
PIPELINE = [
    ("Verificación del entorno", "python scripts/agentic-autopilot/verify_env.py"),
    ("Diagnóstico del proyecto", "bash scripts/agentic-autopilot/project-status.sh"),
    ("Consolidación de reportes", "python scripts/agentic-autopilot/project_status.py"),
    ("Envío de correos", "python scripts/agentic-autopilot/auto_mail_report.py"),
]

# ===============================================================
# AGENTES BASE
# ===============================================================
AGENTS = [
    {
        "name": "HealthMonitor",
        "instructions": "Analiza el estado del proyecto y detecta fallos críticos en los reportes.",
        "model": "gpt-4o-mini",
    },
    {
        "name": "ErrorAnalyzer",
        "instructions": "Lee los logs y genera reportes de errores con posibles soluciones.",
        "model": "gpt-4o-mini",
    },
    {
        "name": "ReportGenerator",
        "instructions": "Genera resúmenes Markdown y recomendaciones de optimización basadas en los diagnósticos.",
        "model": "gpt-4-turbo",
    },
]

# ===============================================================
# FUNCIONES DE OPENAI ASSISTANTS API
# ===============================================================
def sync_agents():
    """Crea o actualiza agentes en OpenAI y registra en Supabase."""
    log("🤖 Sincronizando agentes con OpenAI...")

    created_agents = []
    for agent in AGENTS:
        try:
            log(f"🧠 Creando/actualizando agente: {agent['name']}")
            assistant = client.beta.assistants.create(
                name=agent["name"],
                model=agent["model"],
                instructions=agent["instructions"],
                metadata={"project": "Agentic Platform", "version": "v4"},
            )

            # Guardar en Supabase
            supabase.table("agents").insert({
                "name": agent["name"],
                "model": agent["model"],
                "created_at": datetime.datetime.now().isoformat(),
                "metadata": agent["instructions"],
                "assistant_id": assistant.id
            }).execute()

            log(f"✅ Agente registrado: {agent['name']} ({assistant.id})")
            created_agents.append(assistant.id)

        except Exception as e:
            log(f"⚠️ Error al crear agente {agent['name']}: {e}")

    log(f"Total de agentes sincronizados: {len(created_agents)}")
    return created_agents

# ===============================================================
# GENERACIÓN DE DOCUMENTACIÓN
# ===============================================================
def generate_docs():
    ts = datetime.datetime.now().strftime("%Y-%m-%d %H:%M")
    md_path = DOCS / "agentic-autopilot-architecture-v4.md"
    content = f"""# 🧠 Agentic Autopilot — Arquitectura General (v4)

📅 Generado: {ts}

```mermaid
flowchart TD
    A[verify_env.py] --> B[project-status.sh]
    B --> C[project_status.py]
    C --> D[auto_mail_report.py]
    D --> E[sync_agents()]
    E --> F[Supabase + OpenAI Assistants]
    F --> G[Reports + Docs + Logs]
```
"""
    

    # Después de ejecutar los diagnósticos base:
    log("🩺 Iniciando reparación API...")
    repair_api()

    log("🎨 Iniciando reparación WEB...")
    repair_web()

    md_path.write_text(content, encoding="utf-8")
    log(f"📘 Documentación actualizada: {md_path}")

# ===============================================================
# FUNCIÓN PRINCIPAL
# ===============================================================
def main():
    start = time.time()
    log("🚀 Iniciando Agentic Autopilot Master v4")
    log("=" * 80)

    # Ejecutar pipeline base
    for label, command in PIPELINE:
        log(f"\n🧩 {label}")
        run(command)

    # Sincronización de agentes reales
    agent_ids = sync_agents()

    # Generar documentación
    generate_docs()

    end = time.time()
    duration = round(end - start, 2)
    log("=" * 80)
    log(f"🏁 Flujo completado en {duration}s")
    log(f"📄 Log completo guardado en: {LOG_PATH}")
    log(f"🤖 Agentes sincronizados: {agent_ids}")