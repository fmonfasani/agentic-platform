
import subprocess
import os

def run_cmd(cmd: str):
    """Ejecuta comandos shell y devuelve salida + estado."""
    result = subprocess.run(cmd, shell=True, capture_output=True, text=True)
    return {
        "output": result.stdout + result.stderr,
        "ok": result.returncode == 0,
        "code": result.returncode
    }

def get_project_root():
    """Devuelve la raíz del proyecto."""
    return os.path.abspath(os.path.join(os.path.dirname(__file__), "../../.."))
