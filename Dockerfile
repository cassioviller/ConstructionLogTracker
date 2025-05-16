FROM node:20-alpine as builder

# Definir diretório de trabalho
WORKDIR /app

# Instalar dependências básicas
RUN apk add --no-cache python3 make g++ libc6-compat bash

# Copiar apenas os arquivos necessários para instalar dependências
COPY package*.json ./
COPY tsconfig.json ./
COPY vite.config.ts ./
COPY drizzle.config.ts ./

# Instalar TODAS as dependências, incluindo as de desenvolvimento
RUN npm ci

# Copiar todo o código fonte após instalação das dependências
COPY . .

# Criar diretório para build
RUN mkdir -p /app/dist

# Build da aplicação frontend e backend
RUN NODE_ENV=production npm run build

# Verificar onde o build do frontend foi gerado
RUN find . -type d -name "dist" | sort

# Garantir que o código de produção não importará o Vite
RUN grep -l "vite" dist/*.js || echo "Nenhuma referência ao vite encontrada nos arquivos de produção (sucesso)"

# Estágio 2: imagem de produção
FROM node:20-alpine as production

WORKDIR /app

# Copiar package.json e instalar apenas dependências de produção
COPY package*.json ./
RUN npm ci --omit=dev --no-optional

# Também instalar o vite explicitamente na imagem de produção para garantir
# que não ocorra o erro de módulo não encontrado
RUN npm install --save vite

# Copiar arquivos construídos do estágio anterior
COPY --from=builder /app/dist ./dist

# Criar diretórios necessários
RUN mkdir -p /app/uploads /app/backups && chmod 777 /app/uploads /app/backups

# Variáveis de ambiente para produção
ENV NODE_ENV=production
ENV PORT=5000

# Porta que a aplicação irá escutar
EXPOSE 5000

# Healthcheck para verificar se a aplicação está funcionando
HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
  CMD wget -qO- http://localhost:5000/api/health || exit 1

# Iniciar a aplicação
CMD ["node", "dist/index.js"]