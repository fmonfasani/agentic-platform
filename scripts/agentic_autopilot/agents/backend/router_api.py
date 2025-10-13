#!/usr/bin/env python3
"""
Agent Router — Despacha errores a los agentes correspondientes
Versión 0.5 — Simplificada para carpeta `agentic_autopilot`
"""

import sys
import importlib.util
import datetime
from pathlib import Path

# === Paths base ===
CURRENT_FILE = Path(__file__).resolve()
ROOT = CURRENT_FILE.parents[3]
AGENTS_DIR = ROOT / "scripts" / "agentic_autopilot" / "agents"


if not AGENTS_DIR.exists():
    raise FileNotFoundError(f"❌ No se encontró la carpeta de agentes en {AGENTS_DIR}")

# Agregar al sys.path para permitir imports absolutos
sys.path.insert(0, str(ROOT / "scripts"))
sys.path.insert(0, str(AGENTS_DIR))

LOGS = ROOT / "logs" / "agents"
LOGS.mkdir(parents=True, exist_ok=True)

# === Logging ===
def log_event(agent: str, message: str):
    ts = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    entry = f"[{ts}] [{agent.upper()}] {message}"
    print(entry)
    with open(LOGS / "router.log", "a", encoding="utf-8") as f:
        f.write(entry + "\n")

# === Registro de agentes disponibles ===
AGENTS = {
    "BuildError": "agents_build",
    "DependencyError": "agents_dependency",
    "EnvError": "agents_env",
    "RuntimeError": "agents_runtime",
    "BuildError": "agents_web_build",
    "DependencyError": "agents_web_dependency",
    "RuntimeError": "agents_web_runtime",
    "EnvError": "agents_env"
}

def load_agent_module(agent_name: str):
    """Carga dinámica del módulo del agente."""
    module_path = AGENTS_DIR / f"{agent_name}.py"
    if not module_path.exists():
        log_event("router", f"❌ No se encontró el archivo del agente: {module_path}")
        return None

    try:
        spec = importlib.util.spec_from_file_location(agent_name, module_path)
        module = importlib.util.module_from_spec(spec)
        sys.modules[agent_name] = module
        spec.loader.exec_module(module)
        return module
    except Exception as e:
        log_event("router", f"💥 Error al cargar módulo {agent_name}: {e}")
        return None

def dispatch_agent(error_type: str, log_text: str):
    """Ejecuta el agente según el tipo de error."""
    if error_type not in AGENTS:
        log_event("router", f"⚠️ Tipo de error desconocido: {error_type}")
        return

    module_name = AGENTS[error_type]
    log_event("router", f"🚀 Buscando agente: {module_name}")
    module = load_agent_module(module_name)

    if not module:
        log_event("router", f"💥 Falló la carga del agente {module_name}")
        return

    if not hasattr(module, "run"):
        log_event("router", f"⚠️ El agente {module_name} no tiene función 'run'.")
        return

    try:
        log_event("router", f"🚀 Ejecutando agente: {module_name}")
        module.run(log_text)
        log_event("router", f"✅ Agente {module_name} completado correctamente.")
    except Exception as e:
        log_event("router", f"💥 Error ejecutando {module_name}: {e}")

def main():
    if len(sys.argv) < 2:
        print("Uso: router.py <ErrorType>")
        sys.exit(1)

    error_type = sys.argv[1].strip()
    log_text = sys.stdin.read().strip()

    log_event("router", f"📦 Iniciando router para tipo: {error_type}")
    dispatch_agent(error_type, log_text)
    log_event("router", f"🏁 Fin del proceso del router ({error_type})")
    print("=" * 80)

if __name__ == "__main__":
    main()
