#!/usr/bin/env bash
echo "🔍 Iniciando auditoría del proyecto..."

# 1. Info básica
echo "📁 Directorio actual: $(pwd)"
echo "🧱 Node version: $(node -v)"
echo "📦 PNPM version: $(pnpm -v)"

# 2. Mostrar estructura principal
echo "📂 Estructura del proyecto (nivel 2):"
tree -L 5 -I 'node_modules|dist|.git'
find . -maxdepth 5 -type d | sed 's/[^-][^\/]*\//--/g;s/^/   /'



# 3. Detectar archivos TypeScript con errores
echo "🧪 Verificando errores de compilación TypeScript..."
pnpm tsc --noEmit --pretty || echo "⚠️ Errores de compilación detectados."

# 4. Verificar dependencias faltantes
echo "📦 Buscando dependencias faltantes..."
pnpm install --check-files --prefer-offline --reporter=silent > /dev/null 2>&1
missing=$(pnpm list --depth -1 2>&1 | grep "missing" || true)
if [ -n "$missing" ]; then
  echo "❌ Módulos faltantes:"
  echo "$missing"
else
  echo "✅ Todas las dependencias están presentes."
fi

# 5. Verificar inconsistencias en workspace
echo "🧩 Verificando inconsistencias en el monorepo..."
pnpm dedupe --check

# 6. Analizar scripts y configuraciones clave
echo "⚙️ Scripts definidos en package.json:"
jq '.scripts' package.json

echo "📘 Configuración TypeScript (tsconfig.build.json):"
jq '.compilerOptions' tsconfig.build.json

# 7. Revisar archivos prisma
if [ -d "apps/api/prisma" ]; then
  cd apps/api && npx prisma validate && cd ../..
else
  echo "⚠️ No se encontró carpeta prisma/"
fi


# 8. Revisar variables de entorno
echo "🔐 Variables de entorno necesarias:"
grep -E "^[A-Z_]+=" .env.example 2>/dev/null || echo "⚠️ No se encontró .env.example"

echo "✅ Auditoría completa."
