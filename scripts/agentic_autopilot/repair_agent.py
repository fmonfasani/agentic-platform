#!/usr/bin/env python3
"""
Repair Agent — analiza los logs de build (API o WEB),
consulta a OpenAI para proponer un fix, y lo aplica automáticamente.
"""
import os, datetime, subprocess
from openai import OpenAI
from pathlib import Path
from dotenv import load_dotenv

ROOT = Path(__file__).resolve().parents[2]
LOGS = ROOT / "logs"
FIX_HISTORY = LOGS / "fix_history.log"

load_dotenv(ROOT / ".env")
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

def log_fix(msg):
    line = f"[{datetime.datetime.now():%Y-%m-%d %H:%M:%S}] {msg}"
    print(line)
    with open(FIX_HISTORY, "a", encoding="utf-8") as f:
        f.write(line + "\n")

def analyze_and_fix(target="api"):
    build_log = LOGS / f"{target}_build.log"
    result_log = LOGS / f"{target}_result.log"
    if not build_log.exists() or not result_log.exists():
        print(f"⚠️ No hay logs previos para {target}.")
        return

    with open(result_log, "r", encoding="utf-8") as f:
        last_result = f.readlines()[-1].strip()
    if "✅" in last_result:
        print(f"✅ Último resultado {target.upper()} fue exitoso. No hay errores que reparar.")
        return

    with open(build_log, "r", encoding="utf-8") as f:
        build_output = f.read()[-8000:]

    prompt = f"""
    You are a TypeScript repair agent.
    Analyze the following TypeScript build log and produce a VALID GIT PATCH.
    The output must be a unified diff starting with lines like:

    diff --git a/path/to/file b/path/to/file
    --- a/path/to/file
    +++ b/path/to/file
    @@ -1,5 +1,7 @@

    Only include the minimal change necessary to fix the error.
    Do not add explanations or commentary.
    Build Log:
    {build_output}
    """

    print("🧠 Consultando OpenAI para diagnóstico y fix...")
    response = client.responses.create(model="gpt-4o-mini", input=prompt, temperature=0.2)
    patch = response.output_text

    patch_path = LOGS / f"{target}_fix_{datetime.datetime.now():%Y%m%d_%H%M%S}.patch"
    patch_path.write_text(patch, encoding="utf-8")
    log_fix(f"🧩 Patch propuesto para {target}: {patch_path.name}")

    if not patch.strip().startswith("diff --git"):
        log_fix("⚠️ Patch no válido, guardado para revisión manual.")
        (LOGS / "invalid_patch.txt").write_text(patch, encoding="utf-8")
        return
    

    # Aplicar y reintentar build
    subprocess.run(f"git apply {patch_path}", shell=True, cwd=ROOT)
    log_fix(f"✅ Patch aplicado. Reintentando build {target}...")
    subprocess.run(f"pnpm -C apps/{target} build", shell=True, cwd=ROOT)

    log_fix(f"🏁 Fin de reparación para {target}")

if __name__ == "__main__":
    analyze_and_fix("api")   # o "web"
