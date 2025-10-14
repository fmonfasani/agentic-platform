# agentic_autopilot/core/tiny_logger.py
from tinydb import TinyDB
from datetime import datetime
import os

class TinyLogger:
    """Memoria persistente común para todos los agentes."""

    def __init__(self, agent_name, db_path=None):
        base_dir = "agentic_autopilot/agents"
        if db_path is None:
            db_path = f"{base_dir}/{agent_name}_agent/memory/{agent_name}_memory.json"
        os.makedirs(os.path.dirname(db_path), exist_ok=True)
        self.db = TinyDB(db_path)
        self.agent_name = agent_name
        self.logs = self.db.table("logs")
        self.metrics = self.db.table("metrics")
        self.reflections = self.db.table("reflections")

    def log(self, action, status, output):
        self.logs.insert({
            "timestamp": datetime.utcnow().isoformat(),
            "action": action,
            "status": status,
            "output": output[:2000],
        })

    def add_metric(self, metric_name, value):
        self.metrics.insert({
            "timestamp": datetime.utcnow().isoformat(),
            "metric": metric_name,
            "value": value
        })

    def add_reflection(self, insight):
        self.reflections.insert({
            "timestamp": datetime.utcnow().isoformat(),
            "insight": insight
        })

    def get_recent_logs(self, n=5):
        return self.logs.all()[-n:]
