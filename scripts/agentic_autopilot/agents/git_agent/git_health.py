from .utils_git import run_cmd

def check_git_health():
    print("� Analizando estado del repositorio...")
    status = run_cmd("git status --short")
    branch = run_cmd("git rev-parse --abbrev-ref HEAD")
    ahead = run_cmd("git rev-list --left-right --count origin/{0}...{0}".format(branch))

    print(f"� Rama actual: {branch}")
    if not status:
        print("✅ Working directory limpio.")
    else:
        print("⚠️ Cambios sin commitear:\\n", status)

    print("� Sincronización remota:", ahead)
    return {"branch": branch, "status": status, "sync": ahead}

if __name__ == "__main__":
    check_git_health()
