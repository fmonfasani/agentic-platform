#!/usr/bin/env python3
"""
Verifica que las credenciales y dependencias del Agentic Autopilot estén configuradas correctamente.
Prueba la API de OpenAI, el acceso SMTP de Gmail y la existencia de reportes locales.
"""

import os
import smtplib
from email.mime.text import MIMEText
from pathlib import Path
from dotenv import load_dotenv
from openai import OpenAI

load_dotenv()

# --- VARIABLES ---
EMAIL = os.getenv("EMAIL_REPORTS_TO")
EMAIL_PASS = os.getenv("EMAIL_APP_PASSWORD")
OPENAI_KEY = os.getenv("OPENAI_API_KEY")
REPORTS_DIR = Path("reports/status")

def print_section(title):
    print(f"\n{'=' * 60}\n{title}\n{'=' * 60}")

def check_env_vars():
    print_section("🔍 Verificando variables de entorno...")
    required = ["OPENAI_API_KEY", "EMAIL_REPORTS_TO", "EMAIL_APP_PASSWORD"]
    missing = [v for v in required if not os.getenv(v)]
    if missing:
        print(f"❌ Faltan variables en .env: {', '.join(missing)}")
        return False
    print("✅ Todas las variables requeridas están configuradas.")
    print(f"📧 EMAIL_REPORTS_TO = {EMAIL}")
    return True

def check_openai_api():
    print_section("🧠 Probando conexión con OpenAI API...")
    try:
        client = OpenAI(api_key=OPENAI_KEY)
        models = client.models.list()
        first = models.data[0].id if models.data else "desconocido"
        print(f"✅ Conexión exitosa a OpenAI. Modelo detectado: {first}")
        return True
    except Exception as e:
        print(f"❌ Error al conectar con OpenAI: {e}")
        return False

def check_gmail_smtp():
    print_section("📬 Probando conexión SMTP con Gmail...")
    test_msg = MIMEText("Prueba de conexión SMTP desde Agentic Autopilot.")
    test_msg["Subject"] = "🔧 Verificación Agentic Autopilot"
    test_msg["From"] = EMAIL
    test_msg["To"] = EMAIL
    try:
        with smtplib.SMTP_SSL("smtp.gmail.com", 465, timeout=10) as server:
            server.login(EMAIL, EMAIL_PASS)
            server.send_message(test_msg)
        print(f"✅ Conexión SMTP exitosa. Email de prueba enviado a {EMAIL}.")
        return True
    except smtplib.SMTPAuthenticationError:
        print("❌ Error de autenticación SMTP. Verificá tu App Password.")
    except Exception as e:
        print(f"❌ Error SMTP: {e}")
    return False

def check_reports_folder():
    print_section("🗃️ Verificando reportes generados...")
    if not REPORTS_DIR.exists():
        print(f"❌ Carpeta no encontrada: {REPORTS_DIR}")
        return False

    reports = sorted(REPORTS_DIR.glob("project-status-*.md"))
    if not reports:
        print("⚠️ No se encontraron reportes en reports/status/.")
        return False

    latest = reports[-1]
    print(f"✅ Se encontró reporte más reciente: {latest.name}")
    return True

def main():
    print("🚀 Ejecutando verificación del entorno Agentic Autopilot...")
    ok_env = check_env_vars()
    ok_openai = check_openai_api()
    ok_gmail = check_gmail_smtp()
    ok_reports = check_reports_folder()

    all_ok = all([ok_env, ok_openai, ok_gmail, ok_reports])
    print_section("📊 RESULTADO FINAL")
    if all_ok:
        print("✅ Todo listo. El entorno está correctamente configurado para ejecutar el Autopilot.")
    else:
        print("⚠️ Hay errores o configuraciones faltantes. Revisá las secciones anteriores.")

if __name__ == "__main__":
    main()
