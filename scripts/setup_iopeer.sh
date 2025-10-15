#!/usr/bin/env bash
set -e

echo "🚀 Creando paquete iopeer dentro de agentic-platform/packages/iopeer ..."

cd "$(dirname "$0")"/..
mkdir -p packages/iopeer/{core,memory,tools,loop,examples}
cd packages/iopeer

# README
cat > README.md <<'EOF'
# IOpeer

IOpeer es un framework de agentes con aprendizaje continuo, memoria persistente y planificación adaptativa.
Parte del ecosistema **Agentic Platform**.
EOF

# pyproject.toml
cat > pyproject.toml <<'EOF'
[project]
name = "iopeer"
version = "0.0.1"
description = "Framework de agentes IOpeer con aprendizaje continuo y modular"
readme = "README.md"
authors = [{ name = "Federico Monfasani", email = "fmonfasani@gmail.com" }]
license = "MIT"
requires-python = ">=3.9"
dependencies = [
    "openai>=1.30.0",
    "supabase>=2.5.0",
    "sqlalchemy>=2.0.0",
    "fastapi>=0.111.0",
    "pydantic>=2.8.0",
]

[build-system]
requires = ["setuptools", "wheel"]
build-backend = "setuptools.build_meta"

[tool.setuptools.packages.find]
where = ["."]
include = ["iopeer*"]
EOF

# __init__.py
cat > iopeer/__init__.py <<'EOF'
"""
IOpeer - Framework de agentes inteligentes con aprendizaje continuo.
"""
from .core.agent import Agent
from .memory.memory_backend import MemoryBackend
__all__ = ["Agent", "MemoryBackend"]
EOF

# core/agent.py
cat > iopeer/core/agent.py <<'EOF'
from iopeer.memory.memory_backend import MemoryBackend

class Agent:
    """Agente base de IOpeer con soporte de memoria y ejecución continua."""

    def __init__(self, name: str, memory: MemoryBackend):
        self.name = name
        self.memory = memory

    def run(self, task: str):
        print(f"🤖 Ejecutando agente {self.name} con tarea: {task}")
        result = {"task": task, "result": f"Resultado simulado de {task}"}
        self.memory.save_run(self.name, {"input": task}, result)
        return result
EOF

# memory/memory_backend.py
cat > iopeer/memory/memory_backend.py <<'EOF'
from abc import ABC, abstractmethod

class MemoryBackend(ABC):
    """Interfaz base para sistemas de memoria persistente de IOpeer."""

    @abstractmethod
    def save_run(self, agent_id: str, input_data: dict, output_data: dict):
        pass

    @abstractmethod
    def get_history(self, agent_id: str, limit: int = 10):
        pass
EOF

# memory/supabase_backend.py
cat > iopeer/memory/supabase_backend.py <<'EOF'
from supabase import create_client
from iopeer.memory.memory_backend import MemoryBackend

class SupabaseMemory(MemoryBackend):
    def __init__(self, url: str, key: str):
        self.client = create_client(url, key)

    def save_run(self, agent_id, input_data, output_data):
        self.client.table("AgentRuns").insert({
            "agent_id": agent_id,
            "input": input_data,
            "output": output_data
        }).execute()

    def get_history(self, agent_id, limit=10):
        return (self.client.table("AgentRuns")
                .select("*")
                .eq("agent_id", agent_id)
                .order("created_at", desc=True)
                .limit(limit)
                .execute()
                .data)
EOF

# example
cat > iopeer/examples/demo_agent.py <<'EOF'
from iopeer.core.agent import Agent
from iopeer.memory.supabase_backend import SupabaseMemory

if __name__ == "__main__":
    memory = SupabaseMemory("https://your-supabase-url", "your-api-key")
    agent = Agent("demo-agent", memory)
    agent.run("Analizar datos históricos de agentes.")
EOF

# publish script
cat > publish_iopeer.sh <<'EOF'
#!/usr/bin/env bash
set -e
cd "$(dirname "$0")"
echo "📦 Construyendo y publicando iopeer..."
rm -rf dist build *.egg-info
python -m build
twine upload dist/*
EOF
chmod +x publish_iopeer.sh

echo "✅ Paquete iopeer creado correctamente en packages/iopeer/"
echo "👉 Instalación local (editable): pip install -e packages/iopeer"
