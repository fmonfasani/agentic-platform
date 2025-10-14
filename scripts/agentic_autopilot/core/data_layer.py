# agentic_autopilot/core/data_layer.py
import os, json, datetime

class DataLayer:
    def __init__(self, db_path="agentic_autopilot/memory/autopilot_logs.json"):
        self.db_path = db_path
        os.makedirs(os.path.dirname(db_path), exist_ok=True)
        if not os.path.exists(db_path):
            with open(db_path, "w") as f:
                json.dump([], f)

    def log_event(self, agent, action, status, output):
        entry = {
            "timestamp": datetime.datetime.utcnow().isoformat(),
            "agent": agent,
            "action": action,
            "status": status,
            "output": output[:5000],
        }
        data = json.load(open(self.db_path))
        data.append(entry)
        with open(self.db_path, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
