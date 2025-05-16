FROM node:20-slim

# Definir diretório de trabalho
WORKDIR /app

# Instalar ferramentas necessárias (inclui postgresql-client para conexão com banco)
RUN apt-get update && apt-get install -y postgresql-client wget curl && rm -rf /var/lib/apt/lists/*

# Copiar arquivos de dependências
COPY package*.json ./

# Instalar todas as dependências
RUN npm ci

# Copiar o restante dos arquivos do projeto
COPY . .

# Verificar se existe o script de entrada e torná-lo executável
RUN if [ -f docker-entrypoint.sh ]; then chmod +x docker-entrypoint.sh; fi

# Executar o build da aplicação
RUN npm run build

# Criar diretórios necessários para uploads e backups
RUN mkdir -p /app/uploads /app/backups && chmod 777 /app/uploads /app/backups

# Expor a porta utilizada pelo aplicativo
EXPOSE 5002

# Valores padrão para variáveis de ambiente
ENV DATABASE_URL=${DATABASE_URL:-postgres://obras:obras@estruturas_diariodeobras:5432/obras?sslmode=disable}
ENV NODE_ENV=${NODE_ENV:-production}
ENV PORT=${PORT:-5002}
ENV SESSION_SECRET=${SESSION_SECRET:-diario-de-obra-session-secret-production}

# Healthcheck para verificar se a aplicação está funcionando
HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
  CMD wget -qO- http://localhost:5002/health || exit 1

# Comando para iniciar a aplicação
CMD ["npm", "run", "start"]