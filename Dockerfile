FROM node:20-alpine as builder

# Definir diretório de trabalho
WORKDIR /app

# Instalar dependências básicas
RUN apk add --no-cache python3 make g++ libc6-compat bash

# Copiar todo o código fonte incluindo arquivos de configuração
COPY . .

# Tornar o script de build executável
RUN chmod +x easypanel-build.sh

# Executar o script de build personalizado
RUN ./easypanel-build.sh

# Estágio 2: imagem de produção
FROM node:20-alpine as production

WORKDIR /app

# Copiar package.json e install apenas dependências de produção
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