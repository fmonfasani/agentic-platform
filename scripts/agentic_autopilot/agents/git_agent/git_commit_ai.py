import os
from openai import OpenAI

def ai_commit_message(diff: str) -> str:
    """Genera un mensaje de commit con IA a partir de un diff."""
    client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
    prompt = f"Resume el siguiente diff en un mensaje de commit profesional y claro:\\n\\n{diff}"
    resp = client.chat.completions.create(model="gpt-4o-mini", messages=[{"role": "user", "content": prompt}])
    return resp.choices[0].message.content.strip()
