#!/usr/bin/env python3
"""
apply_patch.py — Aplica un diff quirúrgico a un archivo específico
sin depender de git apply.
"""

from pathlib import Path
import re

# === CONFIG ===
PATCH_PATH = Path("reports/logs/dependency_fix_20251013_020439.patch")
PROJECT_ROOT = Path(__file__).resolve().parents[3]
TARGET_FILE = PROJECT_ROOT / "apps" / "api" / "src" / "agents" / "agents.module.ts"

# === Lógica ===
def apply_patch(patch_path: Path, target_file: Path):
    patch_text = patch_path.read_text(encoding="utf-8")
    new_lines = []

    # Extraer solo líneas con contenido
    for line in patch_text.splitlines():
        if line.startswith("+++ ") or line.startswith("--- "):
            continue
        elif line.startswith("+"):
            new_lines.append(line[1:])
        elif not line.startswith("-") and not line.startswith("diff"):
            new_lines.append(line)

    # Cargar el archivo original
    original_lines = target_file.read_text(encoding="utf-8").splitlines()

    # Aplicar reemplazo simple por patrón contextual
    result = []
    inserted_import = False
    inserted_provider = False

    for line in original_lines:
        # Insertar import justo después de los imports
        if not inserted_import and re.match(r"import .*AgentRunnerService.*;", line):
            result.append(line)
            result.append("import { AgentUploadService } from './agent-upload.service';")
            inserted_import = True
            continue

        # Insertar provider dentro del bloque providers:
        if not inserted_provider and re.match(r"\s*AgentRunnerService,", line):
            result.append(line)
            result.append("    AgentUploadService,")
            inserted_provider = True
            continue

        result.append(line)

    # Guardar el archivo modificado
    target_file.write_text("\n".join(result) + "\n", encoding="utf-8")
    print(f"✅ Patch aplicado correctamente en {target_file}")

if __name__ == "__main__":
    apply_patch(PATCH_PATH, TARGET_FILE)
