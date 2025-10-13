#!/usr/bin/env python3
"""
Repair Loop — API (NestJS) v3.2
Extiende la versión 3.1 con detección y reparación automática
de dependencias faltantes en módulos NestJS.
"""

import os
import re
import subprocess
import datetime
from pathlib import Path
from openai import OpenAI
from dotenv import load_dotenv

ROOT = Path(__file__).resolve().parents[2]
LOGS = ROOT / "logs"
REPORTS = ROOT / "reports" / "logs"
API_DIR = ROOT / "apps" / "api"
LOG_PATH = LOGS / "api_runtime.log"   # 🔄 se analiza el log de ejecución (no el build)
FIX_HISTORY = LOGS / "fix_history.log"

for d in [REPORTS, LOGS]:
    d.mkdir(parents=True, exist_ok=True)

load_dotenv(ROOT / ".env")
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

def log_fix(msg: str):
    line = f"[{datetime.datetime.now():%Y-%m-%d %H:%M:%S}] {msg}"
    print(line)
    with open(FIX_HISTORY, "a", encoding="utf-8") as f:
        f.write(line + "\n")

# ===============================================================
# 🔍 1️⃣ Detectar errores de dependencias NestJS
# ===============================================================
def detect_missing_dependency(log_text: str):
    """
    Busca un error tipo:
    "Nest can't resolve dependencies of the AgentRunController (... ? ...)."
    y devuelve el nombre del servicio faltante (ej: AgentUploadService)
    """
    match = re.search(r"argument (\w+) at index \[\d+\]", log_text)
    if match:
        service_name = match.group(1)
        log_fix(f"🧩 Dependencia faltante detectada: {service_name}")
        return service_name
    return None

# ===============================================================
# 🧱 2️⃣ Generar un patch .diff para el módulo afectado
# ===============================================================
def generate_nest_module_patch(service_name: str, module_path: Path):
    """Crea un parche de tipo diff que agrega el servicio en providers y exports."""
    timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
    patch_file = REPORTS / f"autofix_{service_name.lower()}_{timestamp}.patch"

    # ✅ Convertir ruta a formato POSIX (compatible con Git)
    rel_path = module_path.relative_to(ROOT).as_posix()

    # ✅ Formato completo y sintácticamente válido para Git
    diff_content = f"""diff --git a/{rel_path} b/{rel_path}
index 0000000..1111111 100644
--- a/{rel_path}
+++ b/{rel_path}
@@ -0,0 +1,16 @@
+// 🧩 AutoFix — Added missing dependency provider
+import {{ {service_name} }} from './services/{service_name[0].lower() + service_name[1:]}.service';
+
+// Auto-generated provider block
+@Module({{
+  providers: [
+    {service_name},
+  ],
+  exports: [
+    {service_name},
+  ],
+}})
+export class AutoPatchedAgentsModule {{}}
"""

    # ✅ Escribir el patch con saltos de línea UNIX (LF)
    with open(patch_file, "w", encoding="utf-8", newline="\n") as f:
        f.write(diff_content)

    log_fix(f"🧾 Patch de dependencia generado: {patch_file}")
    return patch_file



# ===============================================================
# 🔁 3️⃣ Aplicar el patch y validar
# ===============================================================
def apply_patch(patch_path: Path):
    """Aplica el parche generado automáticamente."""
    result = subprocess.run(f"git apply {patch_path}", shell=True, cwd=ROOT)
    if result.returncode == 0:
        log_fix("✅ Patch aplicado correctamente.")
        return True
    else:
        log_fix("💥 Falló la aplicación del patch.")
        return False

# ===============================================================
# 🚀 MAIN
# ===============================================================
def main():
    print("🚀 Iniciando Repair Loop — NestJS Dependencies")
    if not LOG_PATH.exists():
        log_fix("⚠️ No existe logs/api_runtime.log — ejecutá el autopilot primero.")
        return

    log_content = LOG_PATH.read_text(encoding="utf-8")
    missing_service = detect_missing_dependency(log_content)
    if not missing_service:
        log_fix("✅ No se detectaron dependencias faltantes.")
        return

    agents_module_path = API_DIR / "src" / "agents" / "agents.module.ts"
    if not agents_module_path.exists():
        log_fix("⚠️ No se encontró agents.module.ts")
        return

    patch = generate_nest_module_patch(missing_service, agents_module_path)
    success = apply_patch(patch)

    if success:
        log_fix("🔁 Reintentando build API tras fix de dependencia...")
        subprocess.run("pnpm -C apps/api build", shell=True, cwd=ROOT)
    else:
        log_fix("❌ No se pudo aplicar el parche de dependencia automáticamente.")

    log_fix("🏁 Fin del ciclo de reparación de dependencias\n" + "=" * 60)

if __name__ == "__main__":
    main()
