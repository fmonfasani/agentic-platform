import sys, os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "../../..")))
import subprocess, json, sqlite3
from datetime import datetime
from iopeer.data.memory.tiny_memory import TinyMemory

DB_PATH = "/core/memory/git_diagnostics.db"

def run_cmd(cmd):
    """Ejecuta un comando de shell y devuelve salida estructurada."""
    try:
        result = subprocess.run(cmd, capture_output=True, text=True, shell=True)
        return {"output": result.stdout.strip(), "error": result.stderr.strip(), "ok": result.returncode == 0}
    except Exception as e:
        return {"output": "", "error": str(e), "ok": False}

def ensure_sqlite_schema():
    """Crea tabla SQLite si no existe."""
    os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()
    cur.execute("""
        CREATE TABLE IF NOT EXISTS git_diagnostics (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            timestamp TEXT,
            local_branch TEXT,
            remote_branch TEXT,
            ahead INTEGER,
            behind INTEGER,
            staged_count INTEGER,
            unstaged_count INTEGER,
            untracked_count INTEGER,
            is_tracking INTEGER,
            is_synced INTEGER
        )
    """)
    conn.commit()
    conn.close()

def count_lines(cmd):
    """Cuenta cantidad de líneas de salida de un comando."""
    res = run_cmd(cmd)
    return len(res["output"].splitlines()) if res["ok"] and res["output"] else 0

def generate_diagnostic():
    """Crea snapshot técnico del estado del repositorio."""
    branch = run_cmd("git rev-parse --abbrev-ref HEAD")
    remote = run_cmd("git rev-parse --abbrev-ref --symbolic-full-name @{u}")
    staged = count_lines("git diff --cached --name-only")
    unstaged = count_lines("git diff --name-only")
    untracked = count_lines("git ls-files --others --exclude-standard")

    tracking = remote["ok"]
    ahead, behind = 0, 0
    if tracking:
        sync = run_cmd(f"git rev-list --left-right --count {remote['output']}...{branch['output']}")
        if sync["ok"] and sync["output"]:
            parts = sync["output"].split()
            if len(parts) == 2:
                ahead, behind = int(parts[1]), int(parts[0])

    is_synced = (ahead == 0 and behind == 0)
    return {
        "timestamp": datetime.utcnow().isoformat(),
        "local_branch": branch["output"],
        "remote_branch": remote["output"] if remote["ok"] else None,
        "ahead": ahead,
        "behind": behind,
        "staged_count": staged,
        "unstaged_count": unstaged,
        "untracked_count": untracked,
        "is_tracking": int(tracking),
        "is_synced": int(is_synced)
    }

def save_to_sqlite(data):
    """Guarda diagnóstico estructurado en SQLite."""
    ensure_sqlite_schema()
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()
    cur.execute("""
        INSERT INTO git_diagnostics (
            timestamp, local_branch, remote_branch, ahead, behind,
            staged_count, unstaged_count, untracked_count, is_tracking, is_synced
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        data["timestamp"], data["local_branch"], data["remote_branch"], data["ahead"], data["behind"],
        data["staged_count"], data["unstaged_count"], data["untracked_count"], data["is_tracking"], data["is_synced"]
    ))
    conn.commit()
    conn.close()

def save_to_tinymemory(data):
    """Guarda datos no estructurados (logs, contexto) en TinyMemory."""
    memory = TinyMemory()
    summary = (
        f"Branch local: {data['local_branch']} | "
        f"Remota: {data['remote_branch']} | "
        f"Ahead: {data['ahead']} | Behind: {data['behind']} | "
        f"Staged: {data['staged_count']} | Unstaged: {data['unstaged_count']} | "
        f"Untracked: {data['untracked_count']}"
    )
    memory.save_log({
    "agent": "git",
    "action": "diagnostic",
    "status": "success",
    "output": summary
        })


def run_diagnostic():
    """Ejecuta diagnóstico completo y guarda en ambas bases."""
    print(" Ejecutando diagnóstico informativo de Git...")
    data = generate_diagnostic()
    save_to_sqlite(data)
    save_to_tinymemory(data)
    print("✅ Diagnóstico guardado en SQLite y TinyMemory.")
    return data

if __name__ == "__main__":
    print(json.dumps(run_diagnostic(), indent=2))
