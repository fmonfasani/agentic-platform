from dotenv import load_dotenv
from agentic_autopilot.core.memory.tiny_memory import TinyMemory
from agentic_autopilot.core.eval_layer import EvalLayer
from agentic_autopilot.core.reflection_layer import ReflectionLayer
from agentic_autopilot.agents.git_agent.utils_git import git_exec
from agentic_autopilot.agents.git_agent.git_health import check_git_health
from agentic_autopilot.agents.git_agent.git_repair import auto_repair_git
from agentic_autopilot.agents.git_agent.git_status_reporter import generate_report
from agentic_autopilot.agents.git_agent.git_diagnostic import run_diagnostic

load_dotenv()
AGENT = "git"

class GitAutopilot:
    def __init__(self):
        self.memory = TinyMemory()

    def run(self):
        print("🤖 Iniciando Git Autopilot...\n")

        steps = ["git status", "git pull --rebase", "git push"]
        for cmd in steps:
            result = git_exec(cmd, self.memory)
            eval_result = EvalLayer.evaluate_run(AGENT, cmd, result["output"])
            self.memory.save_metric(AGENT, "eval", eval_result)

        auto_repair_git(self.memory)
        generate_report(self.memory)

        logs = self.memory.get_recent_logs(AGENT)
        ReflectionLayer.reflect_on_logs(AGENT, logs, self.memory)

        print("✅ Git Autopilot finalizado.\n")

    def run(self):
        print("🤖 Iniciando Git Autopilot...\n")
        diagnostic = run_diagnostic()
        self.memory.save_metric(AGENT, "diagnostic_executed", 1)

if __name__ == "__main__":
    GitAutopilot().run()
