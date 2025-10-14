from .utils_git import run_cmd

def check_git_health():
    print("Ì¥ç Analizando estado del repositorio...")
    status = run_cmd("git status --short")
    branch = run_cmd("git rev-parse --abbrev-ref HEAD")
    ahead = run_cmd("git rev-list --left-right --count origin/{0}...{0}".format(branch))

    print(f"Ì∫¥ Rama actual: {branch}")
    if not status:
        print("‚úÖ Working directory limpio.")
    else:
        print("‚ö†Ô∏è Cambios sin commitear:\\n", status)

    print("Ì≥° Sincronizaci√≥n remota:", ahead)
    return {"branch": branch, "status": status, "sync": ahead}

if __name__ == "__main__":
    check_git_health()
