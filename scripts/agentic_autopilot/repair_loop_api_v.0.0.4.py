#!/usr/bin/env python3
"""
Repair Loop — API (NestJS) v0.0.4
Clasifica errores con OpenAI, los deriva al router de agentes
y registra el proceso completo.
"""

import os
import subprocess
import datetime
from pathlib import Path
from dotenv import load_dotenv
from openai import OpenAI

# === Paths base ===
ROOT = Path(__file__).resolve().parents[2]
LOGS = ROOT / "logs"
REPORTS = ROOT / "reports" / "logs"
STATUS = ROOT / "reports" / "status"
ROUTER = ROOT / "scripts" / "agentic_autopilot" / "agents" / "router.py"

for d in [LOGS, REPORTS, STATUS]:
    d.mkdir(parents=True, exist_ok=True)

load_dotenv(ROOT / ".env")
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

# === Utilidades ===
def log_fix(msg: str):
    ts = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    print(f"[{ts}] {msg}")
    with open(LOGS / "fix_history.log", "a", encoding="utf-8") as f:
        f.write(f"[{ts}] {msg}\n")

def read_last_log() -> str:
    """Lee los logs recientes de build y runtime."""
    build_log = LOGS / "api_build.log"
    runtime_log = LOGS / "api_runtime.log"
    text = ""
    if build_log.exists():
        text += build_log.read_text(encoding="utf-8")[-15000:]
    if runtime_log.exists():
        text += "\n\n" + runtime_log.read_text(encoding="utf-8")[-15000:]
    return text.strip()

# === Clasificación de errores con OpenAI ===
def classify_error_with_openai(log_text: str) -> str:
    """
    Usa OpenAI para determinar el tipo de error y retornarlo.
    Los únicos tipos válidos son:
    BuildError, DependencyError, EnvError, RuntimeError.
    """
    log_fix("🧠 Enviando logs a OpenAI para clasificación...")
    prompt = f"""
Analiza el siguiente log de una API NestJS/TypeScript y determina su tipo.
Responde **solo** con una de las siguientes categorías exactas:
- BuildError (errores de TypeScript, Prisma o compilación)
- DependencyError (errores de módulos o inyección de dependencias)
- EnvError (errores de variables de entorno faltantes)
- RuntimeError (errores de ejecución o excepciones en tiempo de ejecución)

Log:
{log_text}
"""
    try:
        response = client.responses.create(
            model="gpt-4o-mini",
            input=prompt,
            temperature=0
        )
        output = response.output_text.strip()
        for label in ["BuildError", "DependencyError", "EnvError", "RuntimeError"]:
            if label.lower() in output.lower():
                return label
        return "UnknownError"
    except Exception as e:
        log_fix(f"💥 Error clasificando con OpenAI: {e}")
        return "UnknownError"

# === Main ===
def main():
    print("🚀 Iniciando Repair Loop — API con agentes (v0.4)")
    log_text = read_last_log()
    if not log_text:
        log_fix("⚠️ No se encontró logs de compilación ni runtime.")
        return

    # 1️⃣ Clasificar error con OpenAI
    error_type = classify_error_with_openai(log_text)
    log_fix(f"📊 Tipo de error detectado (OpenAI): {error_type}")

    # 2️⃣ Si es desconocido, no seguimos
    if error_type == "UnknownError":
        log_fix("🤷 No se pudo clasificar el error. Revisión manual requerida.")
        return

    # 3️⃣ Llamar al router de agentes
    try:
        log_fix(f"🧭 Invocando router de agentes para {error_type}...")
        subprocess.run(
            [
                "python",
                str(ROUTER),
                error_type
            ],
            input=log_text,
            text=True,
            encoding="utf-8",   # 🔥 fuerza UTF-8
            errors="ignore",    # ignora caracteres no representables
            check=False
        )

        log_fix(f"🤖 Router ejecutado correctamente para {error_type}.")
    except Exception as e:
        log_fix(f"💥 Error al ejecutar router: {e}")

    log_fix("🏁 Fin del ciclo de reparación API con agentes.\n" + "=" * 60)

if __name__ == "__main__":
    main()
