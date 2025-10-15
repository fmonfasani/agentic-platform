from agents.base_agent import BaseAgent
from modules.logger import log_event
from openai import OpenAI
import os
from pathlib import Path

class WebBuildAgent(BaseAgent):
    def __init__(self):
        super().__init__("WEB_BUILD_FIXER")
        self.client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
        self.reports = Path(__file__).resolve().parents[2] / "reports" / "logs"

    def run(self, log_text):
        log_event("WEB_BUILD", "🧱 Iniciando agente BuildError...")
        try:
            prompt = f"""
Sos un experto en Next.js y React.
Analizá el siguiente error de compilación o sintaxis y generá un parche válido en formato unified diff.

Error log:
{log_text}

Reglas:
- Corrigí sólo archivos .tsx o .ts.
- No dejes CSS o tailwind en archivos TypeScript.
- Devolvé SOLO el diff (sin texto adicional).
"""
            response = self.client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[{"role": "user", "content": prompt}],
                temperature=0.2,
            )
            diff = response.choices[0].message.content.strip()
            patch_path = self.reports / f"web_build_fix_{self.timestamp()}.patch"
            with open(patch_path, "w", encoding="utf-8") as f:
                f.write(diff)
            log_event("WEB_BUILD", f"✅ Patch guardado en {patch_path}")
        except Exception as e:
            log_event("WEB_BUILD", f"💥 Error en agente Build: {e}")
