#!/usr/bin/env python3
"""
Envía el último reporte por Gmail (requiere EMAIL_APP_PASSWORD).
"""
from dotenv import load_dotenv
load_dotenv()


import smtplib, os
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from pathlib import Path

EMAIL = os.getenv("EMAIL_ADDRESS")
EMAIL_PASS = os.getenv("EMAIL_APP_PASSWORD")
TO = os.getenv("EMAIL_REPORTS_TO")
REPORT_DIR = Path("reports/status")

latest = sorted(REPORT_DIR.glob("project-status-*.md"))[-1]
with open(latest, "r", encoding="utf-8") as f:
    content = f.read()

msg = MIMEMultipart("alternative")
msg["Subject"] = f"📊 Agentic Platform Report — {latest.name}"
msg["From"] = EMAIL
msg["To"] = EMAIL
msg.attach(MIMEText(content, "plain", "utf-8"))

with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
    server.login(EMAIL, EMAIL_PASS)
    server.send_message(msg)

print(f"📨 Reporte enviado exitosamente a {EMAIL}: {latest.name}")
