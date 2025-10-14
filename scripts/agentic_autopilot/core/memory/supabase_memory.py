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
