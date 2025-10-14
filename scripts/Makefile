# ================================
# AGENTIC PLATFORM AUTOMATION
# ================================

# ================================
# 🧠 Detect environment (WSL vs Git Bash)
# ================================

# Detect if running under WSL
ifeq ($(shell uname -r | grep -i microsoft),)
    ENVIRONMENT := bash
else
    ENVIRONMENT := wsl
endif

# Choose Python executable accordingly
ifeq ($(ENVIRONMENT),wsl)
    PYTHON := python3
else
    PYTHON := python
endif

# Log info
$(info 🧠 Entorno detectado: $(ENVIRONMENT))
$(info 🐍 Usando intérprete: $(PYTHON))


# Variables
BACKEND_DIR := scripts/agentic_autopilot/loops/backend
API_DIR := apps/api
WEB_DIR := apps/web

# ================================
# Base targets
# ================================

help:
	@echo "🧠 Available commands:"
	@echo "  make repair-backend      → Ejecuta los agentes que reparan el backend"
	@echo "  make repair-web          → Ejecuta los agentes que reparan el frontend"
	@echo "  make diagnostics          → Corre diagnósticos generales del sistema"
	@echo "  make start-api            → Levanta el backend NestJS"
	@echo "  make start-web            → Levanta el frontend Next.js"
	@echo "  make test-backend         → Ejecuta los tests del backend"

# ================================
# Repair routines
# ================================

fix-back:
	@echo "🛠 Ejecutando agentes de reparación del backend..."
	@$(PYTHON) $(BACKEND_DIR)/repair_loop_api.py
	@$(PYTHON) $(BACKEND_DIR)/repair_loop_db.py
	@$(PYTHON) $(BACKEND_DIR)/repair_loop_docs.py
	@$(PYTHON) $(BACKEND_DIR)/repair_loop_master.py
	@echo "✅ Backend reparado con éxito."

fix-web:
	@echo "🧩 Ejecutando agentes de reparación del frontend..."
	@$(PYTHON) scripts/agentic_autopilot/loops/frontend/repair_loop_web_v0.4.py
	@echo "✅ Frontend reparado con éxito."

diagnostics:
	@echo "🔍 Ejecutando diagnóstico general..."
	@$(PYTHON) scripts/agent-diagnostics.ts || echo "Node diagnostic script fallback"
	@echo "✅ Diagnóstico completado."

# ================================
# Run targets
# ================================

start-api:
	cd $(API_DIR) && pnpm start

start-web:
	cd $(WEB_DIR) && pnpm dev

test-backend:
	cd $(API_DIR) && pnpm test


# ===============================
# 🧠 GIT AUTOPILOT MODULE
# ===============================
GIT_AGENT_DIR := ./agentic_autopilot/agents/git_agent
## 🔍 Diagnóstico del estado del repositorio
git-auto:

	@echo " Ejecutando  diagnositico de git y viendo soluciones"
	@$(PYTHON) $(GIT_AGENT_DIR)/git_autopilot.py

git-di:
	@echo "🔍 Ejecutando diagnóstico de Git..."
	@python3 $(GIT_AGENT_DIR)/git_health.py

## 🔧 Reparación automática (fetch, merge, rebase, push)
repair-git:
	@echo "🧠 Ejecutando reparación de Git..."
	@python3 $(GIT_AGENT_DIR)/git_repair.py

## 🧾 Generar reporte Markdown de estado del repositorio
report-git:
	@echo "📄 Generando reporte de Git..."
	@python3 $(GIT_AGENT_DIR)/git_status_reporter.py

## 🤖 Commit automático con IA (si OPENAI_API_KEY está configurada)
ai-commit:
	@echo "🤖 Generando mensaje de commit con IA..."
	@DIFF="$$(git diff --cached)" && \
	python3 -c "from agentic_autopilot.git_agent.git_commit_ai import ai_commit_message; \
	print(ai_commit_message('''$$DIFF'''))"
