#!/bin/bash
# Script para backup automático do banco de dados PostgreSQL
# Configurado para rotacionar backups (manter os últimos 7 dias)

# Variáveis de configuração
BACKUP_DIR="/app/backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILENAME="db_backup_$TIMESTAMP.sql.gz"
DAYS_TO_KEEP=7

# Função para verificar se o comando anterior foi executado com sucesso
check_status() {
  if [ $? -ne 0 ]; then
    echo "Erro: $1"
    exit 1
  fi
}

# Criar diretório de backup se não existir
mkdir -p $BACKUP_DIR
check_status "Falha ao criar diretório de backup"

echo "Iniciando backup do banco de dados em $TIMESTAMP"

# Obter variáveis de conexão do ambiente
DB_URL=${DATABASE_URL:-""}

# Verificar se a variável DATABASE_URL existe
if [ -z "$DB_URL" ]; then
  echo "Erro: Variável DATABASE_URL não definida"
  exit 1
fi

# Extrair informações de conexão do DATABASE_URL
# Formato: postgres://usuario:senha@host:porta/banco
if [[ $DB_URL =~ postgres://([^:]+):([^@]+)@([^:]+):([^/]+)/([^?]+) ]]; then
  DB_USER="${BASH_REMATCH[1]}"
  DB_PASS="${BASH_REMATCH[2]}"
  DB_HOST="${BASH_REMATCH[3]}"
  DB_PORT="${BASH_REMATCH[4]}"
  DB_NAME="${BASH_REMATCH[5]}"
else
  echo "Erro: Formato da URL do banco de dados não reconhecido"
  exit 1
fi

# Criar variáveis de ambiente temporárias para pg_dump
export PGPASSWORD="$DB_PASS"

# Executar o backup com compressão
pg_dump -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME | gzip > "$BACKUP_DIR/$BACKUP_FILENAME"
check_status "Falha ao executar backup do banco de dados"

# Limpar variável de senha
unset PGPASSWORD

echo "Backup concluído com sucesso: $BACKUP_FILENAME"

# Remover backups antigos (manter apenas os últimos DAYS_TO_KEEP dias)
find $BACKUP_DIR -name "db_backup_*.sql.gz" -type f -mtime +$DAYS_TO_KEEP -delete
check_status "Falha ao limpar backups antigos"

echo "Backups mais antigos que $DAYS_TO_KEEP dias foram removidos"
echo "---------------------------------------------------"
echo "Backups disponíveis:"
ls -lah $BACKUP_DIR

exit 0