from iopeer.tool.agents.git_agent.utils_git import run_cmd

def check_git_health(memory=None):
    """Analiza el estado del repositorio y guarda el resultado en memoria."""
    print("[INFO] Analizando estado del repositorio...")

    branch = run_cmd("git rev-parse --abbrev-ref HEAD")
    status = run_cmd("git status --short")
    sync = run_cmd(f"git rev-list --left-right --count origin/{branch['output'].strip()}...{branch['output'].strip()}")

    result = {
        "branch": branch,
        "status": status,
        "sync": sync,
    }

    if memory:
        memory.save_log("git", "check_health", "success" if sync["ok"] else "error", str(result))
        memory.save_metric("git", "health_checked", 1)

    return result
