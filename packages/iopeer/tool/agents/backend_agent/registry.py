"""
Agent Registry — v0.0.1
Contiene el mapeo entre tipos de tareas o errores y los agentes especializados.
"""
from  iopeer.tool.agents.agents_build import BuildAgent
from  iopeer.tool.agents.agents_dependency import DependencyAgent
from  iopeer.tool.agents.agents_env import EnvAgent
from  iopeer.tool.agents.agents_runtime import RuntimeAgent

AGENT_REGISTRY = {
    "BuildError": BuildAgent,
    "DependencyError": DependencyAgent,
    "EnvError": EnvAgent,
    "RuntimeError": RuntimeAgent,
}
