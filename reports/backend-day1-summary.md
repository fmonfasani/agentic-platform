# Backend · Día 1

## Entregables

- **Sincronización del esquema Prisma y semillas iniciales**: ejecutar `pnpm -C apps/api seed` aplica el esquema actual con `prisma db push` y carga los datos de referencia definidos en [`apps/api/prisma/seed.ts`](../apps/api/prisma/seed.ts).
- **Reporte de pruebas E2E**: ejecutar `pnpm -C apps/api test:report` corre la suite de Jest y guarda el resultado en [`reports/tests-day1.md`](./tests-day1.md).

## Cómo ejecutar los scripts

1. Asegurate de tener las variables de entorno del backend configuradas (`apps/api/.env`).
2. Desde la raíz del monorepo:
   - Sincronizá la base de datos y semillas con:
     ```bash
     pnpm -C apps/api seed
     ```
   - Generá el reporte de pruebas con:
     ```bash
     pnpm -C apps/api test:report
     ```
3. Revisá los artefactos generados:
   - Datos sembrados: [`apps/api/prisma/seed.ts`](../apps/api/prisma/seed.ts)
   - Resultado de las pruebas: [`reports/tests-day1.md`](./tests-day1.md)
