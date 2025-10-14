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
