
from iopeer.utils.shell_tools import run_cmd

def git_exec(cmd, memory=None):
    """Ejecuta un comando git y guarda logs opcionalmente."""
    result = run_cmd(cmd)
    if memory:
        status = "success" if result["ok"] else "error"
        memory.save_log("git", cmd, status, result["output"])
    return result
