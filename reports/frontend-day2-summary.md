# Frontend Dashboard – Día 2

## Insights clave
- El panel `/agents` responde correctamente mostrando filtros de búsqueda, ordenamiento y categorías derivadas de `agentGroups`.
- La tarjeta del agente presenta métricas de uso (usos, descargas, recompensas, puntuación) y guía al usuario hacia el doble clic para abrir el modal.
- El modal despliega información extendida (descripción, KPIs operativos, capacidades y trazas recientes) confirmando que el dashboard comunica el estado del agente de forma completa.

## Riesgos y oportunidades
- Las métricas dependen de endpoints externos (`/agents/:id`, `/metrics`, `/traces`); en ausencia de backend real se requiere mocking en tests.
- Sumar pruebas para acciones del modal (ejecución, recompensas) ayudaría a cubrir flujos críticos del dashboard.
- Documentar los valores esperados de métricas facilitaría detectar discrepancias con datos reales en futuras integraciones.
