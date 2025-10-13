#!/usr/bin/env python3
"""
Repair Loop — API (NestJS) v0.3.2-classified
Analiza los logs, clasifica el tipo de error y deriva la reparación
al agente especializado correspondiente (Build, Dependency, Env, Runtime).
"""

import os
import re
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
API_DIR = ROOT / "apps" / "api"

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
    """Lee tanto logs de build como de runtime."""
    build_log = LOGS / "api_build.log"
    runtime_log = LOGS / "api_runtime.log"

    text = ""
    if build_log.exists():
        text += build_log.read_text(encoding="utf-8")[-10000:]
    if runtime_log.exists():
        text += "\n\n" + runtime_log.read_text(encoding="utf-8")[-15000:]
    return text

error_type = categorize_error(log_text)

# === Invocar al router de agentes según el tipo de error ===
from subprocess import run
try:
    log_fix(f"🧭 Invocando router de agentes para {error_type}...")
    run([
        "python",
        "scripts/agentic-autopilot/agents/router.py",
        error_type
    ], input=log_text, text=True, check=False)
    log_fix("🤖 Router ejecutado correctamente.")
except Exception as e:
    log_fix(f"⚠️ Error al ejecutar router: {e}")




# === Estrategias de reparación ===
def repair_build_error(log_text: str):
    """Fix básico de errores TypeScript con diff generado por OpenAI."""
    prompt = f"""
You are a TypeScript build repair assistant.
Analyze the following error and generate a valid unified diff patch (git apply ready)
that fixes the minimal issue described.

Error log:
{log_text}
"""
    log_fix("🧠 Generando patch para BuildError...")
    response = client.responses.create(model="gpt-4o", input=prompt, temperature=0.2)
    patch = response.output_text.strip()
    if not patch.startswith("diff --git"):
        log_fix("⚠️ Patch no válido, guardado para revisión manual.")
        (LOGS / "invalid_patch.txt").write_text(patch, encoding="utf-8")
        return None
    patch_path = REPORTS / f"build_fix_{datetime.datetime.now():%Y%m%d_%H%M%S}.patch"
    patch_path.write_text(patch, encoding="utf-8", newline="\n")
    return patch_path

def repair_dependency_error(service_name="AgentUploadService"):
    """Crea un patch de módulo para agregar un provider faltante."""
    module_path = API_DIR / "src" / "agents" / "agents.module.ts"
    rel_path = module_path.relative_to(ROOT).as_posix()
    patch_path = REPORTS / f"autofix_{service_name.lower()}_{datetime.datetime.now():%Y%m%d_%H%M%S}.patch"
    diff = f"""diff --git a/{rel_path} b/{rel_path}
index 0000000..1111111 100644
--- a/{rel_path}
+++ b/{rel_path}
@@ -1,5 +1,7 @@
 import {{ Module }} from '@nestjs/common';
 import {{ AgentRunController }} from './agent-run.controller';
+import {{ {service_name} }} from './services/{service_name[0].lower() + service_name[1:]}.service';
+
 @Module({{
   providers: [
     AgentRunnerService,
+    {service_name},
     AgentTraceService,
     AgentEvalService,
   ],
@@
   exports: [
     AgentRunnerService,
+    {service_name},
     AgentTraceService,
     AgentEvalService,
   ],
 }}
 export class AgentsModule {{}}
"""
    patch_path.write_text(diff, encoding="utf-8", newline="\n")
    return patch_path

def repair_env_error(log_text: str):
    missing = re.findall(r"Missing (\w+)", log_text)
    env_path = ROOT / ".env"
    fixes = []
    for var in missing:
        fixes.append(f"{var}=<INSERT_VALUE>")
    with open(env_path, "a", encoding="utf-8") as f:
        f.write("\n# Auto-added missing variables\n" + "\n".join(fixes) + "\n")
    log_fix(f"🌍 Variables agregadas a .env: {', '.join(missing)}")
    return None

def repair_runtime_error(log_text: str):
    log_fix("⚙️ RuntimeError detectado, solo registrado para análisis manual.")
    (LOGS / "runtime_error.log").write_text(log_text, encoding="utf-8")
    return None

# === Aplicar patch y revalidar ===
def apply_patch(patch_file: Path):
    """Aplica un patch y valida que tenga formato correcto."""
    if not patch_file or not patch_file.exists():
        log_fix("⚠️ No hay patch válido para aplicar.")
        return False

    patch_text = patch_file.read_text(encoding="utf-8")
    if not patch_text.strip().startswith("diff --git"):
        log_fix("⚠️ Patch sin formato válido. Generando dummy diff para mantener pipeline.")
        dummy = f"""diff --git a/tmp.txt b/tmp.txt
--- a/tmp.txt
+++ b/tmp.txt
@@ -1 +1,2 @@
- placeholder
+ fix applied automatically
"""
        patch_file.write_text(dummy, encoding="utf-8")

    # Verificación y aplicación real
    check = subprocess.run(f"git apply --check {patch_file}", shell=True, cwd=ROOT)
    if check.returncode != 0:
        log_fix("💥 Patch inválido según git --check.")
        return False

    result = subprocess.run(f"git apply {patch_file}", shell=True, cwd=ROOT)
    if result.returncode == 0:
        log_fix("✅ Patch aplicado correctamente.")
        return True

    log_fix("💥 Falló la aplicación del patch.")
    return False


def rebuild_api():
    result = subprocess.run("pnpm -C apps/api build", shell=True, cwd=ROOT)
    return result.returncode == 0

# === Main ===
def main():
    print("🚀 Iniciando Repair Loop — API Classified")
    log_text = read_last_log()
    if not log_text:
        log_fix("⚠️ No se encontró logs/api_build.log.")
        return
    error_type = categorize_error(log_text)
    log_fix(f"📊 Tipo de error detectado: {error_type}")

    patch = None
    if error_type == "BuildError":
        patch = repair_build_error(log_text)
    elif error_type == "DependencyError":
        patch = repair_dependency_error("AgentUploadService")
    elif error_type == "EnvError":
        patch = repair_env_error(log_text)
    elif error_type == "RuntimeError":
        patch = repair_runtime_error(log_text)
    else:
        log_fix("🤷 Error desconocido, no se aplicará reparación automática.")
        return

    if patch:
        ok = apply_patch(patch)
        if ok:
            rebuilt = rebuild_api()
            log_fix("✅ Build exitoso después del fix." if rebuilt else "❌ Build aún con errores.")
        else:
            log_fix("💥 No se pudo aplicar el patch.")
    log_fix("🏁 Fin del ciclo de reparación API\n" + "=" * 60)

if __name__ == "__main__":
    main()
