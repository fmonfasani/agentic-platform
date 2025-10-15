# scripts/agentic_autopilot/core/eval_layer.py
from datetime import datetime

class EvalLayer:
    """Evalúa ejecuciones de agentes y calcula métricas heurísticas."""
    
    @staticmethod
    def evaluate(agent_name: str, logs: list):
        """Evalúa los logs recientes del agente."""
        if not logs:
            return {"agent": agent_name, "status": "no_logs", "score": 0, "errors": []}

        success_count = sum(1 for log in logs if log.get("status") == "success")
        error_count = sum(1 for log in logs if log.get("status") != "success")
        score = success_count / max(1, (success_count + error_count))

        return {
            "agent": agent_name,
            "status": "evaluated",
            "score": round(score, 2),
            "success": success_count,
            "errors": error_count,
        }

    @staticmethod
    def evaluate_run(agent, command, output):
        """Evalúa la ejecución y devuelve un puntaje simple."""
        score = 1.0 if "error" not in output.lower() else 0.0
        return {"agent": agent, "command": command, "score": score}
