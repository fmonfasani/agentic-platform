# agentic_autopilot/agents/git_agent/git_autopilot.py
import sys, os, time
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "../../..")))

from dotenv import load_dotenv
from agentic_autopilot.core.memory.tiny_memory import TinyMemory
from agentic_autopilot.core.eval_layer import evaluate_run
from agentic_autopilot.core.reflection_layer import reflect_on_logs
from agentic_autopilot.agents.git_agent.git_health import check_git_health
from agentic_autopilot.agents.git_agent.git_repair import auto_repair_git
from agentic_autopilot.agents.git_agent.git_status_reporter import generate_git_report
from agentic_autopilot.agents.git_agent.utils_git import git_exec
from agentic_autopilot.core.eval_layer import EvalLayer




load_dotenv()
AGENT = "git"

class GitAutopilot:
    def __init__(self):
        self.memory = TinyMemory(AGENT)

    def run(self):
        print("🤖 Iniciando Git Autopilot...\n")
        steps = [
            "git status",
            "git pull --rebase",
            "git push"
        ]

        for cmd in steps:
            result = git_exec(cmd, self.memory)
            EvalLayer.evaluate_run("git", cmd, output)

            self.memory.save_metric(AGENT, "eval", eval_result)

        auto_repair_git(self.memory)
        generate_git_report(self.memory)
        reflect_on_logs(AGENT, self.memory.get_recent_logs(AGENT))

        print("✅ Git Autopilot finalizado.\n")

if __name__ == "__main__":
    GitAutopilot().run()
