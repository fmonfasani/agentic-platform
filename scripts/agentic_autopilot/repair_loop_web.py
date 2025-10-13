#!/usr/bin/env python3
"""
Repair Loop — Web (Next.js)
Analiza los logs de build de la Web, propone fixes y valida resultados.
Incluye validación de patch, contexto de código y logging estructurado.
"""

import os
import subprocess
import datetime
from pathlib import Path
from openai import OpenAI
from dotenv import load_dotenv
from router_web import dispatch_agent


# ===============================================================
# CONFIGURACIÓN INICIAL
# ===============================================================
ROOT = Path(__file__).resolve().parents[2]
LOGS = ROOT / "logs"
REPORTS = ROOT / "reports" / "logs"
WEB_DIR = ROOT / "apps" / "web"
LOG_PATH = LOGS / "web_build.log"
FIX_HISTORY = LOGS / "fix_history.log"
# Ajustá el archivo base más probable del error (componente principal)
CODE_PATH = WEB_DIR / "src" / "app" / "page.tsx"

REPORTS.mkdir(parents=True, exist_ok=True)
LOGS.mkdir(parents=True, exist_ok=True)

load_dotenv(ROOT / ".env")
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

# ===============================================================
# UTILIDADES
# ===============================================================
def log_fix(msg: str):
    """Guarda una línea en logs/fix_history.log con timestamp."""
    line = f"[{datetime.datetime.now():%Y-%m-%d %H:%M:%S}] {msg}"
    print(line)
    with open(FIX_HISTORY, "a", encoding="utf-8") as f:
        f.write(line + "\n")

# ===============================================================
# ANÁLISIS Y PROPUESTA DE FIX
# ===============================================================
def analyze_web_errors():
    """Lee errores del build log y pide a OpenAI un patch válido."""
    if not LOG_PATH.exists():
        log_fix("⚠️ No se encontró logs/web_build.log")
        return None

    errors = LOG_PATH.read_text(encoding="utf-8")[-6000:]

    # Incluir contexto del archivo base (si existe)
    code_context = ""
    if CODE_PATH.exists():
        lines = CODE_PATH.read_text(encoding="utf-8").splitlines()
        snippet = "\n".join(lines[max(0, 20):50])
        code_context = f"\nHere is the code context from page.tsx:\n```\n{snippet}\n```"

    prompt = f"""
You are a React/Next.js repair assistant.

Analyze the following build error and output a valid UNIFIED DIFF PATCH (for 'git apply').
The patch must start with:
  diff --git a/<path> b/<path>
  --- a/<path>
  +++ b/<path>
  @@ line numbers @@

Rules:
- Only fix the minimal issue necessary to make the build succeed.
- Do not output explanations or commentary, only the diff.
- Use the filename and line numbers from the log to locate the error.
- If unsure, still propose a syntactically valid diff block.

Build Log:
{errors}
{code_context}
"""

    log_fix("🧠 Consultando OpenAI para diagnóstico y fix (WEB)...")
    response = client.responses.create(model="gpt-4o", input=prompt, temperature=0.2)
    patch = response.output_text.strip()

    # Validar formato del patch
    if not patch.startswith("diff --git"):
        log_fix("⚠️ Patch no válido, guardado para revisión manual.")
        (LOGS / "invalid_web_patch.txt").write_text(patch, encoding="utf-8")
        return None

    patch_file = REPORTS / f"web_fix_{datetime.datetime.now():%Y%m%d_%H%M%S}.patch"
    patch_file.write_text(patch, encoding="utf-8")
    log_fix(f"🧩 Patch generado: {patch_file}")
    return patch_file

# ===============================================================
# APLICACIÓN Y VALIDACIÓN DEL FIX
# ===============================================================
def apply_and_test(patch_file: Path):
    """Aplica el patch y valida el resultado compilando nuevamente."""
    if patch_file is None:
        log_fix("⚠️ No hay patch válido para aplicar (WEB).")
        return False

    log_fix("🧱 Aplicando patch (WEB)...")
    result_apply = subprocess.run(f"git apply {patch_file}", shell=True, cwd=ROOT)
    if result_apply.returncode != 0:
        log_fix("💥 Fallo al aplicar el patch (WEB). Guardado para revisión manual.")
        return False

    log_fix("🔁 Reintentando build de la Web...")
    result_build = subprocess.run("pnpm -C apps/web build", shell=True, cwd=ROOT)
    if result_build.returncode == 0:
        log_fix("✅ Build exitoso después del fix (WEB).")
        return True
    else:
        log_fix("❌ Build aún con errores tras aplicar el fix (WEB).")
        return False

# ===============================================================
# MAIN
# ===============================================================
def main():
    print("🚀 Iniciando Repair Loop — WEB")
    patch = analyze_web_errors()
    success = apply_and_test(patch)
    print("✅ Fix validado" if success else "💥 Fix fallido")
    log_fix("🏁 Fin del ciclo de reparación WEB\n" + "=" * 60)

if __name__ == "__main__":
    main()
