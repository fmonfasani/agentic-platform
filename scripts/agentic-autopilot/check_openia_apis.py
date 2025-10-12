#!/usr/bin/env python3
from openai import OpenAI
import os
from dotenv import load_dotenv

# Cargar variables del archivo .env
load_dotenv()

# Obtener la API key de OpenAI
api_key = os.getenv("OPENAI_API_KEY")

if not api_key:
    raise ValueError("❌ No se encontró la variable OPENAI_API_KEY en .env")

client = OpenAI(api_key=api_key)

models = client.models.list()

print(f"✅ Conectado correctamente a OpenAI. Total de modelos disponibles: {len(models.data)}")
print("Ejemplo de modelos:")
for m in models.data[:5]:
    print(f" - {m.id}")
