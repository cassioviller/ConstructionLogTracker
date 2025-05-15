FROM node:20-alpine as builder

# Definir diretório de trabalho
WORKDIR /app

# Instalar dependências necessárias para build
RUN apk add --no-cache python3 make g++ libc6-compat

# Copiar arquivos de dependências
COPY package*.json ./

# Instalar dependências
RUN npm ci

# Copiar código fonte
COPY . .

# Construir a aplicação
RUN npm run build

# Estágio 2: imagem de produção
FROM node:20-alpine as production

WORKDIR /app

# Instalar apenas dependências de produção
COPY package*.json ./
RUN npm ci --omit=dev

# Copiar arquivos construídos do estágio anterior
COPY --from=builder /app/dist ./dist

# Cria diretório para uploads
RUN mkdir -p /app/uploads && chmod 777 /app/uploads

# Variáveis de ambiente para produção
ENV NODE_ENV=production
ENV PORT=5000
ENV DATABASE_URL=postgres://obras:obras@estruturas_diariodeobras:5432/obras?sslmode=disable
ENV SESSION_SECRET=diario-de-obra-session-secret-production

# Porta que a aplicação irá escutar
EXPOSE 5000

# Healthcheck para verificar se a aplicação está funcionando
HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
  CMD wget -qO- http://localhost:5000/health || exit 1

# Iniciar a aplicação
CMD ["node", "dist/index.js"]