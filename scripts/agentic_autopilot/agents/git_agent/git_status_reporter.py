from datetime import datetime
from .git_health import check_git_health

def generate_report(memory=None):
    """Genera un reporte del estado de Git y lo guarda en la memoria local."""
    info = check_git_health(memory)

    report = {
        "timestamp": datetime.utcnow().isoformat(),
        "agent": "git",
        "branch": info["branch"]["output"].strip(),
        "status": info["status"]["output"][:3000],
        "sync": info["sync"]["output"],
        "ok": info["sync"]["ok"]
    }

    if memory:
        memory.save_log("git", "generate_report", "success", str(report))
        memory.save_metric("git", "report_generated", 1)

    print("[INFO] Reporte de Git guardado en TinyMemory.")
    return report
