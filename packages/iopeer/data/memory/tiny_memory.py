import os
import json
import sqlite3
from datetime import datetime
from tinydb import TinyDB, Query
from pathlib import Path

# Ruta base del sistema
BASE_DIR = Path(__file__).resolve().parent
DB_TINY_PATH = BASE_DIR / "tiny_memory.json"
DB_SQLITE_PATH = BASE_DIR / "git_diagnostics.db"

class TinyMemory:
    def __init__(self):
        self.db = TinyDB(DB_TINY_PATH)

    # 🧠 --- Función principal de guardado ---
    def save_log(self, data: dict):
        """Guarda un log en TinyDB y sincroniza datos estructurados en SQLite"""
        data["timestamp"] = data.get("timestamp", datetime.utcnow().isoformat())
        self.db.insert(data)
        print(f"💾 Log guardado en TinyMemory ({DB_TINY_PATH.name})")

        # Intentar sincronizar en SQLite si es un log de Git
        if data.get("agent") == "git":
            self._sync_with_sqlite(data)

    def save_metric(self, agent_name: str, metric_name: str, value: float):
        """Guarda una métrica simple del agente y la sincroniza con SQLite"""
        record = {
            "timestamp": datetime.now().isoformat(),
            "agent": agent_name,
            "metric": metric_name,
            "value": value
        }
        # Guardar también en TinyMemory
        self.db.insert(record)
        print(f"📈 Métrica '{metric_name}' registrada para agente '{agent_name}'.")

        # Intentar sincronizar en SQLite
        try:
            conn = sqlite3.connect(DB_SQLITE_PATH)
            cursor = conn.cursor()

            cursor.execute("""
            CREATE TABLE IF NOT EXISTS metrics (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                timestamp TEXT,
                agent TEXT,
                metric TEXT,
                value REAL
            )
            """)

            cursor.execute("""
                INSERT INTO metrics (timestamp, agent, metric, value)
                VALUES (?, ?, ?, ?)
            """, (
                record["timestamp"],
                record["agent"],
                record["metric"],
                record["value"]
            ))

            conn.commit()
            conn.close()
            print(f"📊 Métrica '{metric_name}' guardada en {DB_SQLITE_PATH.name}")
        except Exception as e:
            print(f"⚠️ Error al guardar métrica en SQLite: {e}")


    # 🧩 --- Sincronización automática ---
    def _sync_with_sqlite(self, data: dict):
        """Extrae datos estructurados del log y los guarda en git_diagnostics.db"""
        try:
            conn = sqlite3.connect(DB_SQLITE_PATH)
            cursor = conn.cursor()

            # Crear la tabla si no existe
            cursor.execute("""
            CREATE TABLE IF NOT EXISTS git_diagnostics (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                timestamp TEXT,
                local_branch TEXT,
                remote_branch TEXT,
                ahead INTEGER,
                behind INTEGER,
                staged_count INTEGER,
                unstaged_count INTEGER,
                untracked_count INTEGER,
                is_tracking INTEGER,
                is_synced INTEGER
            )
            """)

            # Extraer datos del log
            output = data.get("output", "")
            local_branch = "main" if "On branch main" in output else "unknown"
            remote_branch = "origin/main" if "origin/main" in output else None
            staged = output.count("Changes to be committed:")
            unstaged = output.count("Changes not staged for commit:")
            untracked = output.count("Untracked files:")
            is_tracking = 1 if "Your branch is up to date" in output else 0
            is_synced = 1 if "up to date" in output else 0

            cursor.execute("""
                INSERT INTO git_diagnostics (
                    timestamp, local_branch, remote_branch,
                    ahead, behind, staged_count, unstaged_count,
                    untracked_count, is_tracking, is_synced
                )
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                data.get("timestamp"),
                local_branch,
                remote_branch,
                0, 0, staged, unstaged, untracked, is_tracking, is_synced
            ))

            conn.commit()
            conn.close()
            print(f"📊 Datos estructurados guardados en {DB_SQLITE_PATH.name}")
        except Exception as e:
            print(f"⚠️ Error al sincronizar con SQLite: {e}")

    # --- Recuperar logs ---
    def get_logs(self, limit=20):
        logs = self.db.all()[-limit:]
        return logs

    # --- Borrar base de TinyDB ---
    def clear(self):
        self.db.truncate()
        print("🧹 TinyMemory limpiada.")

# --- Prueba directa ---
if __name__ == "__main__":
    memory = TinyMemory()
    memory.save_log({
        "agent": "git",
        "action": "git status",
        "output": "On branch main\nYour branch is up to date with 'origin/main'.\nChanges not staged for commit:\nUntracked files:"
    })
