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
