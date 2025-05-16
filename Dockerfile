FROM node:20-slim

# Definir diretório de trabalho
WORKDIR /app

# Instalar ferramentas necessárias (inclui postgresql-client para scripts de inicialização)
RUN apt-get update && apt-get install -y postgresql-client wget curl && rm -rf /var/lib/apt/lists/*

# Copiar arquivos de dependências
COPY package*.json ./

# Instalar dependências
RUN npm ci

# Copiar o restante dos arquivos do projeto
COPY . .

# Tornar o script de entrada executável
RUN chmod +x docker-entrypoint.sh

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
ENV PGUSER=${PGUSER:-obras}
ENV PGPASSWORD=${PGPASSWORD:-obras}
ENV PGDATABASE=${PGDATABASE:-obras}
ENV PGHOST=${PGHOST:-estruturas_diariodeobras}
ENV PGPORT=${PGPORT:-5432}

# Healthcheck para verificar se a aplicação está funcionando
HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
  CMD wget -qO- http://localhost:5002/health || exit 1

# Usar o script de entrada para inicialização
ENTRYPOINT ["./docker-entrypoint.sh"]

# Comando para iniciar a aplicação após o script de entrada
CMD ["npm", "run", "start"]