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
    def evaluate_run(agent_name: str, command: str, output: str):
        """Evalúa heurísticamente una ejecución individual."""
        score = 1.0
        tags = []

        if "error" in output.lower():
            score -= 0.5
            tags.append("error")

        if "conflict" in output.lower():
            score -= 0.3
            tags.append("conflict")

        if "success" in output.lower():
            score += 0.2
            tags.append("success")

        return {
            "timestamp": datetime.utcnow().isoformat(),
            "agent": agent_name,
            "command": command,
            "score": max(0, min(score, 1)),
            "tags": tags,
        }
