#!/bin/bash
# Script para construir a aplicação no EasyPanel

# Navegar para o diretório da aplicação
cd /app

# Garantir que node e npm estejam instalados
echo "Verificando ferramentas de desenvolvimento..."
command -v node >/dev/null 2>&1 || { echo "Node.js não encontrado. Instalando..."; apk add --no-cache nodejs npm; }

# Instalar dependências de compilação
echo "Instalando dependências..."
apk add --no-cache python3 make g++ libc6-compat

# Instalar dependências incluindo devDependencies
echo "Instalando todas as dependências..."
npm ci

# Construir a aplicação
echo "Construindo a aplicação..."
npm run build

# Verificar se build foi bem-sucedido
if [ ! -d "dist" ]; then
  echo "Falha na construção: diretório dist não encontrado"
  exit 1
fi

# Verificar se arquivos críticos existem
if [ ! -f "dist/index.js" ]; then
  echo "Falha na construção: arquivo dist/index.js não encontrado"
  exit 1
fi

# Copiar assets importantes se necessário
echo "Copiando assets adicionais..."
if [ -d "dist/assets" ] && [ ! -d "dist/assets/static" ]; then
  mkdir -p dist/assets/static
  cp -r dist/assets/* dist/assets/static/
fi

# Instalar apenas dependências de produção para a imagem final
echo "Instalando apenas dependências de produção..."
rm -rf node_modules
npm ci --omit=dev

echo "Build concluído com sucesso!"
exit 0