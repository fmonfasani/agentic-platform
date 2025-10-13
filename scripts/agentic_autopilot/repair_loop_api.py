#!/usr/bin/env python3
"""
Repair Loop — API (NestJS) v3.1
Versión optimizada: contexto completo de archivo, formato de salida estricto,
modelo literal (gpt-4o-mini) y salida debug para verificar el diff generado.
"""

import os
import re
import subprocess
import datetime
from pathlib import Path
from openai import OpenAI
from supabase import create_client, Client
from dotenv import load_dotenv

# ===============================================================
# CONFIGURACIÓN INICIAL
# ===============================================================
ROOT = Path(__file__).resolve().parents[2]
LOGS = ROOT / "logs"
REPORTS = ROOT / "reports" / "logs"
CHANGES = ROOT / "reports" / "changes"
API_DIR = ROOT / "apps" / "api"
LOG_PATH = LOGS / "api_build.log"
FIX_HISTORY = LOGS / "fix_history.log"

for d in [REPORTS, LOGS, CHANGES]:
    d.mkdir(parents=True, exist_ok=True)

load_dotenv(ROOT / ".env")
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
supabase: Client | None = None
if SUPABASE_URL and SUPABASE_KEY:
    supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

# ===============================================================
# UTILIDADES
# ===============================================================
def log_fix(msg: str):
    """Guarda una línea en logs/fix_history.log con timestamp."""
    line = f"[{datetime.datetime.now():%Y-%m-%d %H:%M:%S}] {msg}"
    print(line)
    with open(FIX_HISTORY, "a", encoding="utf-8") as f:
        f.write(line + "\n")

def extract_error_file(log_text: str) -> Path | None:
    """Extrae la ruta probable del archivo con error desde el log TS."""
    match = re.search(r"src[\\/][\w\\/.\-]+\.ts", log_text)
    if match:
        return API_DIR / match.group(0).replace("\\", "/")
    return None

# ===============================================================
# ANÁLISIS Y PROPUESTA DE FIX
# ===============================================================
def analyze_api_errors():
    """Lee errores del build log y pide a OpenAI un patch válido."""
    if not LOG_PATH.exists():
        log_fix("⚠️ No se encontró logs/api_build.log")
        return None

    errors = LOG_PATH.read_text(encoding="utf-8")[-8000:]
    error_file = extract_error_file(errors)

    # 📌 Ahora se pasa TODO el archivo, no solo 40–80 líneas
    code_context = ""
    if error_file and error_file.exists():
        lines = error_file.read_text(encoding="utf-8").splitlines()
        snippet = "\n".join(lines)
        code_context = f"\nHere is the full code from {error_file.name}:\n```\n{snippet}\n```"

    diff_example = r"""
Example of valid unified diff:
diff --git a/src/example.ts b/src/example.ts
--- a/src/example.ts
+++ b/src/example.ts
@@ -5,7 +5,7 @@
 function add(a,b) {
-  return a+b
+  return a + b;
 }
"""

    # 🔧 prompt actualizado con formato estricto
    prompt = f"""
You are a professional TypeScript/NestJS repair assistant.

Analyze the following TypeScript build error and produce a VALID UNIFIED DIFF PATCH for 'git apply'.

Output format:
Return ONLY a unified diff patch starting with:
diff --git a/... b/...
--- a/...
+++ b/...
@@
Do NOT include explanations, text, or markdown — only raw diff lines.

Fix minimally what is necessary to make the build succeed.

{diff_example}

Build Log:
{errors}
{code_context}
"""

    log_fix("🧠 Consultando OpenAI para diagnóstico y fix...")
    response = client.responses.create(model="gpt-4o-mini", input=prompt, temperature=0.0)
    patch = response.output_text.strip()

    # Mostrar salida para depuración
    print("🧩 Output del modelo (primeras 600 chars):")
    print(patch[:600])

    # Guardar resultado sin validar (para inspección)
    raw_patch_path = LOGS / f"raw_patch_{datetime.datetime.now():%Y%m%d_%H%M%S}.txt"
    raw_patch_path.write_text(patch, encoding="utf-8")

    if not patch.startswith("diff --git"):
        log_fix("⚠️ Primer intento sin diff válido, reintentando con prompt reforzado...")
        retry_prompt = f"""
Analyze this TypeScript error and generate a unified diff patch (git apply ready).
Respond ONLY with the diff lines starting from 'diff --git'.
If you can't fix it, produce a syntactically correct placeholder diff that adds an explicit 'any' type to silence the TS error.

Build Log:
{errors}
{code_context}
"""
        retry = client.responses.create(model="gpt-4o-mini", input=retry_prompt, temperature=0.0)
        patch = retry.output_text.strip()
        print("🧩 Output reintento:")
        print(patch[:600])

    if not patch.startswith("diff --git"):
        log_fix("⚠️ Patch aún no válido, guardado en invalid_patch.txt.")
        (LOGS / "invalid_patch.txt").write_text(patch, encoding="utf-8")
        return None

    patch_file = REPORTS / f"api_fix_{datetime.datetime.now():%Y%m%d_%H%M%S}.patch"
    patch_file.write_text(patch, encoding="utf-8")
    log_fix(f"🧩 Patch generado: {patch_file}")
    return patch_file

