#!/bin/bash

# Script para backup do banco de dados PostgreSQL
# Deve ser colocado em um cron para execução regular

# Configurações
BACKUP_DIR="/backup"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
PGUSER="obras"
PGPASSWORD="obras"
PGDATABASE="obras"
PGHOST="localhost"
PGPORT="5432"

# Garante que o diretório exista
mkdir -p $BACKUP_DIR

# Arquivo de backup
BACKUP_FILE="$BACKUP_DIR/db_backup_$TIMESTAMP.sql"

# Realiza o backup
echo "Iniciando backup do banco de dados em $TIMESTAMP..."
export PGPASSWORD=$PGPASSWORD
pg_dump -h $PGHOST -p $PGPORT -U $PGUSER -d $PGDATABASE -F p > $BACKUP_FILE

# Verifica se o backup foi bem-sucedido
if [ $? -eq 0 ]; then
  echo "Backup realizado com sucesso: $BACKUP_FILE"
  
  # Compacta o arquivo
  gzip $BACKUP_FILE
  echo "Arquivo compactado: $BACKUP_FILE.gz"
  
  # Remover backups antigos (manter apenas os últimos 7)
  find $BACKUP_DIR -name "db_backup_*.sql.gz" -type f -mtime +7 -delete
  echo "Backups mais antigos que 7 dias foram removidos."
else
  echo "Erro ao realizar o backup."
  exit 1
fi

echo "Processo de backup concluído."