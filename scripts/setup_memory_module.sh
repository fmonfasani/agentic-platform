#!/usr/bin/env bash
set -e

# Base path
BASE_DIR="agentic_autopilot/core/memory"

echo "🧠 Creando módulo de memoria en: $BASE_DIR"

# Crear carpetas
mkdir -p "$BASE_DIR"

# ==============================
# 📘 base_memory.py
# ==============================
cat > "$BASE_DIR/base_memory.py" << 'EOF'
# agentic_autopilot/core/memory/base_memory.py
from abc import ABC, abstractmethod

class BaseMemory(ABC):
    """Interfaz agnóstica para cualquier backend de memoria persistente."""

    @abstractmethod
    def save_log(self, agent: str, action: str, status: str, output: str):
        pass

    @abstractmethod
    def save_metric(self, agent: str, metric_name: str, value):
        pass

    @abstractmethod
    def save_reflection(self, agent: str, insight: str):
        pass

    @abstractmethod
    def get_recent_logs(self, agent: str, limit: int = 5):
        pass
EOF

# ==============================
# 💾 tiny_memory.py
# ==============================
cat > "$BASE_DIR/tiny_memory.py" << 'EOF'
# agentic_autopilot/core/memory/tiny_memory.py
from tinydb import TinyDB
from datetime import datetime
import os
from agentic_autopilot.core.memory.base_memory import BaseMemory

class TinyMemory(BaseMemory):
    """Implementación local con TinyDB."""

    def __init__(self, agent_name: str):
        db_path = f"agentic_autopilot/agents/{agent_name}_agent/memory/{agent_name}_memory.json"
        os.makedirs(os.path.dirname(db_path), exist_ok=True)
        self.db = TinyDB(db_path)
        self.logs = self.db.table("logs")
        self.metrics = self.db.table("metrics")
        self.reflections = self.db.table("reflections")

    def save_log(self, agent, action, status, output):
        self.logs.insert({
            "timestamp": datetime.utcnow().isoformat(),
            "agent": agent,
            "action": action,
            "status": status,
            "output": output[:2000],
        })

    def save_metric(self, agent, metric_name, value):
        self.metrics.insert({
            "timestamp": datetime.utcnow().isoformat(),
            "agent": agent,
            "metric": metric_name,
            "value": value
        })

    def save_reflection(self, agent, insight):
        self.reflections.insert({
            "timestamp": datetime.utcnow().isoformat(),
            "agent": agent,
            "insight": insight
        })

    def get_recent_logs(self, agent, limit=5):
        logs = [l for l in self.logs if l.get("agent") == agent]
        return logs[-limit:]
EOF

# ==============================
# 🧩 sqlite_memory.py
# ==============================
cat > "$BASE_DIR/sqlite_memory.py" << 'EOF'
# agentic_autopilot/core/memory/sqlite_memory.py
import sqlite3
import os
from datetime import datetime
from agentic_autopilot.core.memory.base_memory import BaseMemory

class SQLiteMemory(BaseMemory):
    """Implementación con SQLite como backend de persistencia."""

    def __init__(self, agent_name: str):
        db_path = f"agentic_autopilot/agents/{agent_name}_agent/memory/{agent_name}_memory.db"
        os.makedirs(os.path.dirname(db_path), exist_ok=True)
        self.conn = sqlite3.connect(db_path)
        self.cur = self.conn.cursor()
        self._init_tables()

    def _init_tables(self):
        self.cur.execute("""
            CREATE TABLE IF NOT EXISTS logs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                timestamp TEXT,
                agent TEXT,
                action TEXT,
                status TEXT,
                output TEXT
            )
        """)
        self.cur.execute("""
            CREATE TABLE IF NOT EXISTS metrics (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                timestamp TEXT,
                agent TEXT,
                metric TEXT,
                value TEXT
            )
        """)
        self.cur.execute("""
            CREATE TABLE IF NOT EXISTS reflections (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                timestamp TEXT,
                agent TEXT,
                insight TEXT
            )
        """)
        self.conn.commit()

    def save_log(self, agent, action, status, output):
        self.cur.execute("""
            INSERT INTO logs (timestamp, agent, action, status, output)
            VALUES (?, ?, ?, ?, ?)
        """, (datetime.utcnow().isoformat(), agent, action, status, output[:2000]))
        self.conn.commit()

    def save_metric(self, agent, metric_name, value):
        self.cur.execute("""
            INSERT INTO metrics (timestamp, agent, metric, value)
            VALUES (?, ?, ?, ?)
        """, (datetime.utcnow().isoformat(), agent, metric_name, str(value)))
        self.conn.commit()

    def save_reflection(self, agent, insight):
        self.cur.execute("""
            INSERT INTO reflections (timestamp, agent, insight)
            VALUES (?, ?, ?)
        """, (datetime.utcnow().isoformat(), agent, insight))
        self.conn.commit()

    def get_recent_logs(self, agent, limit=5):
        self.cur.execute("""
            SELECT timestamp, action, status, output
            FROM logs WHERE agent=? ORDER BY id DESC LIMIT ?
        """, (agent, limit))
        return self.cur.fetchall()
EOF

# ==============================
# 🌐 supabase_memory.py (stub)
# ==============================
cat > "$BASE_DIR/supabase_memory.py" << 'EOF'
# agentic_autopilot/core/memory/supabase_memory.py
from agentic_autopilot.core.memory.base_memory import BaseMemory

class SupabaseMemory(BaseMemory):
    """Stub inicial para futura integración con Supabase."""
    def __init__(self, agent_name: str):
        self.agent_name = agent_name
        print("⚠️ SupabaseMemory aún no implementada.")

    def save_log(self, agent, action, status, output): pass
    def save_metric(self, agent, metric_name, value): pass
    def save_reflection(self, agent, insight): pass
    def get_recent_logs(self, agent, limit=5): return []
EOF

# ==============================
# __init__.py
# ==============================
cat > "$BASE_DIR/__init__.py" << 'EOF'
from agentic_autopilot.core.memory.base_memory import BaseMemory
from agentic_autopilot.core.memory.tiny_memory import TinyMemory
from agentic_autopilot.core.memory.sqlite_memory import SQLiteMemory
from agentic_autopilot.core.memory.supabase_memory import SupabaseMemory

__all__ = ["BaseMemory", "TinyMemory", "SQLiteMemory", "SupabaseMemory"]
EOF

echo "✅ Módulo de memoria creado con éxito en $BASE_DIR"
