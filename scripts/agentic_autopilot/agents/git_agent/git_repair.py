# agentic_autopilot/agents/git_agent/git_repair.py
from agentic_autopilot.agents.git_agent.utils_git import git_exec

def auto_repair_git(memory=None):
    """Ejecuta comandos para reparar errores comunes."""
    repairs = [
        "git merge --abort",
        "git rebase --abort",
        "git fetch --all",
        "git reset --merge"
    ]
    success = 0
    for cmd in repairs:
        result = git_exec(cmd, memory)
        if result["ok"]:
            success += 1
    ratio = success / len(repairs)
    if memory:
        memory.save_metric("git", "repair_success_rate", ratio)
    return ratio
