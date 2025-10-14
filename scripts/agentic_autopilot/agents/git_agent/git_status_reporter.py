from datetime import datetime
from .git_health import check_git_health

def generate_report():
    info = check_git_health()
    timestamp = datetime.now().strftime("%Y%m%d_%H%M")
    path = f"scripts/reports/status/git-health-{timestamp}.md"
    with open(path, "w", encoding="utf-8") as f:
        f.write(f"# í·¾ Git Health Report ({timestamp})\\n\\n")
        f.write(f"**Branch:** {info['branch']}\\n\\n")
        f.write("## Status\\n```\\n" + (info["status"] or "Clean") + "\\n```\\n")
        f.write("## Sync\\n" + info["sync"])
    print(f"í³„ Reporte generado en {path}")

if __name__ == "__main__":
    generate_report()
