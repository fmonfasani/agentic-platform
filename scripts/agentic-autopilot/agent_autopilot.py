from openai import OpenAI
import os, json
from dotenv import load_dotenv

load_dotenv()
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

REGISTRY_PATH = "reports/status/agents_registry.json"

def run_agent(name, input_text):
    with open(REGISTRY_PATH, "r") as f:
        agents = json.load(f)

    agent = next((a for a in agents if a["name"] == name), None)
    if not agent:
        print(f"❌ Agente {name} no encontrado en el registro.")
        return

    print(f"🧠 Ejecutando agente {name} ({agent['id']})...")
    run = client.beta.threads.create_and_run(
        assistant_id=agent["id"],
        thread={"messages": [{"role": "user", "content": input_text}]}
    )
    print("✅ Respuesta del agente:")
    print(run)
