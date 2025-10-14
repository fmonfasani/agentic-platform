# Fix Summary – 2025-10-14

## Resumen
- React y dependencias de tipado alineadas en la monorepo para Next.js 14 (downgrade a 18.x).
- Helper `forwardToEnacom` centralizado con manejo de errores y rutas API actualizadas.
- Backend valida variables de entorno con Zod, configura CORS dinámico y maneja `OPENAI_API_KEY` faltante.
- Eliminadas dependencias experimentales (`@openai/chatkit`, `openai-agents`) y actualizado Prisma a v6.

## Notas
- Se agregó `.env.example` con las claves mínimas requeridas.
- ChatKit en la UI funciona solo en modo simulado hasta contar con SDK estable.
