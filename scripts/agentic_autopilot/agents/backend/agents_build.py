#!/usr/bin/env python3
from openai import OpenAI
from pathlib import Path
import datetime
import re
from .base_agent import BaseAgent
from .logger import log_event

def safe_text(text: str) -> str:
    if not text:
        return ""
    text = re.sub(r'[\ud800-\udfff]', '', text)
    text = re.sub(r'\x1B(?:[@-Z\\-_]|\[[0-?]*[ -/]*[@-~])', '', text)
    return text.encode("utf-8", "replace").decode("utf-8", "replace")

class RepairAgent(BaseAgent):
    def __init__(self, name="Build"):
        super().__init__(name)

    def run(self, log_text: str):
        clean_log = safe_text(log_text)
        ts = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
        reports_dir = Path("reports/logs")
        reports_dir.mkdir(parents=True, exist_ok=True)
        patch_path = reports_dir / f"{self.name.lower()}_fix_{{ts}}.patch"

        log_event(self.name, f"🚀 Iniciando agente {{self.name}}...")

        try:
            client = OpenAI()
            log_event(f"{{self.name}} FIXER", "🧠 Consultando OpenAI para generar patch...")

            prompt = f"""You are a NestJS or TypeScript auto-repair assistant.
Analyze this error log and generate a unified diff patch (.patch)
to fix the issue. If no code change is needed, return "NO_PATCH".
Log:
{{clean_log}}
"""

            response = client.responses.create(
                model="gpt-4o",
                input=prompt,
                temperature=0.1,
            )

            result_text = response.output[0].content[0].text
            if "diff --git" in result_text:
                patch_path.write_text(result_text, encoding="utf-8")
                log_event(f"{{self.name}} FIXER", f"✅ Patch guardado en {{patch_path}}")
            else:
                log_event(f"{{self.name}} FIXER", "⚠️ Respuesta inválida: no contiene diff válido.")

        except Exception as e:
            log_event(f"{{self.name}} FIXER", f"💥 Error generando patch: {{e}}")
