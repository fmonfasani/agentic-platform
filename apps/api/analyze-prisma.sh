#!/usr/bin/env bash
set -e

echo "─────────────────────────────────────────────"
echo "🧩 ANALIZADOR DE ENTORNO PRISMA (by Fede Tool)"
echo "─────────────────────────────────────────────"
echo

# 1️⃣ Verificar ubicación actual
echo "📂 Directorio actual:"
pwd
echo

# 2️⃣ Detectar .env y contenido relevante
echo "🔍 Archivo .env detectado:"
if [ -f ".env" ]; then
  grep DATABASE_URL .env || echo "(No tiene DATABASE_URL)"
else
  echo "⚠️  No se encontró .env"
fi
echo

# 3️⃣ Mostrar datasource del schema
echo "📘 Datasource en prisma/schema.prisma:"
grep -A 5 "datasource" prisma/schema.prisma
echo

# 4️⃣ Ejecutar prisma debug para ver ruta exacta del dev.db
echo "🧭 Ruta real que Prisma está usando:"
pnpm exec prisma debug | grep "file:" || echo "⚠️  No se pudo obtener información del datasource"
echo

# 5️⃣ Mostrar todas las bases dev.db existentes
echo "📂 Buscando archivos dev.db en el monorepo..."
find ../../.. -name "dev.db" 2>/dev/null || echo "(No se encontró ningún dev.db)"
echo

# 6️⃣ Probar conexión con Prisma Client
echo "🧠 Probando conexión y conteo de registros..."
node - <<'EOF'
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
(async () => {
  try {
    const count = await prisma.agent.count();
    console.log(`✅ Prisma conectado. Registros en Agent: ${count}`);
  } catch (err) {
    console.error("❌ Error al consultar Agent:", err.message);
  } finally {
    await prisma.$disconnect();
  }
})();
EOF
echo

# 7️⃣ Verificar rutas relativas dentro de prisma/
echo "🧱 Contenido del directorio prisma/"
ls -R prisma || echo "(No existe carpeta prisma)"
echo

# 8️⃣ Resumen
echo "─────────────────────────────────────────────"
echo "📊 RESUMEN:"
echo "• Si hay más de un dev.db → Prisma y Seed usan distintas rutas"
echo "• Si count = 0 → el seed no insertó o lo hizo en otra base"
echo "• Si 'no such table' → dev.db vacío o schema no aplicado"
echo "─────────────────────────────────────────────"
echo "Fin del análisis 🚀"
