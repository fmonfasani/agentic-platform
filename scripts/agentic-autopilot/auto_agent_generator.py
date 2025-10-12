#!/usr/bin/env python3
"""
Creador automático de agentes (Assistants) basado en archivos de configuración.
"""

import os, json
from openai import OpenAI
from dotenv import load_dotenv
from pathlib import Path

load_dotenv()
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

CONFIG_PATH = Path("scripts/workflows/agents_config.json")
AGENTS_REGISTRY = Path("reports/status/agents_registry.json")

def create_agent(config):
    print(f"🚀 Creando agente: {config['name']}")
    response = client.beta.assistants.create(
        name=config["name"],
        instructions=config["instructions"],
        model=config.get("model", "gpt-4-turbo"),
        tools=config.get("tools", [])
    )
    print(f"✅ Agente '{config['name']}' creado (ID: {response.id})")
    return {"name": config["name"], "id": response.id}

def main():
    if not CONFIG_PATH.exists():
        print("❌ No se encontró la configuración de agentes:", CONFIG_PATH)
        return

    with open(CONFIG_PATH, "r", encoding="utf-8") as f:
        configs = json.load(f)

    registry = []
    for agent_cfg in configs:
        result = create_agent(agent_cfg)
        registry.append(result)

    AGENTS_REGISTRY.parent.mkdir(parents=True, exist_ok=True)
    with open(AGENTS_REGISTRY, "w", encoding="utf-8") as f:
        json.dump(registry, f, indent=2)
    print(f"📘 Registro actualizado: {AGENTS_REGISTRY}")

if __name__ == "__main__":
    main()
