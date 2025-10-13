#!/usr/bin/env python3
"""
Repair Loop — WEB v0.4
Analiza errores de compilación o runtime en Next.js y los envía a agentes especializados.
"""

import os
import subprocess
import datetime
from pathlib import Path
from openai import OpenAI
from agents.router import dispatch_agent
from modules.logger import log_event

# === Configuración base ===
ROOT = Path(__file__).resolve().parents[2]
REPORTS = ROOT / "reports" / "logs"
REPORTS.mkdir(parents=True, exist_ok=True)

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

def get_web_errors():
    """Ejecuta el build de Next.js y devuelve la salida de error."""
    log_event("WEB", "🧱 Ejecutando build de Next.js...")
    process = subprocess.run(
        ["pnpm", "build", "--filter", "web"],
        cwd=ROOT,
        capture_output=True,
        text=True
    )
    if process.returncode == 0:
        log_event("WEB", "✅ Compilación exitosa.")
        return None
    return process.stderr or process.stdout

def classify_error(log_text):
    """Usa OpenAI para clasificar el tipo de error de la web."""
    log_event("WEB", "🧠 Clasificando error con OpenAI...")
    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "Sos un experto en errores de Next.js y React."},
                {"role": "user", "content": f"Clasificá este error en uno de los siguientes tipos: BuildError, DependencyError, RuntimeError, EnvError.\n\n{log_text}"}
            ],
            temperature=0.2,
        )
        error_type = response.choices[0].message.content.strip()
        log_event("WEB", f"📊 Tipo de error detectado: {error_type}")
        return error_type
    except Exception as e:
        log_event("WEB", f"💥 Error clasificando error: {e}")
        return "UnknownError"

def repair_web():
    """Ciclo completo de reparación para la Web."""
    log_event("WEB", "🚀 Iniciando Repair Loop — WEB")
    logs = get_web_errors()
    if not logs:
        log_event("WEB", "✅ No hay errores detectados.")
        return

    # Guardar log crudo
    log_path = REPORTS / f"web_log_{datetime.datetime.now():%Y%m%d_%H%M%S}.txt"
    with open(log_path, "w", encoding="utf-8") as f:
        f.write(logs)

    # Clasificar error
    error_type = classify_error(logs)

    # Despachar agente
    log_event("WEB", f"🧭 Enviando al router para tipo {error_type}")
    dispatch_agent(error_type, logs)

    log_event("WEB", "🏁 Fin del ciclo de reparación WEB")
    print("=" * 60)

if __name__ == "__main__":
    repair_web()
