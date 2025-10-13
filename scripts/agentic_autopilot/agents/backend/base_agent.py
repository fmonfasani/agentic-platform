#!/usr/bin/env python3
"""
BaseAgent — clase común para agentes de reparación
"""

import os
import datetime
from pathlib import Path
from openai import OpenAI
from dotenv import load_dotenv
from agentic_autopilot.agents.logger import log_event

ROOT = Path(__file__).resolve().parents[2]
REPORTS = ROOT / "reports" / "logs"
LOGS = ROOT / "logs" / "agents"
for d in [REPORTS, LOGS]:
    d.mkdir(parents=True, exist_ok=True)

load_dotenv(ROOT / ".env")
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

class BaseAgent:
    def __init__(self, name: str, model: str = "gpt-4o-mini"):
        self.name = name
        self.model = model

    def generate_patch(self, prompt: str, prefix: str) -> Path | None:
        """Genera un patch (diff git apply) basado en el prompt."""
        ts = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
        patch_path = REPORTS / f"{prefix}_{ts}.patch"

        try:
            log_event(self.name, "🧠 Consultando OpenAI para generar patch...")
            response = client.responses.create(model=self.model, input=prompt, temperature=0)
            patch = response.output_text.strip()

            if not patch.startswith("diff --git"):
                log_event(self.name, "⚠️ Respuesta inválida: no contiene diff válido.")
                invalid_path = LOGS / f"invalid_{prefix}_{ts}.txt"
                invalid_path.write_text(patch, encoding="utf-8")
                return None

            patch_path.write_text(patch, encoding="utf-8")
            log_event(self.name, f"✅ Patch generado en {patch_path}")
            return patch_path

        except Exception as e:
            log_event(self.name, f"💥 Error generando patch: {e}")
            return None

    def generate_report(self, prompt: str, prefix: str):
        """Genera un informe en texto simple."""
        ts = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
        report_path = REPORTS / f"{prefix}_{ts}.txt"
        try:
            log_event(self.name, "🧠 Solicitando diagnóstico a OpenAI...")
            response = client.responses.create(model=self.model, input=prompt, temperature=0.2)
            report_path.write_text(response.output_text, encoding="utf-8")
            log_event(self.name, f"📄 Reporte guardado en {report_path}")
        except Exception as e:
            log_event(self.name, f"💥 Error generando reporte: {e}")
