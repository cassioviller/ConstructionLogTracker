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

# Build da aplicação frontend e backend
RUN NODE_ENV=production npm run build

# Lista os arquivos do diretório dist para debug
RUN ls -la dist && ls -la dist/public || echo "Pasta dist/public não existe"

# Estágio 2: imagem de produção
FROM node:20-alpine as production

WORKDIR /app

# Copiar package.json e instalar apenas dependências de produção
COPY package*.json ./
RUN npm ci --omit=dev --no-optional

# Instalar o vite como dependência regular para evitar erros no runtime
RUN npm install --save vite

# Copiar os arquivos construídos do estágio anterior
COPY --from=builder /app/dist ./dist

# Criar diretórios necessários para uploads e backups
RUN mkdir -p /app/uploads /app/backups && chmod 777 /app/uploads /app/backups

# Variáveis de ambiente para produção
ENV NODE_ENV=production
ENV PORT=5001

# Porta que a aplicação irá escutar
EXPOSE 5001

# Healthcheck para verificar se a aplicação está funcionando
HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
  CMD wget -qO- http://localhost:5001/health || exit 1

# Iniciar a aplicação
CMD ["node", "dist/index.js"]