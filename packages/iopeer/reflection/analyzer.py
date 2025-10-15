
from openai import OpenAI
import os, json

class ReflectionLayer:
    def reflect(self, agent_name):
        print(f"🧠 Reflexionando sobre el desempeño de {agent_name}...")
        db_path = "iopeer/data/memory/autopilot_logs.json"
        if not os.path.exists(db_path):
            return
        logs = json.load(open(db_path))
        recent = logs[-5:]
        client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
        prompt = f"Analiza estos logs y sugiere mejoras:\n\n{json.dumps(recent, indent=2)}"
        resp = client.chat.completions.create(model="gpt-4o-mini", messages=[{"role": "user", "content": prompt}])
        print("💡 Sugerencia:", resp.choices[0].message.content.strip())

    def reflect_on_logs(agent_name: str, logs: list, memory):
        """Analiza los logs y genera una reflexión del agente."""
        if not logs:
            print("⚠️ No hay logs para reflexionar.")
            return

        client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
        context = "\n".join([f"{l['timestamp']} → {l['action']}: {l['status']}" for l in logs[-5:]])

        prompt = f"""
    Analiza los siguientes registros del agente '{agent_name}'.
    Identifica patrones de error y sugiere pasos concretos de mejora.
    ---
    {context}
    """
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{"role": "user", "content": prompt}]
        )

        insight = response.choices[0].message.content.strip()
        memory.save_reflection(agent_name, insight)
        print(f"💡 Reflexión guardada para {agent_name}:\n{insight}\n")
