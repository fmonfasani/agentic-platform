from datetime import datetime
from pathlib import Path

LOGS = Path(__file__).resolve().parents[2] / "logs" / "agents"
LOGS.mkdir(parents=True, exist_ok=True)

def log_event(agent_type: str, message: str):
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    entry = f"[{timestamp}] [{agent_type.upper()}] {message}"
    print(entry)
    with open(LOGS / f"{agent_type}.log", "a", encoding="utf-8") as f:
        f.write(entry + "\n")
