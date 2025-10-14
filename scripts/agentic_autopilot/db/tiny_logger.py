from tinydb import TinyDB
from datetime import datetime
import os

# Ruta donde se almacenará la base local

DB_PATH = os.path.join(os.path.dirname(__file__), "autopilot_memory.json")

db = TinyDB(DB_PATH)

def log_event(agent_name: str, command: str, status: str, output: str, feedback: str = None):
    db = TinyDB(DB_PATH)
    db.insert({
        "timestamp": datetime.now().isoformat(),
        "agent": agent_name,
        "command": command,
        "status": status,
        "output": output.strip(),
        "feedback": feedback.strip() if feedback else None,
    })


def log_autopilot_run(module: str, command: str, status: str, output: str, feedback: str = None):
    """Guarda una ejecución del Autopilot en TinyDB."""
    db.insert({
        "timestamp": datetime.now().isoformat(),
        "module": module,
        "command": command,
        "status": status,
        "output": output.strip(),
        "feedback": feedback.strip() if feedback else None,
    })

def get_recent_logs(limit: int = 5):
    """Devuelve los últimos N registros."""
    return db.all()[-limit:]

def clear_logs():
    """Limpia todos los registros."""
    db.truncate()
