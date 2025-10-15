import os
import importlib

PACKAGE = "iopeer"
BASE_DIR = os.path.join("packages", PACKAGE)

def verify_imports():
    print(f"🔍 Verificando imports de '{PACKAGE}'...\n")
    errors = []

    for root, _, files in os.walk(BASE_DIR):
        for file in files:
            if file.endswith(".py") and file != "__init__.py":
                rel_path = os.path.relpath(os.path.join(root, file), "packages")
                module = rel_path.replace(os.sep, ".")[:-3]
                try:
                    importlib.import_module(module)
                    print(f"✅ {module}")
                except Exception as e:
                    print(f"❌ {module} — {type(e).__name__}: {e}")
                    errors.append((module, str(e)))

    print("\nResumen final:")
    if not errors:
        print("✅ Todos los imports funcionan correctamente.")
    else:
        print(f"❌ {len(errors)} errores encontrados.")
        for mod, err in errors:
            print(f"   - {mod}: {err}")

if __name__ == "__main__":
    verify_imports()
