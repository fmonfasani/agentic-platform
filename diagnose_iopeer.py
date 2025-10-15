#!/usr/bin/env python3
"""
Diagnóstico completo del paquete iopeer (sin reparación)
Genera:
 - diagnostic_report.json (detallado)
 - diagnostic_report.md (resumen visual)
"""
import os
import sys
import json
import pkgutil
import importlib
from pathlib import Path
from dotenv import load_dotenv

ROOT = Path(__file__).resolve().parent
PKG_PATH = ROOT / "packages" / "iopeer"
ENV_PATH = ROOT / ".env"
RESULTS_JSON = ROOT / "diagnostic_report.json"
RESULTS_MD = ROOT / "diagnostic_report.md"

print("🩺 === Diagnóstico Python: iopeer ===\n")

# --- 1️⃣ Cargar entorno ---
if ENV_PATH.exists():
    load_dotenv(ENV_PATH)
    print(f"✅ .env cargado desde {ENV_PATH}")
else:
    print(f"⚠️ No se encontró .env en {ENV_PATH}")

# --- 2️⃣ Validar estructura base ---
required_dirs = ["data", "learning", "metrics", "reflection", "tool", "utils"]
missing_dirs = [d for d in required_dirs if not (PKG_PATH / d).exists()]
if missing_dirs:
    print(f"❌ Carpetas faltantes: {', '.join(missing_dirs)}")
else:
    print("✅ Estructura de carpetas OK")

# --- 3️⃣ Validar variables críticas ---
critical_vars = ["OPENAI_API_KEY", "SUPABASE_URL", "DATABASE_URL"]
missing_env = [v for v in critical_vars if not os.getenv(v)]
if missing_env:
    print(f"⚠️ Faltan variables de entorno: {', '.join(missing_env)}")
else:
    print("✅ Variables de entorno críticas OK")

# --- 4️⃣ Validar imports ---
sys.path.insert(0, str(ROOT / "packages"))
print("\n🔍 Verificando imports...\n")

results = {"ok": [], "fail": {}}

for module in pkgutil.walk_packages([str(PKG_PATH)], prefix="iopeer."):
    name = module.name
    try:
        importlib.import_module(name)
        print(f"✅ {name}")
        results["ok"].append(name)
    except Exception as e:
        print(f"❌ {name} — {type(e).__name__}: {e}")
        results["fail"][name] = f"{type(e).__name__}: {e}"

# --- 5️⃣ Exportar JSON ---
report = {
    "summary": {
        "ok": len(results["ok"]),
        "fail": len(results["fail"]),
        "missing_env": missing_env,
        "missing_dirs": missing_dirs,
    },
    "modules": results,
}

RESULTS_JSON.write_text(json.dumps(report, indent=2, ensure_ascii=False), encoding="utf-8")

# --- 6️⃣ Exportar Markdown ---
lines = []
lines.append("# 🩺 Diagnóstico del paquete `iopeer`\n")
lines.append(f"**Total módulos OK:** {len(results['ok'])}")
lines.append(f"**Total con errores:** {len(results['fail'])}\n")

if missing_dirs:
    lines.append("## ⚠️ Carpetas faltantes\n")
    for d in missing_dirs:
        lines.append(f"- `{d}`")
    lines.append("")

if missing_env:
    lines.append("## ⚠️ Variables de entorno faltantes\n")
    for v in missing_env:
        lines.append(f"- `{v}`")
    lines.append("")

if results["fail"]:
    lines.append("## ❌ Módulos con errores\n")
    for name, err in results["fail"].items():
        lines.append(f"- **{name}** — `{err}`")
else:
    lines.append("✅ Todos los módulos se importaron correctamente.")

lines.append("\n---\n")
lines.append("📄 *Reporte JSON completo:* `diagnostic_report.json`")

RESULTS_MD.write_text("\n".join(lines), encoding="utf-8")

print(f"\n📄 Reportes generados:\n - {RESULTS_JSON}\n - {RESULTS_MD}")
print(f"✅ Módulos OK: {len(results['ok'])} | ❌ Con errores: {len(results['fail'])}")

if results["fail"]:
    sys.exit(1)
else:
    print("\n✅ Diagnóstico finalizado sin errores.")