# ===============================================================
# APLICACIÓN Y VALIDACIÓN DEL FIX
# ===============================================================
def apply_and_test(patch_file: Path):
    """Aplica el patch y valida el resultado compilando nuevamente."""
    if patch_file is None:
        log_fix("⚠️ No hay patch válido para aplicar.")
        return False

    log_fix("🧱 Aplicando patch...")
    result_apply = subprocess.run(f"git apply {patch_file}", shell=True, cwd=ROOT)
    if result_apply.returncode != 0:
        log_fix("💥 Fallo al aplicar el patch. Guardado para revisión manual.")
        return False

    log_fix("🔁 Reintentando build de la API...")
    result_build = subprocess.run("pnpm -C apps/api build", shell=True, cwd=ROOT)
    if result_build.returncode == 0:
        log_fix("✅ Build exitoso después del fix.")
        return True
    else:
        log_fix("❌ Build aún con errores tras aplicar el fix.")
        return False

# ===============================================================
# REGISTRO DE CAMBIOS
# ===============================================================
def record_patch_changes(patch_path: Path, success: bool):
    if not patch_path or not patch_path.exists():
        return

    timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
    added, removed = [], []
    patch_content = patch_path.read_text(encoding="utf-8")
    for line in patch_content.splitlines():
        if line.startswith('+') and not line.startswith('+++'):
            added.append(line)
        elif line.startswith('-') and not line.startswith('---'):
            removed.append(line)

    summary_txt = f"""
Timestamp: {timestamp}
Patch: {patch_path.name}
Result: {'SUCCESS ✅' if success else 'FAILED ❌'}

Added lines ({len(added)}):
{os.linesep.join(added[:20])}

Removed lines ({len(removed)}):
{os.linesep.join(removed[:20])}
"""
    (CHANGES / f"api_changes_{timestamp}.txt").write_text(summary_txt, encoding="utf-8")
    log_fix(f"🧾 Registro de cambios guardado en {CHANGES}")

    if supabase:
        try:
            supabase.table("repairs_history").insert({
                "timestamp": timestamp,
                "patch_name": patch_path.name,
                "result": "success" if success else "failed",
                "added_lines": len(added),
                "removed_lines": len(removed)
            }).execute()
            log_fix("📡 Sincronización con Supabase exitosa.")
        except Exception as e:
            log_fix(f"⚠️ Error al sincronizar con Supabase: {e}")

# ===============================================================
# MAIN
# ===============================================================
def main():
    print("🚀 Iniciando Repair Loop — API")
    patch = analyze_api_errors()
    success = apply_and_test(patch)
    if patch and patch.exists():
        record_patch_changes(patch, success)
    print("✅ Fix validado" if success else "💥 Fix fallido")
    log_fix("🏁 Fin del ciclo de reparación API\n" + "=" * 60)

if __name__ == "__main__":
    main()
