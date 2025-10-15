from agentic_autopilot.agents.git_agent.utils_git import git_exec

def auto_repair_git(memory=None):
    """Ejecuta comandos para reparar errores comunes y guarda métricas."""
    print("[INFO] Iniciando reparación automática de Git...")
    repairs = [
        "git fetch --all",
    ]
    success = 0

    for cmd in repairs:
        result = git_exec(cmd, memory)
        if result["ok"]:
            success += 1

    ratio = success / len(repairs)
    if memory:
        memory.save_metric("git", "repair_success_rate", ratio)
        memory.save_log("git", "auto_repair", "success", f"{success}/{len(repairs)} comandos exitosos")

    print(f"[OK] Reparación completada con tasa de éxito: {ratio:.2f}")
    return ratio
