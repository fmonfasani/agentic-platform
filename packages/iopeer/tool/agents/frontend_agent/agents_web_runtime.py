from agents.base_agent import BaseAgent
from modules.logger import log_event
from openai import OpenAI
from pathlib import Path
import os

class WebRuntimeAgent(BaseAgent):
    def __init__(self):
        super().__init__("WEB_RUNTIME_FIXER")
        self.client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
        self.reports = Path(__file__).resolve().parents[2] / "reports" / "logs"

    def run(self, log_text):
        log_event("WEB_RUNTIME", "⚙️ Analizando RuntimeError...")
        try:
            prompt = f"""
Sos un experto en React y Next.js.
Detectá errores de runtime (ej. hydration, SSR, fetch) y generá un diff unificado que los corrija.

Error log:
{log_text}

Reglas:
- No expliques, sólo devolvé el diff.
- Usá formato git diff.
"""
            response = self.client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[{"role": "user", "content": prompt}],
                temperature=0.2,
            )
            diff = response.choices[0].message.content.strip()
            patch_path = self.reports / f"web_runtime_fix_{self.timestamp()}.patch"
            with open(patch_path, "w", encoding="utf-8") as f:
                f.write(diff)
            log_event("WEB_RUNTIME", f"✅ Patch guardado en {patch_path}")
        except Exception as e:
            log_event("WEB_RUNTIME", f"💥 Error en agente Runtime: {e}")
