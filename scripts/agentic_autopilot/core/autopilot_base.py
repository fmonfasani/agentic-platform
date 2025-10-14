# agentic_autopilot/core/autopilot_base.py
import time

class AutopilotBase:
    def __init__(self, agent_name, data_layer, eval_layer, reflection_layer):
        self.agent_name = agent_name
        self.data_layer = data_layer
        self.eval_layer = eval_layer
        self.reflection_layer = reflection_layer

    def execute(self, action, func):
        """Ejecuta una acción registrada en logs."""
        print(f"🧩 Ejecutando acción: {action}")
        try:
            result = func()
            self.data_layer.log_event(self.agent_name, action, "success", result)
            return result
        except Exception as e:
            self.data_layer.log_event(self.agent_name, action, "error", str(e))
            print(f"⚠️ Error en {action}: {e}")

    def run(self):
        raise NotImplementedError("El agente debe implementar su propio flujo.")

    def evaluate(self):
        self.eval_layer.evaluate(self.agent_name)

    def reflect(self):
        self.reflection_layer.reflect(self.agent_name)
