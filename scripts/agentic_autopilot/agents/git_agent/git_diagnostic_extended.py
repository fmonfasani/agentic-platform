import subprocess
from datetime import datetime
from agentic_autopilot.core.memory.tiny_memory import TinyMemory


def run_command(cmd):
    """Ejecuta un comando del sistema y devuelve salida limpia"""
    try:
        result = subprocess.run(cmd, capture_output=True, text=True, check=False)
        return result.stdout.strip()
    except Exception as e:
        return f"Error ejecutando {cmd}: {e}"


def get_branch_info():
    local = run_command(["git", "rev-parse", "--abbrev-ref", "HEAD"])
    remote = run_command(["git", "rev-parse", "--symbolic-full-name", "--abbrev-ref", "@{u}"])
    return local, remote


def get_ahead_behind(local, remote):
    try:
        result = run_command(["git", "rev-list", "--left-right", "--count", f"{remote}...{local}"])
        behind, ahead = map(int, result.split())
        return ahead, behind
    except Exception:
        return 0, 0


def parse_git_status():
    """Cuenta archivos modificados, staged y untracked"""
    output = run_command(["git", "status", "--porcelain"])
    staged = sum(1 for line in output.splitlines() if line and line[0] != " ")
    unstaged = sum(1 for line in output.splitlines() if line and line[1] != " " and line[0] == " ")
    untracked = sum(1 for line in output.splitlines() if line.startswith("??"))
    return staged, unstaged, untracked


def run_diagnostic_extended():
    """Ejecuta diagnóstico extendido de Git"""
    print("🧩 Ejecutando diagnóstico extendido de Git...")

    local_branch, remote_branch = get_branch_info()
    ahead, behind = get_ahead_behind(local_branch, remote_branch)
    staged, unstaged, untracked = parse_git_status()

    summary = (
        f"Local: {local_branch} | Remota: {remote_branch} | "
        f"Ahead: {ahead} | Behind: {behind} | "
        f"Staged: {staged} | Unstaged: {unstaged} | Untracked: {untracked}"
    )

    print(f"📋 {summary}")

    data = {
        "agent": "git",
        "action": "diagnostic_extended",
        "status": "success",
        "output": summary,
        "timestamp": datetime.now().isoformat()
    }

    memory = TinyMemory()
    memory.save_log(data)
    print("💾 Diagnóstico extendido guardado en TinyMemory y SQLite.")


if __name__ == "__main__":
    run_diagnostic_extended()
